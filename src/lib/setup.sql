
-- Create the 'plans' table
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    type text,
    speed text,
    price numeric,
    highlight boolean,
    has_tv boolean,
    features text[],
    original_price numeric,
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);
-- Disable RLS for 'plans' table
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;


-- Create the 'tv_channels' table
CREATE TABLE IF NOT EXISTS public.tv_channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text,
    logo_url text,
    description text,
    CONSTRAINT tv_channels_pkey PRIMARY KEY (id)
);
-- Disable RLS for 'tv_channels' table
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;


-- Create the 'tv_packages' table
CREATE TABLE IF NOT EXISTS public.tv_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tv_packages_pkey PRIMARY KEY (id)
);
-- Disable RLS for 'tv_packages' table
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;


-- Create the 'tv_package_channels' table
CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    package_id uuid,
    channel_id uuid,
    CONSTRAINT tv_package_channels_pkey PRIMARY KEY (id),
    CONSTRAINT tv_package_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES tv_channels(id) ON DELETE CASCADE,
    CONSTRAINT tv_package_channels_package_id_fkey FOREIGN KEY (package_id) REFERENCES tv_packages(id) ON DELETE CASCADE
);
-- Create sequence for 'tv_package_channels'
CREATE SEQUENCE IF NOT EXISTS public.tv_package_channels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.tv_package_channels ALTER COLUMN id SET DEFAULT nextval('public.tv_package_channels_id_seq'::regclass);
-- Disable RLS for 'tv_package_channels'
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;


-- Policies for 'canais' bucket
-- Allow public read access to all files in the bucket
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING ( bucket_id = 'canais' );

-- Allow authenticated users to upload, update, and delete files in the bucket
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'canais' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE WITH CHECK ( bucket_id = 'canais' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE WITH CHECK ( bucket_id = 'canais' AND auth.role() = 'authenticated' );
