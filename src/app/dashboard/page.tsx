// src/app/dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Edit3, Lightbulb, Newspaper } from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Welcome to your Dashboard, {user?.name || 'User'}!</CardTitle>
          <CardDescription className="text-lg">
            Manage your portfolio, blog posts, and enhance your content with AI-powered SEO tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your central hub for managing all aspects of your Prolific site. Use the navigation on the left to get started.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Portfolio Management
            </CardTitle>
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Showcase your best work. Add, edit, or remove projects from your portfolio.
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/portfolio">Manage Portfolio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Blog Posts
            </CardTitle>
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Share your thoughts and expertise. Create new blog posts or update existing ones.
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/blog">Manage Blog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              AI SEO Enhancer
            </CardTitle>
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
             Optimize your content for search engines with AI-powered suggestions.
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/seo-enhancer">Enhance SEO</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* You can add more summary cards or quick action links here */}
    </div>
  );
}
