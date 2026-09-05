-- Ejecutar en el SQL Editor de Supabase (Zmproject).
-- El backend usa la service role key y bypasea RLS; igual se deja RLS activo
-- para que nadie consulte estas tablas desde el cliente anon.

create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role_id uuid not null references public.roles (id),
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_id_idx on public.users (role_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

insert into public.roles (name, description)
values
  ('admin', 'Acceso total al sistema de administracion'),
  ('supervisor', 'Consulta y gestion operativa limitada'),
  ('operador', 'Uso diario sin administrar usuarios')
on conflict (name) do nothing;

insert into public.permissions (code, description)
values
  ('users.read', 'Ver usuarios'),
  ('users.write', 'Crear y editar usuarios'),
  ('users.delete', 'Desactivar o eliminar usuarios'),
  ('roles.read', 'Ver roles y permisos'),
  ('roles.write', 'Asignar permisos a roles')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('users.read', 'roles.read')
where r.name = 'supervisor'
on conflict do nothing;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
