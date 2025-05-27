// src/app/(main)/blog/page.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Mock data for blog posts - replace with data from Firestore later
const mockPosts = [
  {
    id: "1",
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js 14",
    excerpt: "A comprehensive guide to kickstart your Next.js 14 projects with the new App Router and Server Components.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "coding tutorial",
    author: "Jane Doe",
    date: "October 26, 2023",
  },
  {
    id: "2",
    slug: "mastering-tailwind-css",
    title: "Mastering Tailwind CSS for Modern UIs",
    excerpt: "Learn advanced Tailwind CSS techniques to build beautiful and responsive user interfaces efficiently.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "web design",
    author: "John Smith",
    date: "November 5, 2023",
  },
  {
    id: "3",
    slug: "ai-in-web-development",
    title: "The Rise of AI in Web Development",
    excerpt: "Exploring how artificial intelligence is transforming the web development landscape, from coding assistants to generative UI.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "artificial intelligence",
    author: "Alex Johnson",
    date: "November 15, 2023",
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-muted/50 rounded-lg shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Prolific Blog</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on web development, technology, and more.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {post.imageUrl && (
              <div className="relative h-56 w-full">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg"
                  data-ai-hint={post.dataAiHint}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                By {post.author} on {post.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-foreground/90 text-ellipsis overflow-hidden line-clamp-3">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link href={`/blog/${post.slug}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
