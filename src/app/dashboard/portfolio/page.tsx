// src/app/dashboard/portfolio/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// Mock data for portfolio items - replace with actual data and table component later
const mockPortfolioItems = [
  { id: "1", title: "E-commerce Platform", lastUpdated: "2023-10-15" },
  { id: "2", title: "Task Management App", lastUpdated: "2023-11-01" },
  { id: "3", title: "Personal Blog CMS", lastUpdated: "2023-11-20" },
];

export default function PortfolioManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio Items</h2>
          <p className="text-muted-foreground">Manage your showcased projects.</p>
        </div>
        <Button asChild>
          {/* This link would ideally go to a /dashboard/portfolio/new page or open a modal */}
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
          {mockPortfolioItems.length > 0 ? (
            <ul className="divide-y divide-border">
              {mockPortfolioItems.map((item) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">Last updated: {item.lastUpdated}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">No portfolio items yet. Add your first project!</p>
          )}
        </CardContent>
      </Card>
       {/* TODO: Implement a proper table (e.g., ShadCN Table) and form for CRUD operations. */}
    </div>
  );
}
