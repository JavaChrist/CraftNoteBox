-- Page « compte rendu » auto-créée : référence directe depuis le meeting.

alter table public.meetings
  add column if not exists minutes_page_id uuid references public.pages (id) on delete set null;

create index if not exists idx_meetings_minutes_page
  on public.meetings (minutes_page_id)
  where minutes_page_id is not null;
