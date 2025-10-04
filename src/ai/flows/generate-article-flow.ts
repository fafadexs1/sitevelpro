
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

// Input Schema: Just a topic for the article
export const ArticleTopicSchema = z.object({
  topic: z.string().describe('The main topic or title for the blog article.'),
});
export type ArticleTopic = z.infer<typeof ArticleTopicSchema>;

// Output Schema: A complete, structured article
export const GeneratedArticleSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title for the article.'),
  content: z.string().describe('The full content of the article, formatted as HTML with tags like <h2>, <p>, <ul>, <li>, and <strong>.'),
  excerpt: z.string().describe('A short, engaging summary of the article, around 160 characters.'),
  meta_title: z.string().describe('An SEO meta title, around 60 characters long.'),
  meta_description: z.string().describe('An SEO meta description, around 155 characters long.'),
});
export type GeneratedArticle = z.infer<typeof GeneratedArticleSchema>;

const generateArticlePrompt = ai.definePrompt(
  {
    name: 'generateArticlePrompt',
    input: { schema: ArticleTopicSchema },
    output: { schema: GeneratedArticleSchema },
    prompt: `
      You are an expert blog writer and SEO specialist for a modern internet provider called Velpro.
      Your task is to write a complete, engaging, and SEO-optimized blog post about the given topic.

      Topic: {{{topic}}}

      Instructions:
      1.  **Title:** Create a compelling title that is interesting to read and good for SEO.
      2.  **Content:** Write the full article. Structure it with HTML tags. Use <h2> for subheadings, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis. The tone should be helpful, modern, and tech-savvy.
      3.  **Excerpt:** Write a short summary of the article.
      4.  **Meta Title:** Create a concise title for search engine results (around 60 characters).
      5.  **Meta Description:** Create an enticing description for search engine results (around 155 characters).

      Generate the complete article based on these instructions.
    `,
  },
);

export const generateArticleFlow = ai.defineFlow(
  {
    name: 'generateArticleFlow',
    inputSchema: ArticleTopicSchema,
    outputSchema: GeneratedArticleSchema,
  },
  async (input) => {
    const { output } = await generateArticlePrompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid article structure.");
    }
    return output;
  }
);


export async function generateArticle(input: ArticleTopic): Promise<GeneratedArticle> {
  return generateArticleFlow(input);
}
