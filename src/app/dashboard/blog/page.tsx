// src/app/dashboard/blog/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { blogCollectionId, databaseId, databases, Query } from "@/lib/appwrite";
import type { Post } from "@/types/blog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Edit, Eye, Loader2, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";

export default function BlogManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login'); // Redirect if not logged in
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Filter by current user to ensure they only see their own posts
        // This resolves the authorization issues
        const response = await databases.listDocuments(
          databaseId,
          blogCollectionId,
          [
            // Filter by current user to ensure proper authorization
            Query.equal("authorId", user.$id),
            // Use a safer sorting approach in case createdAt is missing
            Query.limit(100) // Default to limit and we'll sort client-side
          ]
        );
        
        const postsData = response.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          content: doc.content,
          slug: doc.slug,
          imageUrl: doc.imageUrl,
          authorName: doc.authorName,
          authorId: doc.authorId,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          status: doc.status || "draft"
        } as Post));
        
        // Client-side sorting by createdAt (newest first)
        const sortedPosts = [...postsData].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setPosts(sortedPosts);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again.");
        toast({ variant: "destructive", title: "Error", description: "Could not fetch blog posts." });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [user, authLoading, router, toast]);

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await databases.deleteDocument(
        databaseId,
        blogCollectionId,
        postToDelete.id
      );
      toast({ title: "Post Deleted", description: `"${postToDelete.title}" has been deleted.` });
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));
    } catch (err) {
      console.error("Error deleting post:", err);
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the post." });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy HH:mm');
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Blog Posts</h2>
          <p className="text-muted-foreground">Create, edit, and manage your blog content.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>
            Manage your published and draft blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            {/* TODO: Create /dashboard/blog/edit/[id] page */}
                            <Link href={`/dashboard/blog/edit/${post.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(post)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No blog posts yet. Write your first article!</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
