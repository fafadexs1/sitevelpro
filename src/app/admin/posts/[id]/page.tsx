
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Upload,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { generateArticle } from "@/ai/flows/generate-article-flow";


// Dynamically import the RichTextEditor to avoid SSR issues
const DynamicRichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div> }
);


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
  content?: any;
  meta_title?: string | null;
  meta_description?: string | null;
  author_name?: string | null;
};

const postSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  slug: z.string().min(3, "O slug é obrigatório.").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  excerpt: z.string().max(200, "O resumo deve ter no máximo 200 caracteres.").optional().nullable(),
  content: z.any().optional().nullable(),
  author_name: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  cover_image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024), `Tamanho máximo de 5MB.`)
    .refine((file) => !file || (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "Apenas .jpg, .png e .webp."),
});
type PostFormData = z.infer<typeof postSchema>;


// ==================================
// Página do Formulário
// ==================================
export default function PostFormPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();
  const isNew = params.id === 'new';

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
        is_published: false, 
        title: "", 
        slug: "", 
        content: "",
        excerpt: "",
        author_name: "",
        meta_title: "",
        meta_description: "",
    },
  });

  useEffect(() => {
    if (!isNew) {
      const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          toast({ variant: "destructive", title: "Erro", description: "Artigo não encontrado." });
          router.push('/admin/posts');
        } else {
          setPost(data as Post);
          form.reset({
             ...data,
             excerpt: data.excerpt ?? '',
             content: data.content ?? '',
             author_name: data.author_name ?? '',
             meta_title: data.meta_title ?? '',
             meta_description: data.meta_description ?? '',
          });
        }
        setLoading(false);
      };
      fetchPost();
    } else {
        setLoading(false);
    }
  }, [params.id, isNew, supabase, router, toast, form]);

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
    if (isNew) {
      form.setValue("slug", generateSlug(watchTitle), { shouldValidate: true });
    }
  }, [watchTitle, form, isNew]);

  const handleGenerateArticle = async () => {
    if (!aiTopic) {
      toast({ variant: "destructive", title: "Tópico Vazio", description: "Por favor, insira um tópico para a IA gerar o artigo." });
      return;
    }
    setIsGenerating(true);
    try {
      const article = await generateArticle({ topic: aiTopic });
      form.reset({
        ...form.getValues(),
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
      });
      toast({ title: "Sucesso!", description: "Artigo gerado pela IA." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro de IA", description: error.message || "Não foi possível gerar o artigo." });
    } finally {
      setIsGenerating(false);
    }
  };


  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    let coverImageUrl = post?.cover_image_url;

    try {
        // Upload da imagem de capa
        if (data.cover_image_file) {
            const file = data.cover_image_file;
            const filePath = `post-${data.slug}-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file, { upsert: true });
            if (uploadError) throw new Error(`Erro de Upload (Capa): ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
            coverImageUrl = urlData.publicUrl;
        }

        const postData = { 
            ...data, 
            cover_image_url: coverImageUrl,
            published_at: data.is_published && (!post || !post.published_at) ? new Date().toISOString() : post?.published_at,
            updated_at: new Date().toISOString()
        };
        delete (postData as any).cover_image_file;
        
        let error;
        if (isNew) {
          const { data: newPost, error: insertError } = await supabase.from("posts").insert(postData).select().single();
          error = insertError;
          if (!error && newPost) {
            toast({ title: "Sucesso!", description: "Artigo criado com sucesso." });
            router.push(`/admin/posts/${newPost.id}`);
          }
        } else if (post) {
          ({ error } = await supabase.from("posts").update(postData).eq("id", post.id));
           if (!error) {
              toast({ title: "Sucesso!", description: "Artigo salvo com sucesso." });
              const { data: updatedData } = await supabase.from("posts").select("*").eq("id", params.id).single();
              if(updatedData) {
                   setPost(updatedData);
                   form.reset(updatedData);
              }
           }
        }

        if (error) throw new Error(`Não foi possível salvar o artigo: ${error.message}`);

    } catch (e: any) {
        toast({ variant: "destructive", title: "Erro ao Salvar", description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if(loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin"/></div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <header className="mb-8 flex items-center justify-between">
            <div>
                 <Button variant="outline" size="sm" asChild className="mb-4">
                    <Link href="/admin/posts"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar para a lista</Link>
                 </Button>
                <h1 className="text-3xl font-bold text-foreground">{isNew ? "Novo Artigo" : "Editar Artigo"}</h1>
                <p className="text-muted-foreground">Preencha os campos para criar ou atualizar seu artigo.</p>
            </div>
             <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar Artigo
            </Button>
        </header>

         <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Assistente de IA</CardTitle>
                <CardDescription>Não sabe por onde começar? Dê um tópico para a IA e deixe ela criar um rascunho para você.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Input 
                        placeholder="Ex: 'Os benefícios do Wi-Fi 6 para jogos online'"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        disabled={isGenerating}
                    />
                    <Button type="button" onClick={handleGenerateArticle} disabled={isGenerating || !aiTopic}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Gerar Artigo
                    </Button>
                </div>
            </CardContent>
        </Card>


         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Conteúdo Principal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Artigo</FormLabel><FormControl><Input placeholder="Ex: 5 Dicas para Melhorar seu Wi-Fi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conteúdo do Artigo</FormLabel>
                                    <FormControl>
                                        <DynamicRichTextEditor
                                            initialContent={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>SEO (Otimização para Buscadores)</CardTitle>
                         <CardDescription>Como seu artigo aparecerá no Google.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="meta_title" render={({ field }) => (<FormItem><FormLabel>Meta Título</FormLabel><FormControl><Input placeholder="Título para o Google (máx 60 caracteres)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="meta_description" render={({ field }) => (<FormItem><FormLabel>Meta Descrição</FormLabel><FormControl><Textarea placeholder="Descrição para o Google (máx 160 caracteres)" {...field} rows={3} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
            </div>

             {/* Coluna lateral */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Publicação</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="is_published" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Publicado</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                        <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="ex: 5-dicas-wifi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="author_name" render={({ field }) => (<FormItem><FormLabel>Nome do Autor</FormLabel><FormControl><Input placeholder="Seu Nome" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="excerpt" render={({ field }) => (<FormItem><FormLabel>Resumo (Opcional)</FormLabel><FormControl><Textarea placeholder="Um resumo curto do artigo para a listagem do blog." {...field} rows={4} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Imagem de Capa</CardTitle>
                        <CardDescription>Resolução ideal: 1200 x 630 pixels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="cover_image_file" render={({ field: { onChange, value, ...rest} }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file-cover" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-border hover:border-primary hover:bg-accent">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground"/><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span></p></div>
                                            <Input id="dropzone-file-cover" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...rest}/>
                                        </label>
                                    </div> 
                                </FormControl>
                                {value?.name && <p className="text-sm text-muted-foreground mt-2">Novo: {value.name}</p>}
                                {post?.cover_image_url && !value?.name && (
                                <div className="mt-4">
                                    <p className="text-sm">Imagem Atual:</p>
                                    <Image src={post.cover_image_url} alt="Preview" width={200} height={112} className="rounded-md border border-border object-cover mt-2"/>
                                </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>
            </div>
         </div>
      </form>
    </Form>
  );
}
