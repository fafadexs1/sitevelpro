
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Settings, Link as LinkIcon, KeyRound, AppWindow, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Image from "next/image";


const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

const settingsSchema = z.object({
  external_api_url: z.string().url("Por favor, insira uma URL válida."),
  external_api_app: z.string().optional(),
  external_api_token: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "A chave de API do Gemini é obrigatória."),
  GEMINI_MODEL: z.string().min(1, "É necessário selecionar um modelo."),
  company_logo_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), `Tamanho máximo de 2MB.`)
    .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), "Apenas .png, .jpg, .svg e .webp são permitidos."),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      external_api_url: "",
      external_api_app: "",
      external_api_token: "",
      GEMINI_API_KEY: "",
      GEMINI_MODEL: "gemini-1.5-flash-latest",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');
      
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar configurações', description: error.message });
      } else {
        const settingsRows = (data as { key: string; value: string | null }[] | null) ?? [];
        const settingsMap = new Map(settingsRows.map((item) => [item.key, item.value ?? ""]));
        form.reset({
          external_api_url: settingsMap.get('external_api_url') || '',
          external_api_app: settingsMap.get('external_api_app') || '',
          external_api_token: settingsMap.get('external_api_token') || '',
          GEMINI_API_KEY: settingsMap.get('GEMINI_API_KEY') || '',
          GEMINI_MODEL: settingsMap.get('GEMINI_MODEL') || 'gemini-1.5-flash-latest',
        });
        setCurrentLogoUrl(settingsMap.get('company_logo_url') || null);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [form, supabase, toast]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);

    let logoUrl = currentLogoUrl;

    if (data.company_logo_file) {
      const file = data.company_logo_file;
      const filePath = `public/company-logo.${file.name.split('.').pop()}`;

      const { error: uploadError } = await supabase.storage.from('site-assets').upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({ variant: 'destructive', title: 'Erro de Upload', description: `Não foi possível enviar o logo: ${uploadError.message}` });
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
      logoUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
    }

    const settingsToUpsert = Object.entries(data)
      .filter(([key]) => key !== 'company_logo_file')
      .map(([key, value]) => ({ key, value: String(value) }));
    
    settingsToUpsert.push({ key: 'company_logo_url', value: logoUrl || '' });
      
    const { error } = await supabase.from('system_settings').upsert(settingsToUpsert, { onConflict: 'key' });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Configurações salvas com sucesso.' });
      if (logoUrl) {
          setCurrentLogoUrl(logoUrl);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Gerencie as configurações e integrações globais do site.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>Identidade Visual do Painel</CardTitle>
                    <CardDescription>
                    Personalize o painel com a sua marca. O logo será usado nos cabeçalhos das áreas restritas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="company_logo_file"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Logo da Empresa (ícone quadrado)</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-logo" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-border hover:border-primary hover:bg-accent">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground"/>
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WEBP (MAX. 2MB)</p>
                                    </div>
                                    <Input id="dropzone-file-logo" type="file" className="hidden" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                                </label>
                            </div> 
                        </FormControl>
                        {field.value?.name && <p className="text-sm text-muted-foreground mt-2">Novo: {field.value.name}</p>}
                        {currentLogoUrl && !field.value?.name && (
                            <div className="mt-4">
                                <p className="text-sm text-foreground mb-2">Logo atual:</p>
                                <Image src={currentLogoUrl} alt="Logo atual" width={48} height={48} className="rounded-lg border border-border p-1 bg-card"/>
                            </div>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>Inteligência Artificial</CardTitle>
                <CardDescription>
                  Configure a chave de API e o modelo para as funcionalidades de IA, como a geração de artigos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="GEMINI_API_KEY"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave da API do Google Gemini</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Cole sua chave de API aqui" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">
                        Sua chave é armazenada de forma segura. Você pode obter uma em{' '}
                        <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                            Google AI Studio
                        </Link>.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="GEMINI_MODEL"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Modelo Gemini</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um modelo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Rápido e Custo-benefício)</SelectItem>
                                <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Mais Poderoso)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                           O modelo Flash é mais rápido e barato, ideal para a maioria das tarefas. O Pro é mais potente para tarefas complexas.
                        </p>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary"/>Integrações Externas</CardTitle>
                <CardDescription>
                  Configure os endpoints e credenciais para serviços externos (área do cliente).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="external_api_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Base da API</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.seuprovedor.com.br" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">
                        Esta é a URL que o sistema usará para autenticar clientes e buscar dados. Não inclua caminhos como `/api`.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="external_api_app"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><AppWindow size={14}/>App da API (O.S.)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Discordrotas" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">
                        Nome do aplicativo para autenticação na API de Ordens de Serviço.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="external_api_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><KeyRound size={14}/>Token da API (O.S.)</FormLabel>
                      <FormControl>
                        <Input placeholder="Cole o token aqui" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">
                        Token para autenticação na API de Ordens de Serviço.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
