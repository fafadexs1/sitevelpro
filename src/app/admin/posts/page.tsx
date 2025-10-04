
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
  Upload,
  Newspaper,
  Image as ImageIcon
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
import { Badge } from "@/components/ui/badge";

// ==================================
// Tipagem e Schema
// ==================================
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  is_published: boolean;
  created_at: string;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  author_name?: string | null;
};

const postSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  slug: z.string().min(3, "O slug é obrigatório.").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  excerpt: z.string().max(200, "O resumo deve ter no máximo 200 caracteres.").optional(),
  content: z.string().min(10, "O conteúdo é obrigatório."),
  author_name: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean().default(false),
  cover_image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "Apenas .jpg, .png e .webp."),
});
type PostFormData = z.infer<typeof postSchema>;


// ==================================
// Componente de Formulário
// ==================================
function PostForm({
  mode,
  post,
  onSave,
  onOpenChange,
}: {
  mode: "add" | "edit";
  post?: Post | null;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: post ? { ...post, excerpt: post.excerpt ?? '', content: post.content ?? '' } : { is_published: false, title: "", slug: "", content: "" },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const watchTitle = form.watch("title");
  useEffect(() => {
    if (mode === 'add') {
      form.setValue("slug", generateSlug(watchTitle), { shouldValidate: true });
    }
  }, [watchTitle, form, mode]);

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    let coverImageUrl = post?.cover_image_url;

    if (data.cover_image_file) {
        const file = data.cover_image_file;
        const filePath = `post-${data.slug}-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file, { upsert: true });
        if (uploadError) {
            toast({ variant: "destructive", title: "Erro de Upload", description: uploadError.message });
            setIsSubmitting(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
        coverImageUrl = urlData.publicUrl;
    }

    const postData = { 
        ...data, 
        cover_image_url: coverImageUrl,
        published_at: data.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
    };
    delete (postData as any).cover_image_file;
    
    let error;
    if (mode === "add") {
      ({ error } = await supabase.from("posts").insert(postData));
    } else if (mode === "edit" && post) {
      ({ error } = await supabase.from("posts").update(postData).eq("id", post.id));
    }

    if (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: `Não foi possível salvar o artigo: ${error.message}`});
    } else {
      toast({ title: "Sucesso!", description: "Artigo salvo com sucesso." });
      onSave();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Novo Artigo" : "Editar Artigo"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
            {/* Coluna de conteúdo principal */}
            <div className="md:col-span-2 space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Artigo</FormLabel><FormControl><Input placeholder="Ex: 5 Dicas para Melhorar seu Wi-Fi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Conteúdo</FormLabel><FormControl><Textarea placeholder="Escreva seu artigo aqui... (suporta Markdown)" {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Configurações de SEO</h3>
                    <FormField control={form.control} name="meta_title" render={({ field }) => (<FormItem><FormLabel>Meta Título</FormLabel><FormControl><Input placeholder="Título para o Google (máx 60 caracteres)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meta_description" render={({ field }) => (<FormItem><FormLabel>Meta Descrição</FormLabel><FormControl><Textarea placeholder="Descrição para o Google (máx 160 caracteres)" {...field} rows={3}/></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {/* Coluna lateral */}
            <div className="md:col-span-1 space-y-4">
                <FormField control={form.control} name="is_published" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Publicado</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="ex: 5-dicas-wifi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="author_name" render={({ field }) => (<FormItem><FormLabel>Nome do Autor</FormLabel><FormControl><Input placeholder="Seu Nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (<FormItem><FormLabel>Resumo (Opcional)</FormLabel><FormControl><Textarea placeholder="Um resumo curto do artigo" {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="cover_image_file" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file-cover" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-border hover:border-primary hover:bg-accent">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground"/><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span></p></div>
                                <Input id="dropzone-file-cover" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}/>
                            </label>
                        </div> 
                      </FormControl>
                      {field.value?.name && <p className="text-sm text-muted-foreground mt-2">Novo: {field.value.name}</p>}
                      {post?.cover_image_url && !field.value?.name && <div className="mt-2"><p className="text-sm">Atual:</p><Image src={post.cover_image_url} alt="Preview" width={120} height={67} className="rounded-md border border-border object-cover"/></div>}
                      <FormMessage />
                  </FormItem>
              )}/>
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
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar artigos', description: error.message });
    } else {
      setPosts(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    fetchPosts();
  };
  
  const handleDelete = async (postId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Artigo deletado.' });
      fetchPosts();
    }
  };
  
  const handleTogglePublish = async (post: Post) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('posts')
        .update({ 
            is_published: !post.is_published,
            published_at: !post.is_published ? new Date().toISOString() : null
        })
        .eq('id', post.id);

    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status de publicação.' });
    } else {
        toast({ title: 'Sucesso!', description: `Artigo ${!post.is_published ? 'publicado' : 'movido para rascunho'}.` });
        fetchPosts();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Artigos</h1>
          <p className="text-muted-foreground">Crie e edite conteúdo para o blog do seu site.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPost(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-foreground sm:max-w-4xl">
            <PostForm mode={editingPost ? "edit" : "add"} post={editingPost} onSave={handleSave} onOpenChange={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Artigos Cadastrados</CardTitle>
          <CardDescription>
            Gerencie os artigos do seu blog. Apenas artigos publicados aparecerão no site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead className="hidden md:table-cell">Autor</TableHead>
                        <TableHead className="hidden lg:table-cell">Data de Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {posts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">Nenhum artigo cadastrado.</TableCell></TableRow>
                ) : (
                    posts.map((post) => (
                    <TableRow key={post.id}>
                        <TableCell>
                          <Switch
                            id={`publish-switch-${post.id}`}
                            checked={post.is_published}
                            onCheckedChange={() => handleTogglePublish(post)}
                            aria-label={`Publicar/despublicar artigo ${post.title}`}
                          />
                          <span className="ml-2 text-xs">{post.is_published ? 'Publicado' : 'Rascunho'}</span>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{post.author_name || 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{new Date(post.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => { setEditingPost(post); setIsModalOpen(true);}}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent className="bg-background text-foreground">
                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(post.id)}>Continuar</AlertDialogAction>
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
