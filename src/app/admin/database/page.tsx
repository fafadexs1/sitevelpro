

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DatabasePage() {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const setupSqlContent = `
-- Habilita a extensão pgsodium
create extension if not exists pgsodium with schema pgsodium;

-- Habilita a extensão http
create extension if not exists http with schema extensions;

-- Cria a função para buscar metadados de uma URL
create or replace function get_url_metadata(p_url text)
returns table (
  title text,
  description text,
  image_url text
) as $$
  select
    net.http_get(
      url := p_url,
      params := null,
      headers := '{"Content-Type": "application/json"}',
      timeout_milliseconds := 2000
    ) as request;
$$ language sql;

-- Cria a tabela de slides do herói
create table if not exists hero_slides (
  id uuid default gen_random_uuid() primary key,
  pre_title text,
  title_regular text,
  title_highlighted text,
  subtitle text,
  image_url text,
  image_opacity integer default 30,
  button_primary_text text,
  button_primary_link text,
  button_secondary_text text,
  button_secondary_link text,
  feature_1_text text,
  feature_2_text text,
  is_active boolean default true not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Cria a tabela de planos
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'residencial' ou 'empresarial'
  speed text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  first_month_price numeric(10, 2),
  features text[],
  highlight boolean default false,
  has_tv boolean default false,
  featured_channel_ids uuid[],
  whatsapp_number text,
  whatsapp_message text,
  conditions text,
  upload_speed text,
  download_speed text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de canais de TV
create table if not exists tv_channels (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    logo_url text,
    is_featured boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de pacotes de TV
create table if not exists tv_packages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de junção para pacotes e canais
create table if not exists tv_package_channels (
    id uuid default gen_random_uuid() primary key,
    package_id uuid references tv_packages(id) not null,
    channel_id uuid references tv_channels(id) not null,
    constraint unique_package_channel unique (package_id, channel_id)
);

-- Cria a tabela de cidades para rotas dinâmicas
create table if not exists cities (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de configurações de SEO
create table if not exists seo_settings (
  id int primary key default 1,
  site_title text not null,
  site_description text not null,
  og_image_url text,
  favicon_url text,
  allow_indexing boolean default true not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row_check check (id = 1)
);

-- Cria a tabela de regras dinâmicas de SEO
create table if not exists dynamic_seo_rules (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug_pattern text not null,
    meta_title text not null,
    meta_description text,
    canonical_url text,
    allow_indexing boolean default true not null,
    schema_type text default 'None',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de redirecionamentos
create table if not exists redirects (
    id uuid default gen_random_uuid() primary key,
    source_path text not null unique,
    destination_path text not null,
    type text not null default 'permanent', -- 'permanent' (301) ou 'temporary' (302)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de tags de rastreamento
create table if not exists tracking_tags (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    script_content text not null,
    placement text not null default 'head_start', -- 'head_start', 'body_start', 'body_end'
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de eventos de conversão
create table if not exists conversion_events (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    type text not null, -- 'standard' or 'custom'
    selector text, -- a CSS selector for custom events
    event_snippet text not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de visitas para estatísticas
create table if not exists visits (
  id uuid default gen_random_uuid() primary key,
  visitor_id text not null,
  pathname text not null,
  is_new_visitor boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de eventos para estatísticas
create table if not exists events (
    id uuid default gen_random_uuid() primary key,
    visitor_id text not null,
    pathname text not null,
    name text not null, -- ex: 'cta_click'
    properties jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Cria o bucket 'canais' se ele não existir
-- As políticas RLS garantem que ele seja público
insert into storage.buckets (id, name, public)
values ('canais', 'canais', true)
on conflict (id) do nothing;

-- Cria o bucket 'site-assets' se ele não existir
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Cria o bucket 'hero-slides' se ele não existir
insert into storage.buckets (id, name, public)
values ('hero-slides', 'hero-slides', true)
on conflict (id) do nothing;


-- Políticas de acesso para o bucket 'canais'
-- Permite leitura anônima de arquivos
create policy "Public read access for logos"
on storage.objects for select
using ( bucket_id = 'canais' );

-- Permite que usuários autenticados façam upload
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'canais' );

-- Permite que usuários autenticados atualizem seus próprios arquivos
create policy "Allow authenticated updates"
on storage.objects for update
to authenticated
using ( auth.uid() = owner_id );

-- Permite que usuários autenticados deletem seus próprios arquivos
create policy "Allow authenticated deletes"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner_id );


-- Políticas de acesso para o bucket 'site-assets'
-- Remove as políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Authenticated access for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes for site assets" ON storage.objects;

-- Permite acesso total (leitura, escrita, etc.) para usuários autenticados ao bucket 'site-assets'
CREATE POLICY "Authenticated access for site assets"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'site-assets')
WITH CHECK (bucket_id = 'site-assets');

-- Permite que qualquer pessoa (público) leia os arquivos do bucket 'site-assets'
CREATE POLICY "Public read access for site assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');

-- Políticas de acesso para o bucket 'hero-slides'
CREATE POLICY "Public read access for hero slides"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-slides');

CREATE POLICY "Allow authenticated access for hero slides"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'hero-slides')
WITH CHECK (bucket_id = 'hero-slides');

    `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(setupSqlContent).then(() => {
            setCopied(true);
            toast({ title: "Copiado!", description: "O script SQL foi copiado para a área de transferência." });
            setTimeout(() => setCopied(false), 2000);
        }, () => {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível copiar o script." });
        });
    };

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Banco de Dados</h1>
                    <p className="text-muted-foreground">Gerencie a estrutura do seu banco de dados.</p>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Script de Configuração (setup.sql)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        O script abaixo contém todos os comandos SQL necessários para configurar ou atualizar as tabelas do seu banco de dados Supabase.
                    </p>
                    <div className="relative">
                        <pre className="bg-secondary border border-border rounded-lg p-4 text-xs overflow-x-auto max-h-96 text-foreground">
                            <code>{setupSqlContent}</code>
                        </pre>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCopy}
                            className="absolute top-2 right-2"
                        >
                            {copied ? "Copiado!" : "Copiar"}
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button asChild variant="default">
                            <Link href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                                Abrir Editor SQL do Supabase
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground self-center">
                            Copie o script e cole no editor de SQL para executar.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
