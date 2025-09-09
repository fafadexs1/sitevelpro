
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
  Map,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  DialogDescription,
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
    AlertDialogTrigger,
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

// ==================================
// Tipagem e Schema
// ==================================
type City = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

const citySchema = z.object({
  name: z.string().min(1, "Nome da cidade é obrigatório."),
  slug: z.string().min(1, "Slug é obrigatório.").regex(/^[a-z0-9-]+$/, "Slug pode conter apenas letras minúsculas, números e hífens."),
});
type CityFormData = z.infer<typeof citySchema>;


// ==================================
// Componente de Formulário
// ==================================
function CityForm({
  mode,
  city,
  onSave,
  onOpenChange,
}: {
  mode: "add" | "edit";
  city?: City | null;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: city ? { name: city.name, slug: city.slug } : { name: "", slug: "" },
  });

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD") // remove acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "") // remove caracteres especiais
      .trim()
      .replace(/\s+/g, "-"); // substitui espaços por hífens
  };

  const watchName = form.watch("name");
  useEffect(() => {
    if (mode === 'add') {
      form.setValue("slug", generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, form, mode]);

  const onSubmit = async (data: CityFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    let error;

    if (mode === "add") {
      ({ error } = await supabase.from("cities").insert(data));
    } else if (mode === "edit" && city) {
      ({ error } = await supabase.from("cities").update(data).eq("id", city.id));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: `Não foi possível salvar a cidade: ${error.code === '23505' ? 'Este slug já está em uso.' : error.message}`,
      });
    } else {
      toast({ title: "Sucesso!", description: "Cidade salva com sucesso." });
      onSave();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Adicionar Nova Cidade" : "Editar Cidade"}</DialogTitle>
          <DialogDescription>
            Cidades cadastradas aqui serão usadas para gerar páginas dinâmicas de SEO.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Cidade</FormLabel>
              <FormControl>
                <Input id="city-name" placeholder="Ex: Valparaíso de Goiás" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug da URL</FormLabel>
              <FormControl>
                <Input id="city-slug" placeholder="ex: valparaiso-de-goias" {...field} />
              </FormControl>
              <p className="text-xs text-white/50">Usado na URL, como em /internet-em/valparaiso-de-goias</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button id="city-form-cancel" type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button id="city-form-save" type="submit" disabled={isSubmitting}>
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
export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("cities").select("*").order("name", { ascending: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar cidades', description: error.message });
    } else {
      setCities(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingCity(null);
    fetchCities();
  };
  
  const handleDelete = async (cityId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('cities').delete().eq('id', cityId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Cidade deletada.' });
      fetchCities();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Cidades</h1>
          <p className="text-white/60">Adicione as cidades onde a Velpro atua.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button id="add-city-button" onClick={() => setEditingCity(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cidade
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-neutral-950 text-white sm:max-w-md">
            <CityForm mode={editingCity ? "edit" : "add"} city={editingCity} onSave={handleSave} onOpenChange={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Card className="border-white/10 bg-neutral-950">
        <CardHeader>
          <CardTitle>Cidades Cadastradas</CardTitle>
          <CardDescription>
            Esta lista alimenta as páginas dinâmicas criadas na seção de SEO e o sitemap do site.
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
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead>Nome</TableHead>
                        <TableHead>Slug (para URL)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {cities.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-white/60 h-24">
                            Nenhuma cidade cadastrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    cities.map((city) => (
                    <TableRow key={city.id} className="border-white/10">
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 font-mono text-xs text-white/70">
                                <LinkIcon className="w-3 h-3"/>
                                <span>{city.slug}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button id={`edit-city-${city.id}`} variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingCity(city); setIsModalOpen(true);}}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button id={`delete-city-trigger-${city.id}`} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-neutral-950 border-white/10 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Essa ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel id={`delete-city-cancel-${city.id}`}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction id={`delete-city-confirm-${city.id}`} onClick={() => handleDelete(city.id)}>
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
         <CardFooter>
            <p className="text-xs text-white/50">
               O 'slug' é a parte da URL que identifica a cidade. Ex: /internet-em/<b>valparaiso-de-goias</b>
            </p>
         </CardFooter>
      </Card>
    </>
  );
};
