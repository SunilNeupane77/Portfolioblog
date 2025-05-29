// src/app/(main)/blog/[slug]/page.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createServerClient, Query } from "@/lib/appwrite";
import type { Post } from "@/types/blog";
import { format } from 'date-fns';
import { CalendarDays } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';


async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // Use server client to avoid authentication issues
    const { databases, databaseId, blogCollectionId } = createServerClient();
    
    // Try to get the post by slug first
    // Only fetch published posts for public viewing to avoid authorization issues
    const response = await databases.listDocuments(
      databaseId,
      blogCollectionId,
      [
        Query.equal("slug", [slug]),
        Query.equal("status", ["published"]), // Only show published posts to the public
        Query.limit(1)
      ]
    );
    
    if (response.documents.length === 0) {
      console.log(`No blog post found with slug: ${slug}`);
      return null;
    }
    
    const doc = response.documents[0];
    
    // Make sure we handle all possible missing fields gracefully
    const post = {
      id: doc.$id,
      title: doc.title || "Untitled Post",
      content: doc.content || "",
      slug: doc.slug || doc.$id,
      imageUrl: doc.imageUrl || "",
      authorName: doc.authorName || "Anonymous",
      authorId: doc.authorId || "",
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
      status: doc.status || "published"
    } as Post;
    
    console.log(`Found blog post: ${post.title}`);
    return post;
  } catch (error) {
    console.error("Error fetching post by slug: ", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you are looking for does not exist or is not available."
    };
  }
  return {
    title: `${post.title} | Prolific Blog`,
    description: post.content.substring(0, 160).replace(/\n/g, ' ') + "...", // Simple excerpt for meta
    openGraph: {
        title: post.title,
        description: post.content.substring(0, 160).replace(/\n/g, ' ') + "...",
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        authors: [post.authorName],
      },
    twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.content.substring(0, 160).replace(/\n/g, ' ') + "...",
        images: post.imageUrl ? [post.imageUrl] : [],
      },
  };
}




export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug);

    if (!post) {
      console.error(`No post found with slug: ${params.slug}`);
      notFound();
    }

    // Mock tags - these would ideally come from your database
    const tags = ["Technology", "Web Development", "NextJS"]; 

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
            data-ai-hint="blog cover image" // Generic hint
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
              {/* Assuming author might have an avatar URL in the future, for now use initials */}
              {/* <AvatarImage src={post.author.avatarUrl} alt={post.authorName} /> */}
              <AvatarFallback>
                {post.authorName ? 
                  post.authorName.split(' ').map(n => n[0] || '').join('') : 
                  'A'
                }
              </AvatarFallback>
            </Avatar>
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, 'MMMM d, yyyy')}
            </time>
          </div>
        </div>
        {/* Mock tags for now */}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag: string) => (
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
        {post.content ? (
          <ReactMarkdown>{post.content}</ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">This post has no content yet.</p>
        )}
      </div>
    </article>
  );
  } catch (error) {
    console.error("Error rendering blog post:", error);
    notFound();
  }
}
