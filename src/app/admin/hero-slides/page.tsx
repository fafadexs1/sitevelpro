
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
  Play,
  Upload,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import Image from "next/image";
import { Slider } from "@/components/ui/slider";

// ==================================
// Tipagem e Schema
// ==================================
type HeroSlide = {
  id: string;
  pre_title?: string;
  title_regular?: string;
  title_highlighted?: string;
  subtitle?: string;
  image_url?: string;
  image_url_mobile?: string;
  image_opacity?: number;
  button_primary_text?: string;
  button_primary_link?: string;
  button_secondary_text?: string;
  button_secondary_link?: string;
  feature_1_text?: string;
  feature_2_text?: string;
  is_active: boolean;
  sort_order: number;
};

const slideSchema = z.object({
  pre_title: z.string().optional(),
  title_regular: z.string().min(1, "O título é obrigatório."),
  title_highlighted: z.string().optional(),
  subtitle: z.string().optional(),
  image_opacity: z.number().min(0).max(100).default(30),
  button_primary_text: z.string().optional(),
  button_primary_link: z.string().optional(),
  button_secondary_text: z.string().optional(),
  button_secondary_link: z.string().optional(),
  feature_1_text: z.string().optional(),
  feature_2_text: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
  image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "Apenas .jpg, .png e .webp."),
  image_file_mobile: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "Apenas .jpg, .png e .webp."),
});
type SlideFormData = z.infer<typeof slideSchema>;


