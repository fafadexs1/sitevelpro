
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, Globe, Settings2, PlusCircle, Trash2, Edit, RefreshCw, Redo, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DynamicSeoRuleForm } from "@/components/admin/DynamicSeoRuleForm";
import { revalidatePage } from "@/actions/seoActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// ==================================
// Tipagens
// ==================================

type SeoSettings = {
    id: number;
    site_title: string;
    site_description: string;
    og_image_url: string | null;
    favicon_url: string | null;
    allow_indexing: boolean;
}

export type DynamicSeoRule = {
    id: string;
    name: string;
    slug_pattern: string;
    meta_title: string;
    meta_description: string;
    canonical_url: string | null;
    allow_indexing: boolean;
    schema_type: 'LocalBusiness' | 'Product' | 'Offer' | 'FAQ' | 'Article' | 'None';
    created_at: string;
};

type Redirect = {
    id: string;
    source_path: string;
    destination_path: string;
    type: 'permanent' | 'temporary';
    created_at: string;
};

// ==================================
// Schemas
// ==================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_FAVICON_TYPES = ["image/png", "image/x-icon", "image/svg+xml"];

const seoSchema = z.object({
  site_title: z.string().min(1, "Título do site é obrigatório."),
  site_description: z.string().min(1, "Descrição do site é obrigatória."),
  allow_indexing: z.boolean().default(true),
  og_image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), "Apenas .jpg, .jpeg, .png e .webp são permitidos."),
  favicon_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 200 * 1024), `Tamanho máximo de 200KB.`)
    .refine((file) => !file || (file instanceof File && ACCEPTED_FAVICON_TYPES.includes(file.type)), "Apenas .png, .ico e .svg são permitidos."),
});
type SeoFormData = z.infer<typeof seoSchema>;


const redirectSchema = z.object({
    source_path: z.string().min(1, 'Obrigatório').startsWith('/', 'Deve começar com /'),
    destination_path: z.string().min(1, 'Obrigatório').refine(val => val.startsWith('/') || val.startsWith('http'), 'Deve ser um caminho relativo (/) ou URL completa (http)'),
    type: z.enum(['permanent', 'temporary'], { required_error: 'Obrigatório' }),
});
type RedirectFormData = z.infer<typeof redirectSchema>;


// ==================================
// Componente de Edição/Criação de Redirect
// ==================================

