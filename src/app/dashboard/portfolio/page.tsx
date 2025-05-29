// src/app/dashboard/portfolio/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { blogCollectionId, databaseId, databases, Query } from "@/lib/appwrite";
import type { Post } from "@/types/blog";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PortfolioManagementPage() {
  const [portfolioItems, setPortfolioItems] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Import Auth hook to get current user
  const { user } = require("@/hooks/use-auth").useAuth();
  const { toast } = require("@/hooks/use-toast").useToast();
  const router = require("next/navigation").useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchPortfolioItems = async () => {
      try {
        // Filter by current user ID to ensure proper authorization
        const response = await databases.listDocuments(
          databaseId, 
          blogCollectionId,
          [
            Query.equal("authorId", user.$id), // Only show current user's items
            Query.limit(100) // Get a reasonable number of items
          ]
        );
        
        if (!response || !response.documents || response.documents.length === 0) {
          console.log("No portfolio items found");
          setPortfolioItems([]);
          return;
        }
        
        console.log(`Found ${response.documents.length} portfolio items`);
        
        const transformedItems = response.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title || "Untitled Project",
          content: doc.content || "",
          slug: doc.slug || doc.$id,
          imageUrl: doc.imageUrl || "",
          authorName: doc.authorName || "Anonymous",
          authorId: doc.authorId || "",
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          status: doc.status || "draft",
        }));
        
        // Sort by most recently updated
        const sortedItems = [...transformedItems].sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        );
        
        setPortfolioItems(sortedItems);
      } catch (error: any) {
        console.error("Error fetching portfolio items:", error);
        // Show an error state in the UI instead of just console logging
        setError(error.message || "Failed to fetch portfolio items");
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: "Failed to fetch portfolio items. Please try again." 
        });
        setPortfolioItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio Items</h2>
          <p className="text-muted-foreground">Manage your showcased projects.</p>
        </div>
        <Button asChild>
          <Link href="#">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Projects</CardTitle>
          <CardDescription>
            Here is a list of your current portfolio items. You can edit or delete them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading portfolio items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-destructive font-medium mb-2">Error loading items</p>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : portfolioItems.length > 0 ? (
            <ul className="divide-y divide-border">
              {portfolioItems.map((item) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">Last updated: {item.updatedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No portfolio items found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
