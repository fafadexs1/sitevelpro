

import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, User } from "lucide-react";
import type { Metadata } from 'next';
import React from 'react';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// --- Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select({
    title: postsTable.title,
    meta_title: postsTable.meta_title,
    meta_description: postsTable.meta_description,
    cover_image_url: postsTable.cover_image_url
  }).from(postsTable).where(eq(postsTable.slug, slug)).limit(1);

  const post = result[0];

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


import { db } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLayoutData } from "@/lib/data/get-layout-data";

export default async function BlogPostPage({ params }: PageProps) {
  const { domainType, companyLogoUrl } = await getLayoutData();
  const { slug } = await params;

  const result = await db.select().from(postsTable).where(eq(postsTable.slug, slug)).limit(1);
  const post = result[0];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header domainType={domainType} companyLogoUrl={companyLogoUrl} />
      <main className="flex-grow">
        <article>
          <header className="relative bg-secondary py-24 sm:py-32">
            {post.cover_image_url && (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {post.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/80">
                {post.author_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author_name}</span>
                  </div>
                )}
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {(() => {
                      const publishedAt = new Date(post.published_at);
                      return (
                        <time dateTime={publishedAt.toISOString()}>
                          {publishedAt.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-foreground/90"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// --- Static Path Generation ---
export async function generateStaticParams() {
  try {
    const posts = await db.select({ slug: postsTable.slug }).from(postsTable).where(eq(postsTable.is_published, true));

    return posts?.map(post => ({
      slug: post.slug,
    })) || [];
  } catch (error) {
    console.error('Exception in generateStaticParams for blog posts:', error);
    return [];
  }
}
