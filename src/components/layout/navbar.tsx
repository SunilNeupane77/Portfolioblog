// src/components/layout/navbar.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { BookOpenText, Home, LayoutDashboard, LogIn, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Blog', href: '/blog', icon: BookOpenText },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      const authHook = useAuth();
      await authHook.logout();
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error (e.g., show a toast notification)
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


  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <Zap className="h-7 w-7" />
            <span className="text-2xl font-bold">Prolific</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} legacyBehavior passHref>
                <Button 
                  variant={pathname === item.href ? "secondary" : "ghost"} 
                  className="text-sm sm:text-base"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <item.icon className="mr-0 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Button>
              </Link>
            ))}

            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                    <LogIn className="mr-0 sm:mr-2 h-4 w-4" />
                     <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
              )
            )}
            {loading && (
               <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
