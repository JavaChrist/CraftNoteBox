-- Bucket public pour images / pièces jointes des pages (RLS sur le chemin utilisateur).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-media',
  'page-media',
  true,
  52428800,
  null
)
on conflict (id) do nothing;

drop policy if exists "page-media select public" on storage.objects;
drop policy if exists "page-media insert own prefix" on storage.objects;
drop policy if exists "page-media update own prefix" on storage.objects;
drop policy if exists "page-media delete own prefix" on storage.objects;

create policy "page-media select public"
  on storage.objects for select
  using (bucket_id = 'page-media');

create policy "page-media insert own prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'page-media'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "page-media update own prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'page-media'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "page-media delete own prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'page-media'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );
