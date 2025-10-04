
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
};

async function PostCard({ post, index }: { post: Post, index: number }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            {post.cover_image_url && (
                <div className="aspect-video overflow-hidden">
                    <Image 
                        src={post.cover_image_url} 
                        alt={post.title} 
                        width={400} 
                        height={225} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-6">
                {post.published_at && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3.5 h-3.5"/>
                        {new Date(post.published_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                )}
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm line-clamp-3">{post.excerpt || 'Leia mais para descobrir...'}</p>
            </div>
        </Link>
    );
}

export default async function BlogSection() {
    const supabase = createClient();
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

    if (error || !posts || posts.length === 0) {
        return null; // Don't render the section if there are no posts or an error occurs
    }

    return (
        <section id="blog" className="border-t border-border bg-secondary py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 max-w-2xl lg:mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Fique por Dentro</h2>
                    <p className="mt-2 text-muted-foreground">Dicas, novidades e tudo sobre o universo da conectividade.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/blog">Ver todos os artigos <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
