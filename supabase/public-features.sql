-- Jalankan sekali di Supabase SQL Editor untuk mengaktifkan peta keramaian
-- upload foto, serta filter fasilitas kedai.
alter table public.coffee_shops add column if not exists features text[] not null default '{}';
alter table public.place_requests add column if not exists address text;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['coffee_shops','articles','reviews','shop_photos'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end
$$;

create or replace function public.get_public_crowd_summary()
returns table (shop_id uuid, level text, report_count bigint, latest_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.shop_id,
         (array_agg(r.level order by r.created_at desc))[1] as level,
         count(*)::bigint as report_count,
         max(r.created_at) as latest_at
  from public.crowd_reports as r
  where r.shop_id is not null
    and r.created_at >= now() - interval '2 hours'
  group by r.shop_id;
$$;

revoke all on function public.get_public_crowd_summary() from public;
grant execute on function public.get_public_crowd_summary() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cafe-photos', 'cafe-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads coffee shop photos" on storage.objects;
create policy "Public reads coffee shop photos"
on storage.objects for select to anon, authenticated
using (bucket_id = 'cafe-photos');

drop policy if exists "Ngopi admins upload coffee shop photos" on storage.objects;
create policy "Ngopi admins upload coffee shop photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'cafe-photos' and public.is_ngopi_admin());

drop policy if exists "Ngopi admins update coffee shop photos" on storage.objects;
create policy "Ngopi admins update coffee shop photos"
on storage.objects for update to authenticated
using (bucket_id = 'cafe-photos' and public.is_ngopi_admin())
with check (bucket_id = 'cafe-photos' and public.is_ngopi_admin());

drop policy if exists "Ngopi admins delete coffee shop photos" on storage.objects;
create policy "Ngopi admins delete coffee shop photos"
on storage.objects for delete to authenticated
using (bucket_id = 'cafe-photos' and public.is_ngopi_admin());
