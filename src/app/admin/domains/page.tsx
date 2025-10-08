
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  Globe,
  Store,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ==================================
// Tipagem e Schema
// ==================================
type Domain = {
  id: string;
  hostname: string;
  type: 'main_site' | 'sales_page';
  created_at: string;
};

const domainSchema = z.object({
  hostname: z.string().min(1, "O hostname é obrigatório."),
  type: z.enum(['main_site', 'sales_page'], {
    required_error: "O tipo é obrigatório.",
  }),
});
type DomainFormData = z.infer<typeof domainSchema>;


// ==================================
// Componente de Formulário
// ==================================
function DomainForm({
  mode,
  domain,
  onSave,
  onOpenChange,
}: {
  mode: "add" | "edit";
  domain?: Domain | null;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: domain ? { ...domain } : { hostname: "", type: 'sales_page' },
  });

  const onSubmit = async (data: DomainFormData) => {
    setIsSubmitting(true);
    let error;

    if (mode === "add") {
      ({ error } = await supabase.from("domains").insert(data));
    } else if (mode === "edit" && domain) {
      ({ error } = await supabase.from("domains").update(data).eq("id", domain.id));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: `Não foi possível salvar o domínio: ${error.code === '23505' ? 'Este domínio já está cadastrado.' : error.message}`,
      });
    } else {
      toast({ title: "Sucesso!", description: `Domínio ${mode === 'add' ? 'adicionado' : 'atualizado'} com sucesso.` });
      onSave();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Adicionar Novo Domínio" : "Editar Domínio"}</DialogTitle>
        </DialogHeader>

        <FormField
          control={form.control}
          name="hostname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hostname</FormLabel>
              <FormControl>
                <Input placeholder="Ex: velpro.net.br ou loja.velpro.net.br" {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">Insira o domínio exato que os visitantes usarão, sem "https://" ou "/".</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Domínio</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de página" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sales_page">Página de Vendas</SelectItem>
                  <SelectItem value="main_site">Site Principal</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground">
                    Define o comportamento do botão "Ligue Agora" no cabeçalho.
                </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


// ==================================
// Página Principal
// ==================================
export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("domains").select("*").order("hostname", { ascending: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar domínios', description: error.message });
    } else {
      setDomains(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingDomain(null);
    fetchDomains();
  };
  
  const handleDelete = async (domainId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('domains').delete().eq('id', domainId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Domínio deletado.' });
      fetchDomains();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Domínios</h1>
          <p className="text-muted-foreground">Controle o comportamento do site para cada domínio ou subdomínio.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDomain(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Domínio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-foreground sm:max-w-md">
            <DomainForm mode={editingDomain ? "edit" : "add"} domain={editingDomain} onSave={handleSave} onOpenChange={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Domínios Ativos</CardTitle>
          <CardDescription>
            A configuração de cada domínio altera o destino do botão principal do cabeçalho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
          ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Hostname</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {domains.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                            Nenhum domínio cadastrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    domains.map((domain) => (
                    <TableRow key={domain.id}>
                        <TableCell className="font-medium text-foreground">{domain.hostname}</TableCell>
                        <TableCell>
                            {domain.type === 'main_site' ? (
                                <Badge variant="secondary"><Home className="w-3 h-3 mr-1.5"/> Site Principal</Badge>
                            ) : (
                                <Badge variant="default"><Store className="w-3 h-3 mr-1.5"/> Página de Vendas</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingDomain(domain); setIsModalOpen(true);}}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background text-foreground">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Essa ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(domain.id)}>
                                Continuar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};
