// src/app/(main)/blog/[slug]/page.tsx
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, UserCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { notFound } from "next/navigation";

// Mock data - replace with actual data fetching from Firestore
const mockPostsData: Record<string, any> = {
  "getting-started-with-nextjs": {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js 14",
    content: `
Next.js 14 is here, and it brings a host of improvements to the developer experience, especially with the stable App Router. This guide will walk you through setting up a new Next.js 14 project and exploring some of its key features.

## Prerequisites

- Node.js 18.17 or later
- Basic knowledge of React and JavaScript

## Creating a New Project

To create a new Next.js app, open your terminal and run:

\`\`\`bash
npx create-next-app@latest
\`\`\`

You'll be prompted with a few questions:

- What is your project named? \`my-app\`
- Would you like to use TypeScript? \`Yes\`
- Would you like to use ESLint? \`Yes\`
- Would you like to use Tailwind CSS? \`Yes\`
- Would you like to use \`src/\` directory? \`Yes\`
- Would you like to use App Router? (recommended) \`Yes\`
- Would you like to customize the default import alias? \`No\`

This sets up a new Next.js project with TypeScript, ESLint, Tailwind CSS, and the App Router inside the \`src\` directory.

## Key Features

### App Router

The App Router, introduced in Next.js 13 and now stable, provides a new way to structure your applications using nested layouts and server components.

### Server Components

React Server Components allow you to write UI that can be rendered and optionally cached on the server. This can lead to improved performance by reducing the amount of JavaScript sent to the client.

### Route Handlers

Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs.

## Conclusion

Next.js 14 continues to push the boundaries of what's possible with React development. The App Router and Server Components offer powerful new paradigms for building fast, modern web applications.
    `,
    imageUrl: "https://placehold.co/1200x600.png",
    dataAiHint: "coding screen",
    author: {
      name: "Jane Doe",
      avatarUrl: "https://placehold.co/50x50.png?text=JD",
      dataAiHint: "author portrait"
    },
    date: "October 26, 2023",
    tags: ["Next.js", "React", "Web Development", "JavaScript"],
  }
};

async function getPost(slug: string) {
  // In a real app, fetch this from Firestore
  // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const post = mockPostsData[slug];
  if (!post) {
    return null;
  }
  return post;
}

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }
  return {
    title: `${post.title} | Prolific Blog`,
    description: post.content.substring(0, 160) + "...", // Simple excerpt for meta
  };
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {post.imageUrl && (
        <div className="relative w-full h-72 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint={post.dataAiHint}
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint={post.author.dataAiHint} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={new Date(post.date).toISOString()}>
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </div>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none 
                      prose-headings:text-primary prose-headings:font-semibold
                      prose-a:text-accent hover:prose-a:text-accent/80 prose-a:transition-colors
                      prose-strong:text-foreground/90
                      prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                      prose-code:bg-muted prose-code:text-foreground prose-code:p-1 prose-code:rounded-sm prose-code:font-mono
                      prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:shadow-sm">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}

// Optional: Generate static paths if you have a known set of slugs
// export async function generateStaticParams() {
//   // Fetch all post slugs from Firestore
//   const slugs = Object.keys(mockPostsData); // Replace with actual fetch
//   return slugs.map((slug) => ({
//     slug,
//   }));
// }

// Revalidate data (ISR) - example: revalidate every hour
// export const revalidate = 3600;
