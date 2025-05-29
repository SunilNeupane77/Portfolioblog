// src/app/(main)/blog/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient, Query } from "@/lib/appwrite";
import type { Post } from "@/types/blog";
import { format } from 'date-fns';
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getPublishedPosts(): Promise<Post[]> {
  try {
    // Use server client to avoid authentication issues
    const { databases, databaseId, blogCollectionId } = createServerClient();
    
    // Public query - only return published posts with explicit Query parameters
    const response = await databases.listDocuments(
      databaseId,
      blogCollectionId,
      [
        Query.equal("status", ["published"]),
        Query.orderDesc("createdAt")
      ]
    );
    
    return response.documents.map(doc => {
      return {
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
    });
  } catch (error) {
    console.error("Error fetching published posts: ", error);
    return []; // Return empty array on error
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-muted/50 rounded-lg shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Prolific Blog</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on web development, technology, and more.
        </p>
      </section>

      {posts.length > 0 ? (
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
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
                    data-ai-hint="blog post image" // Generic hint
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
                  By {post.authorName || 'Anonymous'} on {post.createdAt ? format(post.createdAt, 'MMMM d, yyyy') : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-foreground/90 text-ellipsis overflow-hidden line-clamp-3">
                  {/* TODO: Create and use an excerpt if available */}
                  {post.content ? 
                    <>
                      {post.content.substring(0, 150)}{post.content.length > 150 ? "..." : ""}
                    </> : 
                    <span className="italic text-muted-foreground">No content available</span>
                  }
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
      ) : (
        <section className="text-center py-10">
          <p className="text-muted-foreground text-lg">No blog posts published yet. Check back soon!</p>
        </section>
      )}
    </div>
  );
}

// Optional: Revalidate data (ISR) - example: revalidate every hour
// export const revalidate = 3600;
