// src/app/dashboard/seo-enhancer/page.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, Terminal } from 'lucide-react';
import { seoEnhancement, type SEOEnhancementInput, type SEOEnhancementOutput } from '@/ai/flows/seo-enhancement'; // Assuming flow is directly callable

const seoSchema = z.object({
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  keywords: z.string().optional(),
});

type SEOFormInputs = z.infer<typeof seoSchema>;

export default function SEOEnhancerPage() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<SEOEnhancementOutput | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SEOFormInputs>({
    resolver: zodResolver(seoSchema),
  });

  const onSubmit: SubmitHandler<SEOFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSeoSuggestions(null);

    try {
      const inputData: SEOEnhancementInput = {
        content: data.content,
        keywords: data.keywords || undefined,
      };
      // Directly call the server action (Genkit flow)
      const result = await seoEnhancement(inputData);
      setSeoSuggestions(result);
      toast({
        title: "SEO Suggestions Generated",
        description: "Review the suggestions below to enhance your content.",
      });
    } catch (err: any) {
      console.error("Error generating SEO suggestions:", err);
      const errorMessage = err.message || "Failed to generate SEO suggestions. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">AI SEO Enhancement Tool</CardTitle>
              <CardDescription>
                Optimize your content for search engines. Provide your text and optional keywords, and let AI suggest improvements.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="content">Content to Optimize</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Paste your article, blog post, or page content here..."
                rows={10}
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Existing Keywords (Optional)</Label>
              <Input
                id="keywords"
                {...register("keywords")}
                placeholder="e.g., nextjs development, seo tips, content strategy"
                className={errors.keywords ? "border-destructive" : ""}
              />
              {errors.keywords && <p className="text-sm text-destructive">{errors.keywords.message}</p>}
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                {isLoading ? "Analyzing..." : "Get Suggestions"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setSeoSuggestions(null); setError(null);}} disabled={isLoading}>
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {seoSuggestions && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">SEO Enhancement Suggestions</CardTitle>
            <CardDescription>Review these AI-generated suggestions to improve your content's SEO.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggested Title:</h3>
              <p className="p-3 bg-muted rounded-md text-sm">{seoSuggestions.titleSuggestion}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggested Meta Description:</h3>
              <p className="p-3 bg-muted rounded-md text-sm">{seoSuggestions.metaDescriptionSuggestion}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggested Keywords:</h3>
              {seoSuggestions.keywordSuggestions.length > 0 ? (
                <ul className="list-disc list-inside p-3 bg-muted rounded-md text-sm space-y-1">
                  {seoSuggestions.keywordSuggestions.map((kw, index) => (
                    <li key={index}>{kw}</li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 bg-muted rounded-md text-sm">No additional keywords suggested.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Content Optimization Suggestions:</h3>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                {seoSuggestions.contentOptimizationSuggestions}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
