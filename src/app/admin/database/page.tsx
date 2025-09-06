

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

-- Cria a tabela de planos
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'residencial' ou 'empresarial'
  speed text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  features text[],
  highlight boolean default false,
  has_tv boolean default false,
  featured_channel_ids uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cria a tabela de canais de TV
create table if not exists tv_channels (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    logo_url text,
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

-- Cria a tabela de configurações de SEO
create table if not exists seo_settings (
  id int primary key default 1,
  site_title text not null,
  site_description text not null,
  og_image_url text,
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


-- Cria o bucket 'canais' se ele não existir
-- As políticas RLS garantem que ele seja público
insert into storage.buckets (id, name, public)
values ('canais', 'canais', true)
on conflict (id) do nothing;

-- Cria o bucket 'site-assets' se ele não existir
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
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
create policy "Public read access for site assets"
on storage.objects for select
using ( bucket_id = 'site-assets' );

create policy "Allow authenticated uploads for site assets"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'site-assets' );

create policy "Allow authenticated updates for site assets"
on storage.objects for update
to authenticated
using ( auth.uid() = owner_id );

create policy "Allow authenticated deletes for site assets"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner_id );
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
                    <h1 className="text-3xl font-bold">Banco de Dados</h1>
                    <p className="text-white/60">Gerencie a estrutura do seu banco de dados.</p>
                </div>
            </header>

            <Card className="bg-neutral-950 border-white/10">
                <CardHeader>
                    <CardTitle>Script de Configuração (setup.sql)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-white/70">
                        O script abaixo contém todos os comandos SQL necessários para configurar ou atualizar as tabelas do seu banco de dados Supabase.
                    </p>
                    <div className="relative">
                        <pre className="bg-neutral-900 border border-white/10 rounded-lg p-4 text-xs overflow-x-auto max-h-96">
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
                        <p className="text-sm text-white/70 self-center">
                            Copie o script e cole no editor de SQL para executar.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
