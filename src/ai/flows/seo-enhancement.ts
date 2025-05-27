// src/ai/flows/seo-enhancement.ts
'use server';

/**
 * @fileOverview An AI-driven tool that suggests improvements for SEO by identifying relevant keywords and optimizing content.
 *
 * - seoEnhancement - A function that handles the SEO enhancement process.
 * - SEOEnhancementInput - The input type for the seoEnhancement function.
 * - SEOEnhancementOutput - The return type for the seoEnhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SEOEnhancementInputSchema = z.object({
  content: z.string().describe('The content to be optimized for SEO.'),
  keywords: z.string().optional().describe('Optional keywords to include in the SEO optimization.'),
});
export type SEOEnhancementInput = z.infer<typeof SEOEnhancementInputSchema>;

const SEOEnhancementOutputSchema = z.object({
  titleSuggestion: z.string().describe('Suggested title for the content.'),
  metaDescriptionSuggestion: z.string().describe('Suggested meta description for the content.'),
  keywordSuggestions: z.array(z.string()).describe('Suggested keywords to improve SEO.'),
  contentOptimizationSuggestions: z.string().describe('Suggestions for optimizing the content itself.'),
});
export type SEOEnhancementOutput = z.infer<typeof SEOEnhancementOutputSchema>;

export async function seoEnhancement(input: SEOEnhancementInput): Promise<SEOEnhancementOutput> {
  return seoEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoEnhancementPrompt',
  input: {schema: SEOEnhancementInputSchema},
  output: {schema: SEOEnhancementOutputSchema},
  prompt: `You are an SEO expert. Your goal is to provide suggestions to improve the SEO of the given content.

  Content: {{{content}}}

  {{~#if keywords}}
  Existing Keywords: {{{keywords}}}
  {{~/if}}

  Provide the following:
  - A suggested title for the content.
  - A suggested meta description for the content.
  - Suggested keywords to improve SEO. These should be relevant to the content.
  - Suggestions for optimizing the content itself.

  Ensure that all suggestions are clear, concise, and actionable.
  `,
});

const seoEnhancementFlow = ai.defineFlow(
  {
    name: 'seoEnhancementFlow',
    inputSchema: SEOEnhancementInputSchema,
    outputSchema: SEOEnhancementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
