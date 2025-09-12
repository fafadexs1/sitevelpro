
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Settings, Link as LinkIcon, KeyRound, AppWindow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  external_api_url: z.string().url("Por favor, insira uma URL válida."),
  external_api_app: z.string().optional(),
  external_api_token: z.string().optional(),
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
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['external_api_url', 'external_api_app', 'external_api_token']);
      
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar configurações', description: error.message });
      } else {
        const settingsMap = new Map(data.map(item => [item.key, item.value]));
        form.reset({
          external_api_url: settingsMap.get('external_api_url') || '',
          external_api_app: settingsMap.get('external_api_app') || '',
          external_api_token: settingsMap.get('external_api_token') || '',
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
                <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary"/>Integrações Externas</CardTitle>
                <CardDescription>
                  Configure os endpoints e credenciais para serviços externos.
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
