-- Recherche MVP : titres de pages + contenu des blocs (représentation texte du jsonb).
-- À exécuter dans Supabase → SQL (comme la migration initiale).

create or replace function public.global_search_pages(
  p_user_id uuid,
  p_search text
)
returns table (
  page_id uuid,
  page_title text,
  snippet text,
  kind text
)
language sql
stable
security invoker
set search_path = public
as $$
  with esc as (
    select
      case
        when p_search is null or btrim(p_search) = '' then null
        else
          '%'
          || replace(
            replace(replace(btrim(p_search), e'\\', e'\\\\'), '%', e'\\%'),
            '_',
            e'\\_'
          )
          || '%'
      end as like_pattern
  )
  (
    select
      p.id as page_id,
      p.title as page_title,
      p.title as snippet,
      'title'::text as kind
    from pages p
    cross join esc
    where esc.like_pattern is not null
      and p.user_id = p_user_id
      and p.title ilike esc.like_pattern escape '\'
  )
  union all
  (
    select distinct on (b.page_id)
      p.id,
      p.title,
      left(regexp_replace(b.content::text, '\s+', ' ', 'g'), 200),
      'content'::text
    from blocks b
    inner join pages p on p.id = b.page_id and p.user_id = p_user_id
    cross join esc
    where esc.like_pattern is not null
      and b.user_id = p_user_id
      and b.content::text ilike esc.like_pattern escape '\'
    order by b.page_id, b.updated_at desc
  );
$$;

revoke all on function public.global_search_pages(uuid, text) from public;
grant execute on function public.global_search_pages(uuid, text) to authenticated;
grant execute on function public.global_search_pages(uuid, text) to service_role;
