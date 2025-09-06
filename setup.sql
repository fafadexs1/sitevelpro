
-- Tabela de Planos de Internet
create table if not exists
  public.plans (
    id uuid not null default gen_random_uuid (),
    type text not null, -- 'residencial' ou 'empresarial'
    speed text not null,
    price real not null,
    original_price real null,
    features text[] null,
    highlight boolean not null default false,
    has_tv boolean not null default false,
    featured_channel_ids uuid[] null,
    created_at timestamp with time zone not null default now(),
    constraint plans_pkey primary key (id)
  );

-- Tabela de Canais de TV
create table if not exists
  public.tv_channels (
    id uuid not null default gen_random_uuid (),
    name text not null,
    description text null,
    logo_url text not null,
    created_at timestamp with time zone not null default now(),
    constraint tv_channels_pkey primary key (id)
  );
  
-- Tabela de Pacotes de TV
create table if not exists
  public.tv_packages (
    id uuid not null default gen_random_uuid (),
    name text not null,
    created_at timestamp with time zone not null default now(),
    constraint tv_packages_pkey primary key (id)
  );

-- Tabela de Junção (Muitos-para-Muitos) entre Pacotes e Canais
create table if not exists
  public.tv_package_channels (
    package_id uuid not null,
    channel_id uuid not null,
    constraint tv_package_channels_pkey primary key (package_id, channel_id),
    constraint tv_package_channels_package_id_fkey foreign key (package_id) references tv_packages (id) on delete cascade,
    constraint tv_package_channels_channel_id_fkey foreign key (channel_id) references tv_channels (id) on delete cascade
  );

-- Tabela de Configurações de SEO
create table if not exists
  public.seo_settings (
    id bigint not null,
    site_title text not null,
    site_description text not null,
    og_image_url text null,
    allow_indexing boolean not null default true,
    updated_at timestamp with time zone null,
    constraint seo_settings_pkey primary key (id)
  );

-- Tabela de Regras de SEO Dinâmicas
create table if not exists
  public.dynamic_seo_rules (
    id uuid not null default gen_random_uuid (),
    name text not null,
    slug_pattern text not null,
    meta_title text not null,
    meta_description text not null,
    canonical_url text null,
    allow_indexing boolean not null default true,
    schema_type text not null default 'None'::text,
    created_at timestamp with time zone not null default now(),
    constraint dynamic_seo_rules_pkey primary key (id),
    constraint dynamic_seo_rules_slug_pattern_key unique (slug_pattern)
  );

-- Tabela de Redirecionamentos
create table if not exists
  public.redirects (
    id uuid not null default gen_random_uuid (),
    source_path text not null,
    destination_path text not null,
    type text not null,
    created_at timestamp with time zone not null default now(),
    constraint redirects_pkey primary key (id),
    constraint redirects_source_path_key unique (source_path)
  );


-- Habilitar RLS para todas as tabelas
alter table public.plans enable row level security;
alter table public.tv_channels enable row level security;
alter table public.tv_packages enable row level security;
alter table public.tv_package_channels enable row level security;
alter table public.seo_settings enable row level security;
alter table public.dynamic_seo_rules enable row level security;
alter table public.redirects enable row level security;

-- Políticas de RLS para leitura pública
drop policy if exists "Allow public read access" on public.plans;
create policy "Allow public read access" on public.plans for select using (true);

drop policy if exists "Allow public read access" on public.tv_channels;
create policy "Allow public read access" on public.tv_channels for select using (true);

drop policy if exists "Allow public read access" on public.tv_packages;
create policy "Allow public read access" on public.tv_packages for select using (true);

drop policy if exists "Allow public read access" on public.tv_package_channels;
create policy "Allow public read access" on public.tv_package_channels for select using (true);

drop policy if exists "Allow public read access" on public.seo_settings;
create policy "Allow public read access" on public.seo_settings for select using (true);

drop policy if exists "Allow public read access" on public.dynamic_seo_rules;
create policy "Allow public read access" on public.dynamic_seo_rules for select using (true);

drop policy if exists "Allow public read access" on public.redirects;
create policy "Allow public read access" on public.redirects for select using (true);

-- Políticas de RLS para acesso autenticado de admin
drop policy if exists "Allow admin full access" on public.plans;
create policy "Allow admin full access" on public.plans for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.tv_channels;
create policy "Allow admin full access" on public.tv_channels for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.tv_packages;
create policy "Allow admin full access" on public.tv_packages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.tv_package_channels;
create policy "Allow admin full access" on public.tv_package_channels for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.seo_settings;
create policy "Allow admin full access" on public.seo_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.dynamic_seo_rules;
create policy "Allow admin full access" on public.dynamic_seo_rules for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Allow admin full access" on public.redirects;
create policy "Allow admin full access" on public.redirects for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');


-- Criação dos Buckets de Storage (se não existirem)
-- Bucket para logos de canais
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('canais', 'canais', true, 5242880, '{"image/jpeg", "image/png", "image/webp", "image/svg+xml"}')
on conflict (id) do nothing;

-- Bucket para assets do site (ex: OG Image)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 5242880, '{"image/jpeg", "image/png", "image/webp"}')
on conflict (id) do nothing;

-- Policies de Storage
drop policy if exists "Allow public read access on canais" on storage.objects;
create policy "Allow public read access on canais" on storage.objects for select to public using (bucket_id = 'canais');

drop policy if exists "Allow admin access on canais" on storage.objects;
create policy "Allow admin access on canais" on storage.objects for all to service_role with check (bucket_id = 'canais');

drop policy if exists "Allow public read access on site-assets" on storage.objects;
create policy "Allow public read access on site-assets" on storage.objects for select to public using (bucket_id = 'site-assets');

drop policy if exists "Allow admin access on site-assets" on storage.objects;
create policy "Allow admin access on site-assets" on storage.objects for all to service_role with check (bucket_id = 'site-assets');
