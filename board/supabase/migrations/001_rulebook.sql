-- Rulebook PDFs (one per upload)
create table if not exists rulebook_pdfs (
  id             uuid primary key default gen_random_uuid(),
  society_id     uuid not null references societies(id) on delete cascade,
  uploaded_by    uuid not null references auth.users(id),
  file_name      text not null,
  storage_path   text not null,
  status         text not null default 'uploaded' check (status in ('uploaded','parsing','parsed','failed')),
  error_message  text,
  total_rules    int,
  flagged_count  int,
  parsed_at      timestamptz,
  created_at     timestamptz not null default now()
);

-- Sections extracted from each PDF
create table if not exists rulebook_sections (
  id          uuid primary key default gen_random_uuid(),
  pdf_id      uuid not null references rulebook_pdfs(id) on delete cascade,
  society_id  uuid not null references societies(id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now()
);

-- Individual rules
create table if not exists rulebook_rules (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references rulebook_sections(id) on delete cascade,
  society_id  uuid not null references societies(id) on delete cascade,
  text        text not null,
  rule_number text,
  flagged     boolean not null default false,
  flag_reason text,
  status      text not null default 'approved' check (status in ('approved','needs_review','rejected')),
  created_at  timestamptz not null default now()
);

-- Maintenance tickets
create table if not exists maintenance_tickets (
  id          uuid primary key default gen_random_uuid(),
  society_id  uuid not null references societies(id) on delete cascade,
  created_by  uuid not null references auth.users(id),
  title       text not null,
  description text,
  priority    text not null default 'Medium' check (priority in ('High','Medium','Low')),
  location    text,
  status      text not null default 'Open' check (status in ('Open','In Progress','Resolved')),
  created_at  timestamptz not null default now()
);

-- RLS
alter table rulebook_pdfs       enable row level security;
alter table rulebook_sections   enable row level security;
alter table rulebook_rules      enable row level security;
alter table maintenance_tickets enable row level security;

-- Board members can read/write their society's data
create policy "board_rulebook_pdfs" on rulebook_pdfs
  using (society_id in (select society_id from users where id = auth.uid() and role = 'board'))
  with check (society_id in (select society_id from users where id = auth.uid() and role = 'board'));

create policy "board_rulebook_sections" on rulebook_sections
  using (society_id in (select society_id from users where id = auth.uid() and role = 'board'))
  with check (society_id in (select society_id from users where id = auth.uid() and role = 'board'));

create policy "board_rulebook_rules" on rulebook_rules
  using (society_id in (select society_id from users where id = auth.uid() and role = 'board'))
  with check (society_id in (select society_id from users where id = auth.uid() and role = 'board'));

-- Residents can read approved rules
create policy "resident_read_rules" on rulebook_rules
  for select
  using (
    status = 'approved' and
    society_id in (select society_id from users where id = auth.uid())
  );

create policy "board_maintenance_tickets" on maintenance_tickets
  using (society_id in (select society_id from users where id = auth.uid() and role = 'board'))
  with check (society_id in (select society_id from users where id = auth.uid() and role = 'board'));

-- Supabase Storage bucket (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('rulebooks', 'rulebooks', false);

-- Storage RLS: board members can upload/download their society's files
-- create policy "board_upload" on storage.objects for insert
--   with check (bucket_id = 'rulebooks' and auth.uid() in (select id from users where role = 'board'));
-- create policy "board_download" on storage.objects for select
--   using (bucket_id = 'rulebooks' and auth.uid() in (select id from users where role = 'board'));
