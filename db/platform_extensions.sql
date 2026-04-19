-- =============================================================================
-- UPSC platform — extend YOUR existing Supabase schema
-- You already have: articles, courses, lessons, profiles, purchases
-- This adds: test_series, mcqs, student_responses + purchase rules + RLS helpers
-- Run the whole script in Supabase → SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Test series (sell tests / group MCQs)
-- -----------------------------------------------------------------------------
create table if not exists public.test_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price integer not null default 0,
  total_tests integer not null default 0,
  duration text,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 2) MCQs (linked to a test series)
-- -----------------------------------------------------------------------------
create table if not exists public.mcqs (
  id uuid primary key default gen_random_uuid(),
  test_series_id uuid references public.test_series (id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null,
  explanation text,
  created_at timestamptz default now()
);

create index if not exists mcqs_test_series_id_idx on public.mcqs (test_series_id);

-- -----------------------------------------------------------------------------
-- 3) Student answers (student_id = auth.users.id, same as profiles.id)
-- -----------------------------------------------------------------------------
create table if not exists public.student_responses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  test_series_id uuid not null references public.test_series (id) on delete cascade,
  mcq_id uuid not null references public.mcqs (id) on delete cascade,
  student_answer text not null,
  is_correct boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists student_responses_student_id_idx
  on public.student_responses (student_id);

-- -----------------------------------------------------------------------------
-- 4) Purchases: support BOTH courses and test series (you already have courses)
--    Existing rows keep course_id set; new rows can be test-only.
-- -----------------------------------------------------------------------------
alter table public.purchases alter column course_id drop not null;

alter table public.purchases
  add column if not exists test_series_id uuid references public.test_series (id) on delete set null;

alter table public.purchases drop constraint if exists purchases_one_product;

alter table public.purchases
  add constraint purchases_one_product check (
    (course_id is not null and test_series_id is null)
    or (course_id is null and test_series_id is not null)
  );

create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists purchases_test_series_id_idx on public.purchases (test_series_id);

-- -----------------------------------------------------------------------------
-- 5) Row Level Security (adjust if you already use RLS on these tables)
-- -----------------------------------------------------------------------------

-- Published test series + MCQs readable by the app (anon API key)
alter table public.test_series enable row level security;
alter table public.mcqs enable row level security;

drop policy if exists "Public read published test_series" on public.test_series;
create policy "Public read published test_series"
  on public.test_series for select
  using (is_published = true);

drop policy if exists "Public read mcqs" on public.mcqs;
create policy "Public read mcqs"
  on public.mcqs for select
  using (true);

-- Inserts from the admin panel use the logged-in user JWT (or use service role in .env.local).
drop policy if exists "Admins insert mcqs" on public.mcqs;
create policy "Admins insert mcqs"
  on public.mcqs for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(trim(p.role), '')) in ('admin', 'superadmin')
    )
  );

drop policy if exists "Admins insert test_series" on public.test_series;
create policy "Admins insert test_series"
  on public.test_series for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(trim(p.role), '')) in ('admin', 'superadmin')
    )
  );

-- Own purchases (dashboard “My courses / My tests” uses the user JWT)
alter table public.purchases enable row level security;

drop policy if exists "Users read own purchases" on public.purchases;
create policy "Users read own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Optional: allow insert only from service role / SQL (no insert for anon)
-- If admins create purchases from the app with service role, add a policy there.

-- Student responses: API uses Bearer JWT
alter table public.student_responses enable row level security;

drop policy if exists "Students read own responses" on public.student_responses;
create policy "Students read own responses"
  on public.student_responses for select
  using (auth.uid() = student_id);

drop policy if exists "Students insert own responses" on public.student_responses;
create policy "Students insert own responses"
  on public.student_responses for insert
  with check (auth.uid() = student_id);

-- -----------------------------------------------------------------------------
-- 6) Optional: skip student_entitlements — the app uses purchases instead
-- -----------------------------------------------------------------------------
