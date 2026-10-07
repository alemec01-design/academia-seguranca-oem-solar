-- Academia de Segurança O&M Solar
-- Cole este SQL no SQL Editor do Supabase.
-- Depois de criar as tabelas, configure Auth e políticas RLS antes de usar dados reais.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  employee_code text,
  job_title text,
  plant text,
  admission_date date not null,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_number integer not null check (track_number between 1 and 21),
  status text not null default 'completed' check (status in ('started','completed')),
  score integer not null default 0,
  xp integer not null default 0,
  completed_at timestamptz,
  unique(profile_id, track_number)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_number integer not null check (track_number between 1 and 21),
  certificate_code text unique not null,
  issued_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.training_progress enable row level security;
alter table public.certificates enable row level security;

-- Segurança inicial: usuário autenticado só acessa seus próprios registros.
create policy "profiles_select_own"
on public.profiles for select to authenticated
using (auth_user_id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (auth_user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "progress_select_own"
on public.training_progress for select to authenticated
using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "progress_insert_own"
on public.training_progress for insert to authenticated
with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "progress_update_own"
on public.training_progress for update to authenticated
using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "certificates_select_own"
on public.certificates for select to authenticated
using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "certificates_insert_own"
on public.certificates for insert to authenticated
with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

-- IMPORTANTE:
-- Não coloque service_role/secret key no HTML.
-- O frontend deve usar apenas a publishable key com RLS.
