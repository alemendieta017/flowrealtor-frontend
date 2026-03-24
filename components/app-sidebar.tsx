"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "Propiedades",
    icon: Building2,
    href: "/properties",
  },
  {
    title: "Briefs (PDF)",
    icon: FileText,
    href: "/briefs",
  },
  {
    title: "Redes Sociales",
    icon: ImageIcon,
    href: "/social",
  },
  {
    title: "Videos",
    icon: Video,
    href: "/videos",
  },
];

const secondaryNavItems = [
  {
    title: "Configuración",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Ayuda",
    icon: HelpCircle,
    href: "/help",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Link href="/properties/new">
              <Plus className="h-4 w-4" />
              Nueva Propiedad
            </Link>
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-3">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    className="gap-3 px-3 py-2 transition-colors hover:bg-secondary"
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
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-3">
            Soporte
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    className="gap-3 px-3 py-2 transition-colors hover:bg-secondary"
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
      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-4 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Plan Pro
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Genera contenido ilimitado para tus propiedades
          </p>
          <Button variant="secondary" size="sm" className="w-full text-xs">
            Actualizar Plan
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
