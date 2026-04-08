-- Exécuter dans Supabase → SQL Editor (ou via CLI supabase db push)

create extension if not exists "pgcrypto";

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'Sans titre',
  icon text,
  parent_id uuid references public.pages (id) on delete set null,
  scope text not null default 'private' check (scope in ('private', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  user_id uuid not null,
  type text not null,
  content jsonb,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pages_user_updated
  on public.pages (user_id, updated_at desc);

create index if not exists idx_pages_user_scope_updated
  on public.pages (user_id, scope, updated_at desc);

create index if not exists idx_blocks_page_order
  on public.blocks (page_id, order_index);

alter table public.pages enable row level security;
alter table public.blocks enable row level security;

-- Accès direct depuis le navigateur (anon + JWT utilisateur)
-- DROP avant CREATE : réexécution du script sans erreur 42710 (policy already exists).
drop policy if exists "pages_select_own" on public.pages;
drop policy if exists "pages_insert_own" on public.pages;
drop policy if exists "pages_update_own" on public.pages;
drop policy if exists "pages_delete_own" on public.pages;
drop policy if exists "blocks_select_own" on public.blocks;
drop policy if exists "blocks_insert_own" on public.blocks;
drop policy if exists "blocks_update_own" on public.blocks;
drop policy if exists "blocks_delete_own" on public.blocks;

create policy "pages_select_own"
  on public.pages for select
  using (auth.uid() = user_id);

create policy "pages_insert_own"
  on public.pages for insert
  with check (auth.uid() = user_id);

create policy "pages_update_own"
  on public.pages for update
  using (auth.uid() = user_id);

create policy "pages_delete_own"
  on public.pages for delete
  using (auth.uid() = user_id);

create policy "blocks_select_own"
  on public.blocks for select
  using (auth.uid() = user_id);

create policy "blocks_insert_own"
  on public.blocks for insert
  with check (auth.uid() = user_id);

create policy "blocks_update_own"
  on public.blocks for update
  using (auth.uid() = user_id);

create policy "blocks_delete_own"
  on public.blocks for delete
  using (auth.uid() = user_id);
