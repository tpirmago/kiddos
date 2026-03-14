-- ============================================================
-- KiddoQuest — Supabase schema
-- Run this in the Supabase SQL editor (Database → SQL Editor)
-- ============================================================

-- ── children ─────────────────────────────────────────────────
create table if not exists children (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  hero       text not null check (hero in ('fox','frog','cat','panda','tiger')),
  created_at timestamptz not null default now()
);

alter table children enable row level security;

create policy "Users manage own children"
  on children for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── chores ───────────────────────────────────────────────────
create table if not exists chores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  created_at timestamptz not null default now()
);

alter table chores enable row level security;

create policy "Users manage own chores"
  on chores for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── rewards ──────────────────────────────────────────────────
create table if not exists rewards (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title   text not null
);

alter table rewards enable row level security;

create policy "Users manage own rewards"
  on rewards for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── progress ─────────────────────────────────────────────────
create table if not exists progress (
  id        uuid primary key default gen_random_uuid(),
  child_id  uuid not null references children(id) on delete cascade,
  chore_id  uuid not null references chores(id)   on delete cascade,
  date      date not null,
  completed boolean not null default true,
  -- one record per child + chore + day
  unique (child_id, chore_id, date)
);

alter table progress enable row level security;

-- Parents can read/write progress for their own children
create policy "Parents manage progress for own children"
  on progress for all
  using (
    exists (
      select 1 from children c
      where c.id = progress.child_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from children c
      where c.id = progress.child_id
        and c.user_id = auth.uid()
    )
  );

-- ── indexes ───────────────────────────────────────────────────
create index if not exists progress_child_date on progress(child_id, date);
