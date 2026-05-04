-- ============================================================
-- SPOKE — Initial Schema
-- Run this in Supabase SQL editor (Project → SQL Editor)
-- ============================================================

-- UUID support (already available in Supabase by default)
create extension if not exists "uuid-ossp";

-- ============================================================
-- CORE TABLES
-- ============================================================

create table if not exists public.societies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  city       text,
  plan       text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now()
);
comment on table public.societies is 'One row per HOA / housing society';

create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default 'New Member',
  phone       text,
  role        text not null default 'resident' check (role in ('resident', 'board', 'guard')),
  society_id  uuid references public.societies(id) on delete set null,
  unit_number text,
  avatar      text,       -- 2-char initials, e.g. "AR"
  onboarded   boolean not null default false,
  dues_status text not null default 'paid' check (dues_status in ('paid', 'unpaid', 'overdue')),
  created_at  timestamptz not null default now()
);
comment on table public.users is 'Extended profile — extends auth.users 1-to-1';

create table if not exists public.complaints (
  id          uuid primary key default gen_random_uuid(),
  society_id  uuid not null references public.societies(id) on delete cascade,
  created_by  uuid references public.users(id) on delete set null,
  unit_number text,
  resident    text,       -- denormalized for fast reads
  avatar      text,
  title       text not null default '',
  transcript  text not null default '',
  category    text not null default 'General',
  icon        text not null default 'report_problem',
  color       text not null default '#94A3B8',
  priority    text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status      text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Resolved', 'Dismissed')),
  assigned_to uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.complaints is 'Resident complaints filed via voice or text';

create table if not exists public.complaint_logs (
  id           uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  action       text not null check (action in ('created', 'assigned', 'status_changed', 'note_added', 'resolved')),
  performed_by uuid references public.users(id) on delete set null,
  note         text,
  old_value    text,
  new_value    text,
  created_at   timestamptz not null default now()
);
comment on table public.complaint_logs is 'Full audit trail for every complaint action';

create table if not exists public.dues (
  id          uuid primary key default gen_random_uuid(),
  society_id  uuid not null references public.societies(id) on delete cascade,
  user_id     uuid references public.users(id) on delete set null,
  unit_number text not null,
  amount      numeric(10,2) not null,
  period      text not null,   -- e.g. "May 2026"
  due_date    date not null,
  status      text not null default 'unpaid' check (status in ('paid', 'unpaid', 'overdue')),
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
comment on table public.dues is 'Monthly maintenance dues per unit';

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  due_id         uuid not null references public.dues(id) on delete cascade,
  user_id        uuid references public.users(id) on delete set null,
  amount         numeric(10,2) not null,
  method         text not null default 'manual' check (method in ('card', 'upi', 'cash', 'manual', 'stripe')),
  status         text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  receipt_number text unique,
  created_at     timestamptz not null default now()
);
comment on table public.payments is 'Payment records for dues';

create table if not exists public.gate_logs (
  id           uuid primary key default gen_random_uuid(),
  society_id   uuid not null references public.societies(id) on delete cascade,
  type         text not null check (type in ('Guest', 'Package', 'Delivery', 'Vehicle', 'Staff')),
  description  text not null default '',
  unit_number  text,
  phone        text,
  vehicle      text,
  note         text,
  status       text not null default 'Logged',
  approved_by  uuid references public.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
comment on table public.gate_logs is 'Gate visitor and delivery log';

create table if not exists public.notices (
  id           uuid primary key default gen_random_uuid(),
  society_id   uuid not null references public.societies(id) on delete cascade,
  created_by   uuid references public.users(id) on delete set null,
  title        text not null,
  body         text not null,
  recipients   text not null default 'all',   -- 'all' or unit number
  created_at   timestamptz not null default now()
);
comment on table public.notices is 'Board notices sent to residents';

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists complaints_society_id_idx      on public.complaints(society_id);
create index if not exists complaints_created_by_idx      on public.complaints(created_by);
create index if not exists complaints_status_idx          on public.complaints(status);
create index if not exists complaints_created_at_idx      on public.complaints(created_at desc);
create index if not exists complaint_logs_complaint_idx   on public.complaint_logs(complaint_id);
create index if not exists complaint_logs_created_at_idx  on public.complaint_logs(created_at desc);
create index if not exists dues_society_id_idx            on public.dues(society_id);
create index if not exists dues_user_id_idx               on public.dues(user_id);
create index if not exists dues_status_idx                on public.dues(status);
create index if not exists gate_logs_society_id_idx       on public.gate_logs(society_id);
create index if not exists gate_logs_created_at_idx       on public.gate_logs(created_at desc);
create index if not exists users_society_id_idx           on public.users(society_id);
create index if not exists users_phone_idx                on public.users(phone);

-- ============================================================
-- AUTO updated_at TRIGGER
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
  before update on public.complaints
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New Member'),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.societies      enable row level security;
alter table public.users          enable row level security;
alter table public.complaints     enable row level security;
alter table public.complaint_logs enable row level security;
alter table public.dues           enable row level security;
alter table public.payments       enable row level security;
alter table public.gate_logs      enable row level security;
alter table public.notices        enable row level security;

-- Helper: current user's society_id (cached per query)
create or replace function public.my_society_id()
returns uuid language sql security definer stable as $$
  select society_id from public.users where id = auth.uid() limit 1
$$;

-- Helper: current user's role
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid() limit 1
$$;

-- SOCIETIES
drop policy if exists "users_see_own_society"  on public.societies;
create policy "users_see_own_society"
  on public.societies for select
  using (id = public.my_society_id());

-- USERS
drop policy if exists "users_see_society_members" on public.users;
create policy "users_see_society_members"
  on public.users for select
  using (society_id = public.my_society_id() or id = auth.uid());

drop policy if exists "users_update_own_profile" on public.users;
create policy "users_update_own_profile"
  on public.users for update
  using (id = auth.uid());

drop policy if exists "users_insert_own_profile" on public.users;
create policy "users_insert_own_profile"
  on public.users for insert
  with check (id = auth.uid());

-- COMPLAINTS
drop policy if exists "society_members_read_complaints" on public.complaints;
create policy "society_members_read_complaints"
  on public.complaints for select
  using (society_id = public.my_society_id());

drop policy if exists "residents_create_complaints" on public.complaints;
create policy "residents_create_complaints"
  on public.complaints for insert
  with check (
    society_id = public.my_society_id()
    and created_by = auth.uid()
  );

drop policy if exists "board_updates_complaints" on public.complaints;
create policy "board_updates_complaints"
  on public.complaints for update
  using (
    society_id = public.my_society_id()
    and public.my_role() in ('board', 'resident')
  );

-- COMPLAINT LOGS
drop policy if exists "society_members_read_complaint_logs" on public.complaint_logs;
create policy "society_members_read_complaint_logs"
  on public.complaint_logs for select
  using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.my_society_id()
    )
  );

