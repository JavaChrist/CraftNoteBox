-- Espace pages : privées vs PRO (même modèle, filtrage par scope).

alter table public.pages
  add column if not exists scope text not null default 'private';

alter table public.pages
  drop constraint if exists pages_scope_check;

alter table public.pages
  add constraint pages_scope_check check (scope in ('private', 'pro'));

create index if not exists idx_pages_user_scope_updated
  on public.pages (user_id, scope, updated_at desc);
