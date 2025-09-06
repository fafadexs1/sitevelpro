
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Megaphone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ==================================
// Tipagem
// ==================================
type GoogleAdsSettings = {
    id: number;
    gads_tracking_id: string | null;
    gtm_container_id: string | null;
}

// ==================================
// Schema
// ==================================
const adsSchema = z.object({
  gads_tracking_id: z.string().optional().refine(val => !val || /^AW-[0-9]+$/.test(val), {
    message: 'O ID de acompanhamento deve estar no formato AW-0000000000',
  }),
  gtm_container_id: z.string().optional().refine(val => !val || /^GTM-[A-Z0-9]+$/.test(val), {
    message: 'O ID do contêiner deve estar no formato GTM-XXXXXXX',
  }),
});
type AdsFormData = z.infer<typeof adsSchema>;

// ==================================
// Página Principal
// ==================================
export default function GoogleAdsPage() {
    const { toast } = useToast();
    const supabase = createClient();
    
    const [settings, setSettings] = useState<GoogleAdsSettings | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AdsFormData>({
        resolver: zodResolver(adsSchema),
        defaultValues: { gads_tracking_id: '', gtm_container_id: '' },
    });

    // Fetcher
    useEffect(() => {
        const fetchSettings = async () => {
            setLoadingSettings(true);
            const { data, error } = await supabase.from('google_ads_settings').select('*').single();
            if (error && error.code !== 'PGRST116') {
                toast({ variant: 'destructive', title: 'Erro ao buscar configurações', description: error.message });
            } else if (data) {
                setSettings(data);
                form.reset({
                    gads_tracking_id: data.gads_tracking_id || '',
                    gtm_container_id: data.gtm_container_id || '',
                });
            }
            setLoadingSettings(false);
        };
        fetchSettings();
    }, [supabase, toast, form]);

    // Handlers
    const onSubmit = async (data: AdsFormData) => {
        setIsSubmitting(true);
        
        const { error } = await supabase.from('google_ads_settings').upsert({
            id: 1,
            gads_tracking_id: data.gads_tracking_id || null,
            gtm_container_id: data.gtm_container_id || null,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message });
        } else {
            toast({ title: "Sucesso!", description: "Configurações do Google Ads salvas." });
        }
        setIsSubmitting(false);
    };

    if (loadingSettings) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Google Ads e Tags</h1>
                    <p className="text-white/60">Gerencie as tags de rastreamento do Google.</p>
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="w-6 h-6 text-primary"/>
                                Rastreamento de Conversões
                            </CardTitle>
                            <CardDescription>
                                Insira os IDs do Google Ads e do Google Tag Manager para ativar o rastreamento de conversões e audiências em todo o site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="gads_tracking_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID de Acompanhamento do Google Ads</FormLabel>
                                        <FormControl>
                                            <Input placeholder="AW-1234567890" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <p className="text-xs text-white/60">O ID global do seu site, usado para remarketing e acompanhamento de conversões.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="gtm_container_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID do Contêiner do Google Tag Manager (GTM)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GTM-XXXXXXX" {...field} value={field.value || ''} />
                                        </FormControl>
                                         <p className="text-xs text-white/60">Opcional. Use o GTM para gerenciar todas as suas tags em um só lugar.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="w-4 h-4 mr-2"/>
                                Salvar Configurações
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </>
    );
}
