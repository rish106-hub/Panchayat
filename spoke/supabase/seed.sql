-- ============================================================
-- SPOKE — Seed Data (demo society + residents)
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Demo society
insert into public.societies (id, name, address, city, plan)
values (
  '00000000-0000-0000-0000-000000000001',
  'Maple Heights HOA',
  '123 Maple Street',
  'San Francisco',
  'pro'
) on conflict (id) do nothing;

-- NOTE: user rows are created by the auth trigger on signup.
-- To seed demo users you must first create them via Supabase Auth
-- (Dashboard → Authentication → Users → Add user) then update
-- their profiles here:
--
-- update public.users set
--   name = 'Alex Rivera',
--   role = 'resident',
--   society_id = '00000000-0000-0000-0000-000000000001',
--   unit_number = '4B',
--   avatar = 'AR',
--   onboarded = true,
--   dues_status = 'paid'
-- where id = '<auth_user_id>';
--
-- See README for full onboarding flow.

-- Demo complaints (reference the demo society; created_by can be null for seed)
insert into public.complaints
  (id, society_id, created_by, unit_number, resident, avatar, transcript, category, icon, color, priority, status, created_at)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    null,
    '3A', 'Maria Santos', 'MS',
    'There is a water leak under the kitchen sink. Water is dripping steadily and I am worried about the cabinet floor getting damaged. Please send maintenance as soon as possible.',
    'Plumbing', 'plumbing', '#6366F1', 'High', 'In Progress',
    now() - interval '2 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    null,
    '7C', 'James Kim', 'JK',
    'The elevator has been out of service since yesterday morning. Residents on upper floors are having difficulty, especially elderly neighbors.',
    'Elevator', 'elevator', '#8B5CF6', 'High', 'Pending',
    now() - interval '18 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    null,
    '4B', 'Alex Rivera', 'AR',
    'Loud music from unit 5B starting around midnight. Has happened three nights in a row. The bass is really shaking the walls.',
    'Noise', 'volume_up', '#EF4444', 'Medium', 'Resolved',
    now() - interval '3 days'
  )
on conflict (id) do nothing;

-- Seed complaint logs for the demo complaints
insert into public.complaint_logs (complaint_id, action, note, created_at)
values
  ('10000000-0000-0000-0000-000000000001', 'created',        'Complaint received via voice',   now() - interval '2 hours'),
  ('10000000-0000-0000-0000-000000000001', 'status_changed', 'Assigned to maintenance team',   now() - interval '1 hour'),
  ('10000000-0000-0000-0000-000000000002', 'created',        'Complaint received via voice',   now() - interval '18 hours'),
  ('10000000-0000-0000-0000-000000000003', 'created',        'Complaint received via voice',   now() - interval '3 days'),
  ('10000000-0000-0000-0000-000000000003', 'resolved',       'Resident confirmed resolution',  now() - interval '1 day')
on conflict do nothing;

-- Demo dues (May 2026)
insert into public.dues
  (society_id, unit_number, amount, period, due_date, status)
values
  ('00000000-0000-0000-0000-000000000001', '4B', 320, 'May 2026', '2026-05-31', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '3A', 320, 'May 2026', '2026-05-31', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '7C', 320, 'May 2026', '2026-05-31', 'overdue'),
  ('00000000-0000-0000-0000-000000000001', '2A', 320, 'May 2026', '2026-05-31', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '5C', 320, 'May 2026', '2026-05-31', 'overdue'),
  ('00000000-0000-0000-0000-000000000001', '1B', 320, 'May 2026', '2026-05-31', 'unpaid'),
  ('00000000-0000-0000-0000-000000000001', '6A', 320, 'May 2026', '2026-05-31', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '8D', 320, 'May 2026', '2026-05-31', 'overdue'),
  ('00000000-0000-0000-0000-000000000001', '9A', 320, 'May 2026', '2026-05-31', 'unpaid'),
  ('00000000-0000-0000-0000-000000000001', '2C', 320, 'May 2026', '2026-05-31', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '5A', 320, 'May 2026', '2026-05-31', 'overdue'),
  ('00000000-0000-0000-0000-000000000001', '3C', 320, 'May 2026', '2026-05-31', 'paid')
on conflict do nothing;
