-- Rubriques supplémentaires : Projets, Sauvegardes, Applications.

alter table public.pages
  drop constraint if exists pages_scope_check;

alter table public.pages
  add constraint pages_scope_check
  check (scope in ('private', 'pro', 'projets', 'sauvegardes', 'applications'));
