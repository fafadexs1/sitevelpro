
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, User } from "lucide-react";
import type { Metadata } from 'next';
import React from 'react';
import ReactMarkdown from "react-markdown";

type PageProps = {
  params: { slug: string };
};

// This function can be named anything
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('title, meta_title, meta_description, cover_image_url')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!post) {
    return {
      title: 'Artigo não encontrado',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description || undefined,
        images: post.cover_image_url ? [post.cover_image_url] : [],
    }
  };
}


export default async function BlogPostPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <article>
          {post.cover_image_url && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}
          
          <div className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">{post.title}</h1>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-6">
                        {post.author_name && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{post.author_name}</span>
                            </div>
                        )}
                         {post.published_at && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={post.published_at}>
                                    {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </time>
                            </div>
                        )}
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90">
                   {post.content ? (
                      <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
                            img: ({node, ...props}) => <Image src={props.src || ''} alt={props.alt || ''} width={800} height={450} className="rounded-lg mx-auto my-6" />,
                        }}
                      >{post.content}</ReactMarkdown>
                    ) : (
                      <p>Conteúdo não disponível ou em formato inválido.</p>
                    )}
                </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
    const supabase = createClient();
    const { data: posts } = await supabase
        .from('posts')
        .select('slug')
        .eq('is_published', true);

    return posts?.map(post => ({
        slug: post.slug,
    })) || [];
}
