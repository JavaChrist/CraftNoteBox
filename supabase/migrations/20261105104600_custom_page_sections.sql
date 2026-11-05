-- Rubriques personnalisées. Le slug reste dans pages.scope.
-- Les cinq rubriques d’origine sont créées à la première visite de chaque compte.

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null,
  title text not null,
  short_label text not null,
  sort_order int not null default 0,
  builtin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_sections_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  constraint page_sections_title_len check (char_length(btrim(title)) between 1 and 40),
  constraint page_sections_user_slug_unique unique (user_id, slug)
);

create index if not exists idx_page_sections_user_order
  on public.page_sections (user_id, sort_order);

alter table public.pages
  drop constraint if exists pages_scope_check;

alter table public.page_sections enable row level security;

drop policy if exists "page_sections_select_own" on public.page_sections;
drop policy if exists "page_sections_insert_own" on public.page_sections;
drop policy if exists "page_sections_update_own" on public.page_sections;
drop policy if exists "page_sections_delete_own" on public.page_sections;

create policy "page_sections_select_own"
  on public.page_sections for select
  using (auth.uid() = user_id);

create policy "page_sections_insert_own"
  on public.page_sections for insert
  with check (auth.uid() = user_id);

create policy "page_sections_update_own"
  on public.page_sections for update
  using (auth.uid() = user_id);

create policy "page_sections_delete_own"
  on public.page_sections for delete
  using (auth.uid() = user_id);
