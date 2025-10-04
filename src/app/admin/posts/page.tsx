
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Newspaper,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// ==================================
// Tipagem
// ==================================
type Post = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  author_name?: string | null;
};

// ==================================
// Página Principal
// ==================================
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("posts").select("id, title, slug, is_published, author_name, created_at").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar artigos', description: error.message });
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
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
        <Button asChild>
            <Link href="/admin/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Artigo
            </Link>
        </Button>
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
                        <Button asChild variant="ghost" size="sm" className="mr-2">
                           <Link href={`/admin/posts/${post.id}`}>
                                <Edit className="h-4 w-4" />
                           </Link>
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