// ==================================
// Componente de Formulário
// ==================================
function SlideForm({
  mode,
  slide,
  onSave,
  onOpenChange,
}: {
  mode: "add" | "edit";
  slide?: HeroSlide | null;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
    defaultValues: slide ? { ...slide, image_opacity: slide.image_opacity ?? 30 } : { is_active: true, sort_order: 0, image_opacity: 30 },
  });

  const opacityValue = form.watch("image_opacity");

  const onSubmit = async (data: SlideFormData) => {
    setIsSubmitting(true);
    let imageUrl = slide?.image_url;
    let imageUrlMobile = slide?.image_url_mobile;

    // Upload da imagem de desktop
    if (data.image_file) {
        const file = data.image_file;
        const filePath = `hero-desktop-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('hero-slides').upload(filePath, file, { upsert: true });
        if (uploadError) {
            toast({ variant: "destructive", title: "Erro de Upload (Desktop)", description: uploadError.message });
            setIsSubmitting(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('hero-slides').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
    }

    // Upload da imagem de mobile
    if (data.image_file_mobile) {
        const file = data.image_file_mobile;
        const filePath = `hero-mobile-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('hero-slides').upload(filePath, file, { upsert: true });
        if (uploadError) {
            toast({ variant: "destructive", title: "Erro de Upload (Mobile)", description: uploadError.message });
            setIsSubmitting(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('hero-slides').getPublicUrl(filePath);
        imageUrlMobile = urlData.publicUrl;
    }

    const slideData = { 
        ...data, 
        image_url: imageUrl, 
        image_url_mobile: imageUrlMobile,
        image_opacity: data.image_opacity 
    };
    delete (slideData as any).image_file;
    delete (slideData as any).image_file_mobile;
    
    let error;
    if (mode === "add") {
      ({ error } = await supabase.from("hero_slides").insert(slideData));
    } else if (mode === "edit" && slide) {
      ({ error } = await supabase.from("hero_slides").update(slideData).eq("id", slide.id));
    }

    if (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: `Não foi possível salvar o slide: ${error.message}`});
    } else {
      toast({ title: "Sucesso!", description: "Slide salvo com sucesso." });
      onSave();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Adicionar Novo Slide" : "Editar Slide"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-4 p-1 pr-4">
            <FormField control={form.control} name="title_regular" render={({ field }) => (<FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input placeholder="Internet para tudo que importa" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="title_highlighted" render={({ field }) => (<FormItem><FormLabel>Título em Destaque</FormLabel><FormControl><Input placeholder="ultrarrápida" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="pre_title" render={({ field }) => (<FormItem><FormLabel>Pré-título</FormLabel><FormControl><Input placeholder="Nova geração: Wi-Fi 6" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Textarea placeholder="Planos estáveis, latência baixíssima..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <FormField control={form.control} name="image_file" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Imagem Desktop (1920x1080px)</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file-hero-desktop" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-border hover:border-primary hover:bg-accent">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground"/><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste</p></div>
                                <Input id="dropzone-file-hero-desktop" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                            </label>
                        </div> 
                      </FormControl>
                      {field.value?.name && <p className="text-sm text-muted-foreground mt-2">Novo: {field.value.name}</p>}
                      {slide?.image_url && !field.value?.name && <div className="mt-2"><p className="text-sm">Atual:</p><Image src={slide.image_url} alt="Preview Desktop" width={120} height={67} className="rounded-md border border-border"/></div>}
                      <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="image_file_mobile" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Imagem Mobile (1080x1920px)</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file-hero-mobile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-border hover:border-primary hover:bg-accent">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground"/><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste</p></div>
                                <Input id="dropzone-file-hero-mobile" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                            </label>
                        </div> 
                      </FormControl>
                      {field.value?.name && <p className="text-sm text-muted-foreground mt-2">Novo: {field.value.name}</p>}
                      {slide?.image_url_mobile && !field.value?.name && <div className="mt-2"><p className="text-sm">Atual:</p><Image src={slide.image_url_mobile} alt="Preview Mobile" width={67} height={120} className="rounded-md border border-border"/></div>}
                      <FormMessage />
                  </FormItem>
              )}/>
            </div>

             <FormField
                control={form.control}
                name="image_opacity"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Opacidade da Imagem de Fundo ({opacityValue}%)</FormLabel>
                        <FormControl>
                            <Slider
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={100}
                                step={1}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="button_primary_text" render={({ field }) => (<FormItem><FormLabel>Botão Primário (Texto)</FormLabel><FormControl><Input placeholder="Conhecer planos" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="button_primary_link" render={({ field }) => (<FormItem><FormLabel>Botão Primário (Link)</FormLabel><FormControl><Input placeholder="#planos" {...field} /></FormControl></FormItem>)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="button_secondary_text" render={({ field }) => (<FormItem><FormLabel>Botão Secundário (Texto)</FormLabel><FormControl><Input placeholder="Ver vantagens" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="button_secondary_link" render={({ field }) => (<FormItem><FormLabel>Botão Secundário (Link)</FormLabel><FormControl><Input placeholder="#vantagens" {...field} /></FormControl></FormItem>)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="feature_1_text" render={({ field }) => (<FormItem><FormLabel>Benefício 1</FormLabel><FormControl><Input placeholder="Garantia de satisfação" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="feature_2_text" render={({ field }) => (<FormItem><FormLabel>Benefício 2</FormLabel><FormControl><Input placeholder="Latência baixíssima" {...field} /></FormControl></FormItem>)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sort_order" render={({ field }) => (<FormItem><FormLabel>Ordem</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="is_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4"><FormLabel>Ativo</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
             </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


// ==================================
// Página Principal
// ==================================
export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar slides', description: error.message });
    } else {
      setSlides(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    fetchSlides();
  };
  
  const handleDelete = async (slideId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('hero_slides').delete().eq('id', slideId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Slide deletado.' });
      fetchSlides();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Slides do Herói</h1>
          <p className="text-muted-foreground">Gerencie os slides que aparecem no topo da página inicial.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSlide(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-foreground sm:max-w-2xl">
            <SlideForm mode={editingSlide ? "edit" : "add"} slide={editingSlide} onSave={handleSave} onOpenChange={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Slides Cadastrados</CardTitle>
          <CardDescription>
            Arraste para reordenar os slides. Apenas slides ativos serão exibidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {slides.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-24">Nenhum slide cadastrado.</TableCell></TableRow>
                ) : (
                    slides.map((slide) => (
                    <TableRow key={slide.id}>
                        <TableCell><GripVertical className="h-5 w-5 text-muted-foreground"/></TableCell>
                        <TableCell className="text-foreground">{slide.is_active ? "Ativo" : "Inativo"}</TableCell>
                        <TableCell className="font-medium text-foreground">{slide.title_regular}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingSlide(slide); setIsModalOpen(true);}}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent className="bg-background text-foreground">
                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(slide.id)}>Continuar</AlertDialogAction>
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
