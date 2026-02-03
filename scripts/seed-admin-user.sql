-- Seed admin user (idempotent)
insert into public.users (full_name, email, password_hash, role, is_active)
values (
  'fabricio',
  'fabriciobb4@hotmail.com',
  '$2a$06$0dPLaz5lpit8VjSVItC8R.FgHvh785tnhQ5jtafjFfp7cIrvs0WU2',
  'admin',
  true
)
on conflict (email) do update set
  full_name = excluded.full_name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();