drop policy if exists "authenticated_create_complaint_logs" on public.complaint_logs;
create policy "authenticated_create_complaint_logs"
  on public.complaint_logs for insert
  with check (
    performed_by = auth.uid()
    and exists (
      select 1 from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.my_society_id()
    )
  );

-- DUES: residents see own, board sees all
drop policy if exists "dues_select" on public.dues;
create policy "dues_select"
  on public.dues for select
  using (
    society_id = public.my_society_id()
    and (user_id = auth.uid() or public.my_role() = 'board')
  );

drop policy if exists "board_manage_dues" on public.dues;
create policy "board_manage_dues"
  on public.dues for all
  using (
    society_id = public.my_society_id()
    and public.my_role() = 'board'
  );

-- PAYMENTS
drop policy if exists "payments_select" on public.payments;
create policy "payments_select"
  on public.payments for select
  using (user_id = auth.uid() or public.my_role() = 'board');

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert"
  on public.payments for insert
  with check (user_id = auth.uid());

-- GATE LOGS
drop policy if exists "society_members_read_gate_logs" on public.gate_logs;
create policy "society_members_read_gate_logs"
  on public.gate_logs for select
  using (society_id = public.my_society_id());

drop policy if exists "board_guard_create_gate_logs" on public.gate_logs;
create policy "board_guard_create_gate_logs"
  on public.gate_logs for insert
  with check (
    society_id = public.my_society_id()
    and public.my_role() in ('board', 'guard')
  );

-- NOTICES
drop policy if exists "society_members_read_notices" on public.notices;
create policy "society_members_read_notices"
  on public.notices for select
  using (society_id = public.my_society_id());

drop policy if exists "board_creates_notices" on public.notices;
create policy "board_creates_notices"
  on public.notices for insert
  with check (
    society_id = public.my_society_id()
    and public.my_role() = 'board'
  );
