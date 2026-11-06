
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LayoutDashboard, LogOut, Menu, Puzzle, Users, X, Eye, BarChart2, Calendar, FileText } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';

const navConfig: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
    user: [
        { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/activities', label: 'Actividades', icon: Puzzle },
    ],
    admin: [
        { href: '/admin', label: 'Panel Admin', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Usuarios', icon: Users },
        { href: '/admin/events', label: 'Eventos', icon: Calendar },
        { href: '/supervisor', label: 'Ver Eventos', icon: Eye },
        { href: '/data-analyst', label: 'Análisis', icon: BarChart2 },
        { href: '/content-manager', label: 'Gestión Contenido', icon: FileText },
    ],
    supervisor: [
         { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/activities', label: 'Actividades', icon: Puzzle },
        { href: '/supervisor', label: 'Supervisión', icon: Eye },
    ],
    data_analyst: [
         { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/activities', label: 'Actividades', icon: Puzzle },
        { href: '/data-analyst', label: 'Análisis', icon: BarChart2 },
    ],
    content_manager: [
        { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
        { href: '/activities', label: 'Actividades', icon: Puzzle },
        { href: '/content-manager', label: 'Gestión Contenido', icon: FileText },
    ]
};


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </header>
        <main className="flex-1 container py-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </main>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };
  
  const navLinks = navConfig[role || 'user'] || navConfig.user;
  const rootPath = navLinks[0]?.href || '/dashboard';
  
  const MobileNav = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
           <div className="flex justify-between items-center mb-6">
                <Link href={rootPath} className="flex items-center space-x-2">
                    <Logo />
                    <span className="font-bold">Focus Mind</span>
                </Link>
                <SheetClose asChild>
                     <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Cerrar menú</span>
                    </Button>
                </SheetClose>
            </div>
            <nav className="flex flex-col gap-2">
                {navLinks.map(link => (
                     <SheetClose asChild key={link.href}>
                        <Link href={link.href}>
                            <Button
                                variant={pathname === link.href ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                            >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                     </SheetClose>
                ))}
            </nav>
        </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MobileNav />
          <Link href={rootPath} className="mr-6 hidden md:flex items-center space-x-2">
            <Logo />
            <span className="font-bold hidden sm:inline-block">Focus Mind</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
             {navLinks.map(link => (
                <Button key={link.href} variant={pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/') ? 'secondary' : 'ghost'} asChild size="sm">
                    <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Link>
                </Button>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-secondary/50">
        <div className="container py-4 md:py-8">{children}</div>
      </main>
    </div>
  );
}
