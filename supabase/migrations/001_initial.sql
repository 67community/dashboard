-- ── 67 Mission Control — Initial Schema ─────────────────────────────────────

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  TEXT,
  priority     TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent','High','Medium','Low')),
  category     TEXT NOT NULL DEFAULT 'Other'  CHECK (category IN ('Website','Discord','Content','Token','Merch','Design','Other')),
  column       TEXT NOT NULL DEFAULT 'Backlog' CHECK (column IN ('Backlog','Todo','In Progress','Review','Done')),
  due_date     DATE,
  position     INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id   TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  done      BOOLEAN DEFAULT FALSE,
  position  INTEGER DEFAULT 0
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id    TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id   TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  actor_id  TEXT NOT NULL,
  action    TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task  ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_task  ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_task  ON activity(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column   ON tasks(column);

-- Enable Row Level Security
ALTER TABLE tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity  ENABLE ROW LEVEL SECURITY;

-- RLS Policies — allow all for anon (team-only site, auth comes later)
CREATE POLICY "allow_all_tasks"     ON tasks     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_subtasks"  ON subtasks  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_comments"  ON comments  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activity"  ON activity  FOR ALL USING (true) WITH CHECK (true);

-- ── Seed: Default Tasks from mock data ───────────────────────────────────────
INSERT INTO tasks (id, title, priority, category, column, due_date, position) VALUES
  ('t_seed_1', 'Redesign Mission Control dashboard', 'Urgent', 'Website',  'In Progress', '2026-03-01', 1),
  ('t_seed_2', 'Set up Supabase database',           'High',   'Website',  'Todo',        '2026-03-02', 1),
  ('t_seed_3', 'Discord growth campaign — Phase 1',  'High',   'Discord',  'Todo',        '2026-03-07', 2),
  ('t_seed_4', 'X Raid automation — session refresh','Medium', 'Content',  'Backlog',     NULL,         1),
  ('t_seed_5', '67 merch store setup',               'Medium', 'Merch',    'Backlog',     NULL,         2)
ON CONFLICT (id) DO NOTHING;

-- Realtime: enable for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
