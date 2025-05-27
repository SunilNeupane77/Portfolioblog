// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutGrid, Newspaper, Edit3, Settings, BarChart3, Zap, LogOut, UserCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutGrid, exact: true },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: Edit3 },
  { name: 'Blog Posts', href: '/dashboard/blog', icon: Newspaper },
  { name: 'SEO Enhancer', href: '/dashboard/seo-enhancer', icon: Lightbulb },
  // { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  // { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully." });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out." });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
  };

  const activeNavItemName = useMemo(() => {
    if (typeof currentPathname !== 'string') return 'Dashboard';
    const activeItem = navItems.find(item => {
        if (typeof item.href !== 'string') return false; // Ensure item.href is a string
        return currentPathname === item.href || (!item.exact && currentPathname.startsWith(item.href));
    });
    return activeItem?.name || 'Dashboard';
  }, [currentPathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // This will be shown briefly before redirection if JS is slow or disabled,
    // but useEffect should handle redirection for most cases.
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Zap className="h-7 w-7 text-sidebar-primary" />
            <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Prolific CMS</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = typeof currentPathname === 'string' && typeof item.href === 'string' &&
                (currentPathname === item.href || (!item.exact && currentPathname.startsWith(item.href)));
              return (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      tooltip={{children: item.name, side: "right", align: "center"}}
                      isActive={isActive}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
           <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground">{user.displayName || "User"}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:p-0">
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:m-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold text-foreground">
            {activeNavItemName}
          </h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
