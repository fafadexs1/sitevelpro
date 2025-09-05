-- Adiciona a coluna 'description' à tabela 'tv_channels' se ela não existir.
ALTER TABLE public.tv_channels ADD COLUMN IF NOT EXISTS description TEXT;
