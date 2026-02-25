-- 67 Mission Control — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- ── Tasks ───────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  assignee_id text,
  priority    text not null default 'Medium'
              check (priority in ('Low','Medium','High','Urgent')),
  category    text not null default 'Other'
              check (category in ('Website','Discord','Content','Token','Merch','Design','Other')),
  column      text not null default 'Backlog'
              check (column in ('Backlog','Todo','In Progress','Review','Done')),
  due_date    text,
  created_at  timestamptz not null default now(),
  position    integer default 0
);

-- ── Subtasks ─────────────────────────────────────────────────────────────────
create table if not exists subtasks (
  id       text primary key default gen_random_uuid()::text,
  task_id  text not null references tasks(id) on delete cascade,
  title    text not null,
  done     boolean not null default false,
  position integer default 0
);

-- ── Comments ─────────────────────────────────────────────────────────────────
create table if not exists comments (
  id         text primary key default gen_random_uuid()::text,
  task_id    text not null references tasks(id) on delete cascade,
  author_id  text not null,
  text       text not null,
  created_at timestamptz not null default now()
);

-- ── Activity log ─────────────────────────────────────────────────────────────
create table if not exists activity (
  id         text primary key default gen_random_uuid()::text,
  task_id    text not null references tasks(id) on delete cascade,
  actor_id   text not null,
  action     text not null,
  timestamp  timestamptz not null default now()
);

-- ── Enable Realtime ──────────────────────────────────────────────────────────
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table subtasks;
alter publication supabase_realtime add table comments;

-- ── Row Level Security (public read/write for now — tighten later) ───────────
alter table tasks    enable row level security;
alter table subtasks enable row level security;
alter table comments enable row level security;
alter table activity enable row level security;

create policy "Public access" on tasks    for all using (true) with check (true);
create policy "Public access" on subtasks for all using (true) with check (true);
create policy "Public access" on comments for all using (true) with check (true);
create policy "Public access" on activity for all using (true) with check (true);

-- ── Seed with initial tasks ──────────────────────────────────────────────────
insert into tasks (id, title, description, assignee_id, priority, category, column, due_date, created_at, position) values
  ('t1','Redesign Mission Control dashboard','Rebuild with Next.js + Tailwind. Light theme, Apple meets Notion.','oscar','Urgent','Website','In Progress','2026-03-01',now(),1),
  ('t2','Set up Supabase database','Configure Supabase for tasks, team members, and real-time.','oscar','High','Website','Todo','2026-03-02',now(),1),
  ('t3','Discord growth campaign — Phase 1','Daily GM check-in, Meme Monday, Game Night rituals.','crispy','High','Discord','Todo','2026-03-07',now(),2),
  ('t4','X Raid automation — session refresh','Add fresh sessions to maintain 100+ active raid accounts.','oscar','Medium','Content','Backlog',null,now(),1),
  ('t5','67 merch store setup','Research Shopify or Printful for 67 branded merch.','brandon','Medium','Merch','Backlog',null,now(),2),
  ('t6','Bybit listing follow-up','Follow up with Bybit on listing application status.','jamie','High','Token','Review','2026-02-28',now(),1),
  ('t7','Weekly community report — Feb 25','Compile weekly stats: members, engagement, top posts.','crispy','Low','Content','Done',null,now(),1)
on conflict (id) do nothing;

insert into subtasks (id, task_id, title, done, position) values
  ('s1','t1','Setup Next.js project',true,1),
  ('s2','t1','Build card components',true,2),
  ('s3','t1','Build Kanban board',false,3),
  ('s4','t1','Connect APIs',false,4),
  ('s5','t2','Create Supabase project',false,1),
  ('s6','t2','Set up tables (tasks, members, milestones)',false,2),
  ('s7','t2','Configure RLS policies',false,3),
  ('s8','t3','Set up MEE6 XP leveling',false,1),
  ('s9','t3','Create #gm-check-in channel',false,2),
  ('s10','t3','Schedule Meme Monday posts',false,3)
on conflict (id) do nothing;