function RedirectForm({ onSave, onOpenChange, redirect }: { onSave: () => void, onOpenChange: (open: boolean) => void, redirect?: Redirect | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mode = redirect ? 'edit' : 'add';

    const form = useForm<RedirectFormData>({
        resolver: zodResolver(redirectSchema),
        defaultValues: {
            source_path: redirect?.source_path || '',
            destination_path: redirect?.destination_path || '',
            type: redirect?.type || 'permanent',
        },
    });

    const onSubmit = async (data: RedirectFormData) => {
        setIsSubmitting(true);
        const supabase = createClient();
        let error;

        if (mode === 'add') {
            ({ error } = await supabase.from('redirects').insert(data));
        } else if (redirect) {
            ({ error } = await supabase.from('redirects').update(data).eq('id', redirect.id));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível salvar o redirecionamento: ${error.message}` });
        } else {
            toast({ title: 'Sucesso!', description: `Redirecionamento ${mode === 'add' ? 'criado' : 'atualizado'}.` });
            onSave();
        }
        setIsSubmitting(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Novo Redirecionamento' : 'Editar Redirecionamento'}</DialogTitle>
                </DialogHeader>
                <FormField control={form.control} name="source_path" render={({ field }) => (<FormItem> <FormLabel>De (Origem)</FormLabel> <FormControl><Input id="redirect-source" placeholder="/caminho-antigo" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="destination_path" render={({ field }) => (<FormItem> <FormLabel>Para (Destino)</FormLabel> <FormControl><Input id="redirect-destination" placeholder="/novo-caminho ou https://outro.site" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger id="redirect-type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="permanent">301 - Permanente</SelectItem>
                                <SelectItem value="temporary">302 - Temporário</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button id="redirect-form-cancel" type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button id="redirect-form-save" type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// ==================================
// Página Principal
// ==================================

export default function SeoPage() {
    const { toast } = useToast();
    const supabase = createClient();
    
    const [settings, setSettings] = useState<SeoSettings | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rules, setRules] = useState<DynamicSeoRule[]>([]);
    const [loadingRules, setLoadingRules] = useState(true);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<DynamicSeoRule | null>(null);

    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loadingRedirects, setLoadingRedirects] = useState(true);
    const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
    const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);

    const [revalidationPath, setRevalidationPath] = useState('');
    const [isRevalidating, setIsRevalidating] = useState(false);

    const form = useForm<SeoFormData>({
        resolver: zodResolver(seoSchema),
        defaultValues: { site_title: '', site_description: '', allow_indexing: true, og_image_file: null, favicon_file: null },
    });

    const siteTitle = form.watch('site_title');
    const siteDescription = form.watch('site_description');

    // Fetchers
    const fetchAllData = async () => {
        setLoadingSettings(true);
        setLoadingRules(true);
        setLoadingRedirects(true);
        
        const { data: settingsData, error: settingsError } = await supabase.from('seo_settings').select('*').single();
        if (settingsError && settingsError.code !== 'PGRST116') {
            toast({ variant: 'destructive', title: 'Erro ao buscar configurações de SEO', description: settingsError.message });
        } else if (settingsData) {
            setSettings(settingsData);
            form.reset({ site_title: settingsData.site_title, site_description: settingsData.site_description, allow_indexing: settingsData.allow_indexing });
        }
        setLoadingSettings(false);

        const { data: rulesData, error: rulesError } = await supabase.from('dynamic_seo_rules').select('*').order('name');
        if (rulesError) {
            toast({ variant: 'destructive', title: 'Erro ao buscar regras dinâmicas de SEO', description: rulesError.message });
        } else {
            setRules(rulesData as DynamicSeoRule[]);
        }
        setLoadingRules(false);

        const { data: redirectsData, error: redirectsError } = await supabase.from('redirects').select('*').order('created_at', { ascending: false });
        if (redirectsError) {
            toast({ variant: 'destructive', title: 'Erro ao buscar redirecionamentos', description: redirectsError.message });
        } else {
            setRedirects(redirectsData as Redirect[]);
        }
        setLoadingRedirects(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Handlers
    const onGeneralSubmit = async (data: SeoFormData) => {
        setIsSubmitting(true);
        let ogImageUrl = settings?.og_image_url;
        let faviconUrl = settings?.favicon_url;

        if (data.og_image_file) {
            const file = data.og_image_file;
            const filePath = `og-image.${file.name.split('.').pop()}`;

            const { error: uploadError } = await supabase.storage.from('site-assets').upload(filePath, file, { upsert: true });
            if (uploadError) {
                toast({ variant: "destructive", title: "Erro de Upload (OG)", description: uploadError.message });
                setIsSubmitting(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
            ogImageUrl = urlData.publicUrl;
        }

        if (data.favicon_file) {
            const file = data.favicon_file;
            const filePath = `favicon.${file.name.split('.').pop()}`;

            const { error: uploadError } = await supabase.storage.from('site-assets').upload(filePath, file, { upsert: true });
            if (uploadError) {
                toast({ variant: "destructive", title: "Erro de Upload (Favicon)", description: uploadError.message });
                setIsSubmitting(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
            faviconUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from('seo_settings').upsert({
            id: 1,
            site_title: data.site_title,
            site_description: data.site_description,
            og_image_url: ogImageUrl,
            favicon_url: faviconUrl,
            allow_indexing: data.allow_indexing,
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

    const handleRuleSaved = () => {
        setIsRuleModalOpen(false);
        setEditingRule(null);
        fetchAllData();
    };

    const handleEditRule = (rule: DynamicSeoRule) => {
        setEditingRule(rule);
        setIsRuleModalOpen(true);
    };

    const handleDeleteRule = async (ruleId: string) => {
        const { error } = await supabase.from('dynamic_seo_rules').delete().eq('id', ruleId);
        if (error) { toast({ variant: 'destructive', title: 'Erro ao deletar regra', description: error.message }); }
        else { toast({ title: 'Sucesso', description: 'Regra de SEO deletada.' }); fetchAllData(); }
    };
    
    const handleRedirectSaved = () => {
        setIsRedirectModalOpen(false);
        setEditingRedirect(null);
        fetchAllData();
    };

    const handleEditRedirect = (redirect: Redirect) => {
        setEditingRedirect(redirect);
        setIsRedirectModalOpen(true);
    };

    const handleDeleteRedirect = async (redirectId: string) => {
        const { error } = await supabase.from('redirects').delete().eq('id', redirectId);
        if (error) { toast({ variant: 'destructive', title: 'Erro ao deletar redirecionamento', description: error.message }); }
        else { toast({ title: 'Sucesso', description: 'Redirecionamento deletado.' }); fetchAllData(); }
    };
    
    const handleRevalidate = async () => {
        if (!revalidationPath) { toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira um caminho para revalidar.' }); return; }
        setIsRevalidating(true);
        const result = await revalidatePage(revalidationPath);
        if (result.success) { toast({ title: 'Sucesso!', description: `A página ${revalidationPath} foi revalidada.` }); }
        else { toast({ variant: 'destructive', title: 'Erro de Revalidação', description: result.error }); }
        setIsRevalidating(false);
    };

    if (loadingSettings) {
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

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onGeneralSubmit)} className="space-y-8">
                            <Card className="border-white/10 bg-neutral-950">
                                <CardHeader><CardTitle>Metadados Globais</CardTitle><CardDescription>Título e descrição padrão para as páginas do site.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="site_title" render={({ field }) => ( <FormItem> <FormLabel>Título do Site</FormLabel> <FormControl><Input id="seo-site-title" placeholder="Velpro Telecom | Internet Ultrarrápida" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                    <FormField control={form.control} name="site_description" render={({ field }) => ( <FormItem> <FormLabel>Descrição do Site</FormLabel> <FormControl><Textarea id="seo-site-description" placeholder="Conecte-se com a Velpro e sinta a diferença..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-white/10 bg-neutral-950">
                                <CardHeader><CardTitle>Identidade Visual do Site</CardTitle><CardDescription>Gerencie o favicon e a imagem para compartilhamento.</CardDescription></CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="favicon_file" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Favicon</FormLabel>
                                            <FormControl>
                                            <div className="relative flex items-center justify-center w-full">
                                                <label htmlFor="dropzone-file-favicon" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutral-900 border-white/20 hover:border-primary hover:bg-neutral-800">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-white/50"/><p className="mb-2 text-sm text-white/50"><span className="font-semibold">Clique para enviar</span> ou arraste</p><p className="text-xs text-white/50">PNG, ICO, SVG (MAX. 200KB)</p></div>
                                                    <Input id="dropzone-file-favicon" type="file" className="hidden" accept={ACCEPTED_FAVICON_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                                                </label>
                                            </div> 
                                            </FormControl>
                                            {field.value?.name && <p className="text-sm text-white/70 mt-2">Novo arquivo: {field.value.name}</p>}
                                            {settings?.favicon_url && !field.value?.name && (<div className="mt-4"><p className="text-sm text-white/70 mb-2">Favicon atual:</p><Image src={settings.favicon_url} alt="Favicon" width={32} height={32} className="rounded-md border border-white/10 bg-white/5 p-1"/></div>)}
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="og_image_file" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagem Open Graph (1200x630px)</FormLabel>
                                            <FormControl>
                                            <div className="relative flex items-center justify-center w-full">
                                                <label htmlFor="dropzone-file-og" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutral-900 border-white/20 hover:border-primary hover:bg-neutral-800">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-white/50"/><p className="mb-2 text-sm text-white/50"><span className="font-semibold">Clique para enviar</span> ou arraste</p><p className="text-xs text-white/50">PNG, JPG, WEBP (MAX. 5MB)</p></div>
                                                    <Input id="dropzone-file-og" type="file" className="hidden" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                                                </label>
                                            </div> 
                                            </FormControl>
                                            {field.value?.name && <p className="text-sm text-white/70 mt-2">Novo arquivo: {field.value.name}</p>}
                                            {settings?.og_image_url && !field.value?.name && (<div className="mt-4"><p className="text-sm text-white/70 mb-2">Imagem atual:</p><Image src={settings.og_image_url} alt="Open Graph Image" width={240} height={126} className="rounded-md border border-white/10"/></div>)}
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </CardContent>
                            </Card>

                            <Card className="border-white/10 bg-neutral-950">
                                <CardHeader><CardTitle>Visibilidade nos Buscadores</CardTitle><CardDescription>Controle se os mecanismos de busca podem indexar seu site.</CardDescription></CardHeader>
                                <CardContent>
                                    <FormField control={form.control} name="allow_indexing" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                                            <div className="space-y-0.5"><FormLabel className="text-base">Permitir Indexação</FormLabel><p className="text-sm text-white/70">Ative para permitir que seu site apareça nos resultados de busca.</p></div>
                                            <FormControl><Switch id="seo-allow-indexing" checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                                        </FormItem>
                                    )}/>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2 text-xs text-white/60">
                                    <p>A alteração será refletida no arquivo <Link href="/robots.txt" target="_blank" className="underline hover:text-primary">/robots.txt</Link>.</p>
                                    <p>Seu mapa do site está disponível em <Link href="/sitemap.xml" target="_blank" className="underline hover:text-primary">/sitemap.xml</Link>.</p>
                                </CardFooter>
                            </Card>
                            <div className="flex justify-end"><Button id="seo-save-general" type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar Configurações Gerais</Button></div>
                        </form>
                    </Form>
                    
                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>SEO para Páginas Dinâmicas</CardTitle><CardDescription>Gerencie o SEO para páginas geradas dinamicamente.</CardDescription></div><Button id="seo-new-rule" onClick={() => { setEditingRule(null); setIsRuleModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Nova Regra</Button></CardHeader>
                        <CardContent>
                            {loadingRules ? <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                                <Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead>Nome</TableHead><TableHead>Padrão de Slug</TableHead><TableHead>Schema</TableHead><TableHead>Index</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {rules.map((rule) => (<TableRow key={rule.id} className="border-white/10"><TableCell className="font-medium">{rule.name}</TableCell><TableCell className="font-mono text-xs">{rule.slug_pattern}</TableCell><TableCell><Badge variant="secondary">{rule.schema_type}</Badge></TableCell><TableCell>{rule.allow_indexing ? <Badge className="border-primary/30 bg-primary/20 text-primary">Sim</Badge> : <Badge variant="destructive">Não</Badge>}</TableCell><TableCell className="text-right"><Button id={`seo-edit-rule-${rule.id}`} variant="ghost" size="sm" className="mr-2" onClick={() => handleEditRule(rule)}><Edit className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button id={`seo-delete-rule-trigger-${rule.id}`} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent className="bg-neutral-950 border-white/10 text-white"><AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá apagar permanentemente a regra de SEO.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel id={`seo-delete-rule-cancel-${rule.id}`}>Cancelar</AlertDialogCancel><AlertDialogAction id={`seo-delete-rule-confirm-${rule.id}`} onClick={() => handleDeleteRule(rule.id)}>Continuar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
                                        {rules.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-white/60 py-8">Nenhuma regra dinâmica encontrada.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader><CardTitle>Performance &amp; Indexação</CardTitle><CardDescription>Monitore e melhore a performance e o status de indexação do site.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div><h4 className="font-semibold text-sm mb-2">Core Web Vitals</h4><div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60 text-xs text-white/70"><p>Dados de performance serão exibidos aqui após integração com a API do Google PageSpeed.</p><div className="flex justify-around mt-2"><span>LCP: --</span><span>INP: --</span><span>CLS: --</span></div></div></div>
                            <div><h4 className="font-semibold text-sm mb-2">Status de Indexação</h4><div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60 text-xs text-white/70"><p className="mb-2">Verifique se suas páginas estão no Google. Requer integração com a API do Google Search Console.</p><Button variant="outline" size="sm" asChild id="seo-open-gsc"><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="w-full">Abrir Search Console</a></Button></div></div>
                            <div><h4 className="font-semibold text-sm mb-2">Revalidação de Cache (ISR)</h4><div className="space-y-2"><Input id="seo-revalidate-path" placeholder="/caminho/da/pagina" value={revalidationPath} onChange={(e) => setRevalidationPath(e.target.value)} className="bg-neutral-900"/><Button id="seo-revalidate-button" onClick={handleRevalidate} disabled={isRevalidating} className="w-full">{isRevalidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}Forçar Revalidação</Button></div><p className="text-xs text-white/60 mt-2">Use para limpar o cache de uma página específica após uma alteração.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-neutral-950">
                        <CardHeader><CardTitle>Gestão Avançada</CardTitle><CardDescription>Ferramentas para controle técnico e otimização fina do SEO.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div><h4 className="font-semibold text-sm mb-2">Preview de SERP</h4><div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0"><Globe className="h-4 w-4 text-primary-foreground"/></div><div><p className="text-sm font-medium text-blue-400 truncate">{siteTitle || "Seu Título Aqui"}</p><p className="text-xs text-white/70">https://velpro.com.br</p></div></div><p className="text-xs text-white/70 mt-2 line-clamp-2">{siteDescription || "A descrição do seu site aparecerá aqui. Escreva algo conciso e atraente."}</p></div></div>
                            <div><h4 className="font-semibold text-sm mb-2">Gerenciador de Redirecionamentos</h4><Button id="seo-manage-redirects" variant="outline" size="sm" className="w-full" onClick={() => { setEditingRedirect(null); setIsRedirectModalOpen(true); }}><Redo className="mr-2 h-4 w-4"/> Gerenciar Redirecionamentos</Button></div>
                            <div><h4 className="font-semibold text-sm mb-2">Teste de Dados Estruturados</h4><div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60 text-xs text-white/70"><p className="mb-2">Use a ferramenta oficial do Google para validar o Schema Markup.</p><Button id="seo-rich-results-test" variant="outline" size="sm" asChild><a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="w-full"><ExternalLink className="mr-2 h-4 w-4"/> Teste de Rich Results</a></Button></div></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}><DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-2xl"><DynamicSeoRuleForm rule={editingRule} onRuleSaved={handleRuleSaved} onOpenChange={setIsRuleModalOpen}/></DialogContent></Dialog>
            <Dialog open={isRedirectModalOpen} onOpenChange={setIsRedirectModalOpen}>
                <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-lg">
                    <DialogHeader><DialogTitle>Gerenciar Redirecionamentos</DialogTitle><DialogDescription>Crie e edite redirecionamentos 301 (permanente) ou 302 (temporário).</DialogDescription></DialogHeader>
                    {loadingRedirects ? <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                        <>
                            <div className="border rounded-lg max-h-64 overflow-y-auto">
                                <Table>
                                    <TableBody>
                                        {redirects.map(r => (
                                            <TableRow key={r.id} className="border-white/10">
                                                <TableCell className="text-xs">
                                                    <p className="font-mono text-white/80">{r.source_path}</p>
                                                    <p className="font-mono text-primary/80">{'->'} {r.destination_path}</p>
                                                </TableCell>
                                                <TableCell><Badge variant={r.type === 'permanent' ? 'default' : 'secondary'}>{r.type === 'permanent' ? '301' : '302'}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button id={`seo-edit-redirect-${r.id}`} variant="ghost" size="icon" className="h-7 w-7 mr-1" onClick={() => handleEditRedirect(r)}><Edit className="h-4 w-4"/></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button id={`seo-delete-redirect-trigger-${r.id}`} variant="destructive" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                                                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Isso irá apagar o redirecionamento.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel id={`seo-delete-redirect-cancel-${r.id}`}>Cancelar</AlertDialogCancel><AlertDialogAction id={`seo-delete-redirect-confirm-${r.id}`} onClick={() => handleDeleteRedirect(r.id)}>Deletar</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {redirects.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-sm text-white/60 h-24">Nenhum redirecionamento criado.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                            <RedirectForm onSave={handleRedirectSaved} onOpenChange={setIsRedirectModalOpen} redirect={editingRedirect} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

    
