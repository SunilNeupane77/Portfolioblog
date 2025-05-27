// src/app/(main)/blog/[slug]/page.tsx
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { notFound } from "next/navigation";
import { collection, query, where, getDocs, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/types/blog";
import { format } from 'date-fns';


async function getPostBySlug(slug: string): Promise<Post | null> {
  const postsCol = collection(db, "posts");
  // Query for slug and ensure it's published
  const q = query(postsCol, where("slug", "==", slug), where("status", "==", "published"), limit(1));
  
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
    } as Post;
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
        publishedTime: post.createdAt.toDate().toISOString(),
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

// Optional: Generate static paths if you have a known set of published slugs
// export async function generateStaticParams() {
//   const postsCol = collection(db, "posts");
//   const q = query(postsCol, where("status", "==", "published"));
//   const querySnapshot = await getDocs(q);
//   const slugs = querySnapshot.docs.map(doc => ({ slug: doc.data().slug as string }));
//   return slugs;
// }
// export const revalidate = 3600; // Revalidate every hour


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Mock tags - replace with actual tags from Firestore if implemented
  const tags = ["Tech", "Tutorial", "Firebase"]; 

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
              <AvatarFallback>{post.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={post.createdAt.toDate().toISOString()}>
              {format(post.createdAt.toDate(), 'MMMM d, yyyy')}
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
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
