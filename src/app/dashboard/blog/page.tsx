// src/app/dashboard/blog/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// Mock data for blog posts - replace with actual data and table component later
const mockBlogPosts = [
  { id: "1", title: "Getting Started with Next.js 14", status: "Published", lastUpdated: "2023-10-26" },
  { id: "2", title: "Mastering Tailwind CSS", status: "Draft", lastUpdated: "2023-11-05" },
  { id: "3", title: "The Rise of AI in Web Development", status: "Published", lastUpdated: "2023-11-15" },
];

export default function BlogManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Blog Posts</h2>
          <p className="text-muted-foreground">Create, edit, and manage your blog content.</p>
        </div>
        <Button asChild>
          {/* This link would ideally go to a /dashboard/blog/new page or open a modal */}
          <Link href="#">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>
            Manage your published and draft blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockBlogPosts.length > 0 ? (
            <ul className="divide-y divide-border">
              {mockBlogPosts.map((post) => (
                <li key={post.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className={`font-semibold ${post.status === 'Published' ? 'text-green-600' : 'text-yellow-600'}`}>{post.status}</span>
                       {' '}&bull; Last updated: {post.lastUpdated}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">No blog posts yet. Write your first article!</p>
          )}
        </CardContent>
      </Card>
      {/* TODO: Implement a proper table (e.g., ShadCN Table) and form with Markdown editor for CRUD operations. */}
    </div>
  );
}
