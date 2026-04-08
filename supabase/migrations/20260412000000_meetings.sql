-- Module Réunions : rendez-vous + liaison optionnelle aux pages.

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_end_after_start check (end_at > start_at)
);

create table if not exists public.meeting_pages (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  primary key (meeting_id, page_id)
);

create index if not exists idx_meetings_user_start
  on public.meetings (user_id, start_at asc);

create index if not exists idx_meetings_user_updated
  on public.meetings (user_id, updated_at desc);

create index if not exists idx_meeting_pages_page
  on public.meeting_pages (page_id);

alter table public.meetings enable row level security;
alter table public.meeting_pages enable row level security;

drop policy if exists "meetings_select_own" on public.meetings;
drop policy if exists "meetings_insert_own" on public.meetings;
drop policy if exists "meetings_update_own" on public.meetings;
drop policy if exists "meetings_delete_own" on public.meetings;
drop policy if exists "meeting_pages_select_own" on public.meeting_pages;
drop policy if exists "meeting_pages_insert_own" on public.meeting_pages;
drop policy if exists "meeting_pages_delete_own" on public.meeting_pages;

create policy "meetings_select_own"
  on public.meetings for select
  using (auth.uid() = user_id);

create policy "meetings_insert_own"
  on public.meetings for insert
  with check (auth.uid() = user_id);

create policy "meetings_update_own"
  on public.meetings for update
  using (auth.uid() = user_id);

create policy "meetings_delete_own"
  on public.meetings for delete
  using (auth.uid() = user_id);

create policy "meeting_pages_select_own"
  on public.meeting_pages for select
  using (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_pages.meeting_id
        and m.user_id = auth.uid()
    )
  );

create policy "meeting_pages_insert_own"
  on public.meeting_pages for insert
  with check (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_id and m.user_id = auth.uid()
    )
    and exists (
      select 1 from public.pages p
      where p.id = page_id and p.user_id = auth.uid()
    )
  );

create policy "meeting_pages_delete_own"
  on public.meeting_pages for delete
  using (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_pages.meeting_id
        and m.user_id = auth.uid()
    )
  );
