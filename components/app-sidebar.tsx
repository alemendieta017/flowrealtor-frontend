'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  FileText,
  Image as ImageIcon,
  Video,
  Settings,
  HelpCircle,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

const mainNavItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/',
  },
  {
    title: 'Propiedades',
    icon: Building2,
    href: '/properties',
  },
  {
    title: 'Briefs (PDF)',
    icon: FileText,
    href: '/briefs',
  },
  {
    title: 'Redes Sociales',
    icon: ImageIcon,
    href: '/social',
  },
  {
    title: 'Videos',
    icon: Video,
    href: '/videos',
  },
];

const secondaryNavItems = [
  {
    title: 'Configuración',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Ayuda',
    icon: HelpCircle,
    href: '/help',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Sidebar className="border-border border-r">
      <SidebarHeader className="p-4">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 text-xs tracking-wider uppercase">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
                    className="hover:bg-secondary gap-3 px-3 py-2 transition-colors"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 text-xs tracking-wider uppercase">
            Soporte
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
                    className="hover:bg-secondary gap-3 px-3 py-2 transition-colors"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <div className="from-primary/20 to-accent/20 border-primary/30 rounded-lg border bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-foreground text-sm font-medium">Plan Pro</span>
          </div>
          <p className="text-muted-foreground mb-3 text-xs">
            Genera contenido ilimitado para tus propiedades
          </p>
          <Button variant="secondary" size="sm" className="w-full text-xs">
            Actualizar Plan
          </Button>
        </div>

        <SidebarSeparator />

        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={user?.photoUrl || ''} alt={user?.name || 'User'} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-semibold">{user?.name || 'Usuario'}</span>
              <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            onClick={() => logout()}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
