-- Politiques plus robustes que storage.foldername(name)[1] (certains projets renvoient 400/403 sinon).

drop policy if exists "page-media insert own prefix" on storage.objects;
drop policy if exists "page-media update own prefix" on storage.objects;
drop policy if exists "page-media delete own prefix" on storage.objects;

create policy "page-media insert own prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'page-media'
    and split_part(name, '/', 1) = (auth.uid())::text
  );

create policy "page-media update own prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'page-media'
    and split_part(name, '/', 1) = (auth.uid())::text
  );

create policy "page-media delete own prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'page-media'
    and split_part(name, '/', 1) = (auth.uid())::text
  );
