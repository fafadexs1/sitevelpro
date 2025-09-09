
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { DynamicSeoRule } from '@/app/admin/seo/page';

const ruleSchema = z.object({
  name: z.string().min(1, 'O nome da regra é obrigatório.'),
  slug_pattern: z.string().min(1, 'O padrão de slug é obrigatório.').startsWith('/', { message: 'Deve começar com /' }),
  meta_title: z.string().min(1, 'O template de título é obrigatório.'),
  meta_description: z.string().min(1, 'O template de descrição é obrigatório.'),
  canonical_url: z.string().url('URL inválida.').optional().or(z.literal('')),
  allow_indexing: z.boolean().default(true),
  schema_type: z.enum(['LocalBusiness', 'Product', 'Offer', 'FAQ', 'Article', 'None']).default('None'),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface DynamicSeoRuleFormProps {
  rule: DynamicSeoRule | null;
  onRuleSaved: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DynamicSeoRuleForm({ rule, onRuleSaved, onOpenChange }: DynamicSeoRuleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mode = rule ? 'edit' : 'add';

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: rule?.name || '',
      slug_pattern: rule?.slug_pattern || '',
      meta_title: rule?.meta_title || '',
      meta_description: rule?.meta_description || '',
      canonical_url: rule?.canonical_url || '',
      allow_indexing: rule?.allow_indexing ?? true,
      schema_type: rule?.schema_type || 'None',
    },
  });

  const onSubmit = async (data: RuleFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();

    const ruleData = {
        ...data,
        canonical_url: data.canonical_url || null,
    };

    let error;
    if (mode === 'add') {
      ({ error } = await supabase.from('dynamic_seo_rules').insert(ruleData));
    } else {
      ({ error } = await supabase.from('dynamic_seo_rules').update(ruleData).eq('id', rule!.id));
    }
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar regra',
        description: error.message,
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: `Regra de SEO ${mode === 'add' ? 'criada' : 'atualizada'} com sucesso.`,
      });
      onRuleSaved();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Nova Regra de SEO' : 'Editar Regra de SEO'}</DialogTitle>
          <DialogDescription>
            Defina como as páginas dinâmicas serão otimizadas para os buscadores. Use variáveis como {'{cidade}'} ou {'{plano}'}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-1 pr-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome da Regra</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Páginas de Cidades" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="slug_pattern"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Padrão de Slug</FormLabel>
                    <FormControl>
                        <Input placeholder="/internet-em-{cidade}" {...field} />
                    </FormControl>
                     <p className="text-xs text-gray-500">Use variáveis (ex: {'{cidade}'}) para gerar múltiplas páginas ou insira um caminho estático (ex: /promo-x).</p>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Template do Título (Meta Title)</FormLabel>
                    <FormControl>
                        <Input placeholder="Internet Fibra em {cidade} | Velpro" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

             <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Template da Descrição (Meta Description)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Contrate o melhor plano de internet fibra para {cidade} com a Velpro." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

             <FormField
                control={form.control}
                name="canonical_url"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>URL Canônica (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://seu-site.com/cobertura/{cidade}" {...field} />
                    </FormControl>
                     <p className="text-xs text-gray-500">Ajuda a evitar conteúdo duplicado. Deixe em branco se não aplicável.</p>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                 <FormField
                    control={form.control}
                    name="schema_type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Schema (Rich Snippet)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="None">Nenhum</SelectItem>
                                <SelectItem value="LocalBusiness">LocalBusiness (Negócio Local)</SelectItem>
                                <SelectItem value="Product">Product (Produto)</SelectItem>
                                <SelectItem value="Offer">Offer (Oferta)</SelectItem>
                                <SelectItem value="FAQ">FAQ (Perguntas Frequentes)</SelectItem>
                                <SelectItem value="Article">Article (Artigo)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="allow_indexing"
                    render={({ field }) => (
                        <FormItem className="flex flex-col rounded-lg border p-3">
                            <FormLabel className="text-sm">Permitir Indexação</FormLabel>
                             <p className="text-xs text-gray-600 mb-2">Permite que o Google veja esta página.</p>
                            <FormControl className="m-0">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'add' ? 'Criar Regra' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
