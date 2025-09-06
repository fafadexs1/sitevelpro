
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

type SeoSettings = {
    id: number;
    site_title: string;
    site_description: string;
    og_image_url: string | null;
    allow_indexing: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const seoSchema = z.object({
  site_title: z.string().min(1, "Título do site é obrigatório."),
  site_description: z.string().min(1, "Descrição do site é obrigatória."),
  allow_indexing: z.boolean().default(true),
  og_image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), "Apenas .jpg, .jpeg, .png e .webp são permitidos."),
});
type SeoFormData = z.infer<typeof seoSchema>;


export default function SeoPage() {
    const [settings, setSettings] = useState<SeoSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<SeoFormData>({
        resolver: zodResolver(seoSchema),
        defaultValues: {
            site_title: '',
            site_description: '',
            allow_indexing: true,
            og_image_file: null,
        },
    });

    useEffect(() => {
        const getSeoSettings = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('seo_settings').select('*').single();
            if (error && error.code !== 'PGRST116') { // Ignore 'not found' error
                toast({ variant: 'destructive', title: 'Erro ao buscar configurações de SEO', description: error.message });
            } else if (data) {
                setSettings(data);
                form.reset({
                    site_title: data.site_title,
                    site_description: data.site_description,
                    allow_indexing: data.allow_indexing,
                });
            }
            setLoading(false);
        };
        getSeoSettings();
    }, [supabase, toast, form]);

    const onSubmit = async (data: SeoFormData) => {
        setIsSubmitting(true);
        let ogImageUrl = settings?.og_image_url;

        // 1. Upload OG image if a new one is provided
        if (data.og_image_file) {
            const file = data.og_image_file;
            const filePath = `og-image.${file.name.split('.').pop()}`;

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                toast({ variant: "destructive", title: "Erro de Upload", description: uploadError.message });
                setIsSubmitting(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
            ogImageUrl = urlData.publicUrl;
        }

        // 2. Upsert settings
        const { error } = await supabase.from('seo_settings').upsert({
            id: 1, // Always operate on the single settings row
            site_title: data.site_title,
            site_description: data.site_description,
            allow_indexing: data.allow_indexing,
            og_image_url: ogImageUrl,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message });
        } else {
            toast({ title: "Sucesso!", description: "Configurações de SEO salvas." });
            const { data: updatedSettings } = await supabase.from('seo_settings').select('*').single();
            setSettings(updatedSettings);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Configurações de SEO</h1>
                    <p className="text-white/60">Gerencie como seu site é visto por mecanismos de busca.</p>
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader>
                            <CardTitle>Metadados Globais</CardTitle>
                            <p className="text-sm text-white/60">Título e descrição padrão para as páginas do site.</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="site_title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título do Site</FormLabel>
                                        <FormControl><Input placeholder="Velpro Telecom | Internet Ultrarrápida" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="site_description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição do Site</FormLabel>
                                        <FormControl><Textarea placeholder="Conecte-se com a Velpro e sinta a diferença..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    
                     <Card className="border-white/10 bg-neutral-950">
                        <CardHeader>
                            <CardTitle>Compartilhamento Social (Open Graph)</CardTitle>
                             <p className="text-sm text-white/60">Imagem que aparece ao compartilhar o link do site. (Recomendado: 1200x630px)</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="og_image_file"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagem OG</FormLabel>
                                    <FormControl>
                                    <div className="relative flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file-og" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutral-900 border-white/20 hover:border-primary hover:bg-neutral-800">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-white/50"/>
                                                <p className="mb-2 text-sm text-white/50"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                                <p className="text-xs text-white/50">PNG, JPG, WEBP (MAX. 5MB)</p>
                                            </div>
                                            <Input id="dropzone-file-og" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                                        </label>
                                    </div> 
                                    </FormControl>
                                    {field.value?.name && <p className="text-sm text-white/70 mt-2">Novo arquivo: {field.value.name}</p>}
                                    {settings?.og_image_url && !field.value?.name && (
                                        <div className="mt-4">
                                            <p className="text-sm text-white/70 mb-2">Imagem atual:</p>
                                            <Image src={settings.og_image_url} alt="Open Graph Image" width={240} height={126} className="rounded-md border border-white/10"/>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader>
                            <CardTitle>Visibilidade nos Buscadores</CardTitle>
                            <p className="text-sm text-white/60">Controle se os mecanismos de busca como o Google podem indexar seu site.</p>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="allow_indexing"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Permitir Indexação</FormLabel>
                                            <p className="text-sm text-white/70">
                                                Ative para permitir que seu site apareça nos resultados de busca.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                         <CardFooter className="flex-col items-start gap-2 text-xs text-white/60">
                            <p>A alteração será refletida no arquivo <Link href="/robots.txt" target="_blank" className="underline hover:text-primary">/robots.txt</Link>.</p>
                             <p>Seu mapa do site está disponível em <Link href="/sitemap.xml" target="_blank" className="underline hover:text-primary">/sitemap.xml</Link>.</p>
                        </CardFooter>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Salvar Configurações de SEO
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};
