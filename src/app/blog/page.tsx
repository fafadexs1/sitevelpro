
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import type { Metadata } from 'next';

type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    author_name: string | null;
};

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos, dicas e novidades sobre o mundo da conectividade e tecnologia da Velpro.',
};

export default async function BlogListPage() {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at, author_name')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    // Handle error state appropriately
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-secondary border-b border-border py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog da Velpro</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Dicas, novidades e tudo sobre o universo da conectividade e tecnologia.
            </p>
          </div>
        </div>

        <div className="py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {post.cover_image_url && (
                        <div className="md:col-span-1 aspect-video overflow-hidden rounded-2xl border border-border">
                             <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    )}
                    <div className={post.cover_image_url ? "md:col-span-2" : "md:col-span-3"}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 mb-4">
                            {post.published_at && (
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            )}
                            {post.author_name && (
                                <span>por <strong>{post.author_name}</strong></span>
                            )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">Nenhum artigo publicado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
