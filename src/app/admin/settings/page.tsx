

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Settings, Link as LinkIcon, KeyRound, AppWindow, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const settingsSchema = z.object({
  external_api_url: z.string().url("Por favor, insira uma URL válida."),
  external_api_app: z.string().optional(),
  external_api_token: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "A chave de API do Gemini é obrigatória."),
  GEMINI_MODEL: z.string().min(1, "É necessário selecionar um modelo."),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      external_api_url: "",
      external_api_app: "",
      external_api_token: "",
      GEMINI_API_KEY: "",
      GEMINI_MODEL: "gemini-2.5-flash",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['external_api_url', 'external_api_app', 'external_api_token', 'GEMINI_API_KEY', 'GEMINI_MODEL']);
      
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar configurações', description: error.message });
      } else {
        const settingsMap = new Map(data.map(item => [item.key, item.value]));
        form.reset({
          external_api_url: settingsMap.get('external_api_url') || '',
          external_api_app: settingsMap.get('external_api_app') || '',
          external_api_token: settingsMap.get('external_api_token') || '',
          GEMINI_API_KEY: settingsMap.get('GEMINI_API_KEY') || '',
          GEMINI_MODEL: settingsMap.get('GEMINI_MODEL') || 'gemini-2.5-flash',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [form, supabase, toast]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);

    const settingsToUpsert = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value)
    }));

    const { error } = await supabase.from('system_settings').upsert(settingsToUpsert, { onConflict: 'key' });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Configurações salvas com sucesso.' });
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
                                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido e Custo-benefício)</SelectItem>
                                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Mais Poderoso)</SelectItem>
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
