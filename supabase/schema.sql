-- Skema awal database NgopiMalang. Jalankan seluruh file ini di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_ngopi_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_ngopi_admin() from public;
grant execute on function public.is_ngopi_admin() to anon, authenticated;

create table if not exists public.coffee_shops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  area text not null check (area in ('Klojen','Lowokwaru','Blimbing','Sukun','Kedungkandang')),
  address text,
  description text,
  price_range text,
  opening_hours text,
  features text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  area text not null check (char_length(area) between 2 and 180),
  address text,
  notes text check (notes is null or char_length(notes) <= 1500),
  submitter text check (submitter is null or char_length(submitter) <= 100),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.crowd_reports (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.coffee_shops(id) on delete set null,
  shop_name text,
  area text,
  level text not null check (level in ('Sepi','Sedang','Ramai')),
  created_at timestamptz not null default now()
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.coffee_shops(id) on delete set null,
  shop_name text,
  message text not null check (char_length(message) between 2 and 2000),
  details text,
  status text not null default 'pending' check (status in ('pending','reviewed','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.coffee_shops(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 180),
  slug text not null unique,
  category text,
  summary text,
  body text,
  image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_photos (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.coffee_shops(id) on delete cascade,
  storage_path text not null,
  caption text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.coffee_shops enable row level security;
alter table public.place_requests enable row level security;
alter table public.crowd_reports enable row level security;
alter table public.corrections enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;
alter table public.shop_photos enable row level security;

create policy "Admins manage admin list" on public.admin_users for all to authenticated
  using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public reads approved shops" on public.coffee_shops for select to anon, authenticated using (status = 'approved' or public.is_ngopi_admin());
create policy "Admins manage shops" on public.coffee_shops for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public submits place requests" on public.place_requests for insert to anon, authenticated with check (status = 'pending');
create policy "Admins manage requests" on public.place_requests for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public submits crowd reports" on public.crowd_reports for insert to anon, authenticated with check (true);
create policy "Admins read and manage crowd reports" on public.crowd_reports for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public submits corrections" on public.corrections for insert to anon, authenticated with check (status = 'pending');
create policy "Admins manage corrections" on public.corrections for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public reads approved reviews" on public.reviews for select to anon, authenticated using (status = 'approved' or public.is_ngopi_admin());
create policy "Public submits reviews" on public.reviews for insert to anon, authenticated with check (status = 'pending');
create policy "Admins manage reviews" on public.reviews for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public reads published articles" on public.articles for select to anon, authenticated using (status = 'published' or public.is_ngopi_admin());
create policy "Admins manage articles" on public.articles for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());
create policy "Public reads approved photos" on public.shop_photos for select to anon, authenticated using (status = 'approved' or public.is_ngopi_admin());
create policy "Admins manage photos" on public.shop_photos for all to authenticated using (public.is_ngopi_admin()) with check (public.is_ngopi_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.admin_users, public.coffee_shops, public.place_requests,
  public.crowd_reports, public.corrections, public.reviews, public.articles, public.shop_photos to anon, authenticated;

create index if not exists crowd_reports_shop_created_idx on public.crowd_reports (shop_id, created_at desc);
create index if not exists place_requests_status_created_idx on public.place_requests (status, created_at desc);
create index if not exists articles_status_published_idx on public.articles (status, published_at desc);
