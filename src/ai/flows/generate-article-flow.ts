
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Input Schema: Just a topic for the article
const ArticleTopicSchema = z.object({
  topic: z.string().describe('The main topic or title for the blog article.'),
});
export type ArticleTopic = z.infer<typeof ArticleTopicSchema>;

// Output Schema: A complete, structured article
const GeneratedArticleSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title for the article.'),
  content: z.string().describe('The full content of the article, formatted as HTML with tags like <h2>, <p>, <ul>, <li>, and <strong>.'),
  excerpt: z.string().describe('A short, engaging summary of the article, around 160 characters.'),
  meta_title: z.string().describe('An SEO meta title, around 60 characters long.'),
  meta_description: z.string().describe('An SEO meta description, around 155 characters long.'),
});
export type GeneratedArticle = z.infer<typeof GeneratedArticleSchema>;


import { db } from "@/db";
import { system_settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

async function getAiSettings() {
  const data = await db.select({ key: system_settings.key, value: system_settings.value })
    .from(system_settings)
    .where(inArray(system_settings.key, ['GEMINI_API_KEY', 'GEMINI_MODEL']));

  const settingsMap = new Map(data.map(item => [item.key, item.value]));
  const apiKey = settingsMap.get('GEMINI_API_KEY');
  const modelName = (settingsMap.get('GEMINI_MODEL') as string) || 'gemini-1.5-flash-latest';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the system settings.');
  }

  return { apiKey, modelName };
}

export async function generateArticle(input: ArticleTopic): Promise<GeneratedArticle> {
  // Validate input
  const parsedInput = ArticleTopicSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(`Invalid input: ${parsedInput.error.message}`);
  }

  const { apiKey, modelName } = await getAiSettings();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are an expert blog writer and SEO specialist for a modern internet provider called Velpro.
    Your task is to write a complete, engaging, and SEO-optimized blog post about the given topic.

    Topic: ${parsedInput.data.topic}

    Instructions:
    1.  **Title:** Create a compelling title that is interesting to read and good for SEO.
    2.  **Content:** Write the full article. The content must be well-structured HTML. 
        - Start with an introductory paragraph (<p>).
        - Break the article into logical sections, each with a clear and descriptive subheading (<h2>).
        - Each section must contain one or more paragraphs (<p>).
        - Use lists (<ul> and <li>) for items or key points.
        - Use <strong> tags to emphasize important terms.
        - The tone should be helpful, modern, and tech-savvy.
    3.  **Excerpt:** Write a short summary of the article (maximum 160 characters).
    4.  **Meta Title:** Create a concise title for search engine results (around 60 characters).
    5.  **Meta Description:** Create an enticing description for search engine results (around 155 characters).

    Return the response as a valid JSON object matching this schema:
    {
      "title": "string",
      "content": "string (HTML)",
      "excerpt": "string",
      "meta_title": "string",
      "meta_description": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const responseJson = JSON.parse(responseText);

    // Validate the output from the AI
    const parsedOutput = GeneratedArticleSchema.safeParse(responseJson);
    if (!parsedOutput.success) {
      throw new Error(`AI returned an invalid data structure: ${parsedOutput.error.message}`);
    }

    return parsedOutput.data;

  } catch (error: any) {
    console.error("Error generating article with Gemini:", error);
    // Forward a more user-friendly error message
    if (error.message.includes('SAFETY')) {
      throw new Error('The content could not be generated due to safety settings. Please try a different topic.');
    }
    throw new Error(error.message || 'An unknown error occurred while generating the article.');
  }
}
