'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTableView } from '@/components/data-table-view';
import { socialApi } from '@/lib/api';
import type { SocialPost } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, ExternalLink, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Fallido',
};

export default function SocialPostsPage() {
  const { user, isLoading } = useAuth();

  const columns = [
    {
      header: 'Propiedad',
      accessor: (p: SocialPost) => (
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
            <Image className="text-accent-foreground h-5 w-5" />
          </div>
          <div>
            <div className="max-w-[150px] truncate text-xs font-medium sm:max-w-[250px] sm:text-sm">
              {p.property?.title || 'Sin título'}
            </div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              ID: {p.propertyId.slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (p: SocialPost) => <span className="text-xs capitalize sm:text-sm">{p.type}</span>,
    },
    {
      header: 'Estado',
      accessor: (p: SocialPost) => (
        <Badge
          variant="secondary"
          className={`${statusColors[p.status] || 'bg-gray-100'} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[p.status] || p.status}
        </Badge>
      ),
    },
    {
      header: 'Generado',
      accessor: (p: SocialPost) => (
        <span className="text-muted-foreground text-[10px] sm:text-sm">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (p: SocialPost) => (
        <div className="flex items-center gap-2">
          <Link href={`/properties/${p.propertyId}`}>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              Ver Contenido
            </Button>
          </Link>
          <Link href={`/properties/${p.propertyId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
      className: 'text-right',
    },
  ];

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="bg-muted/20 flex-1 overflow-auto">
          {/* Top Bar for Consistency */}
          <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg font-bold sm:text-xl">Redes Sociales</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  Posteos y carousels generados
                </p>
              </div>
            </div>
            <Link href="/properties/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Propiedad</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </Link>
          </div>

          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <DataTableView<SocialPost>
              title="Mis Posteos"
              description="Contenido visual optimizado para Instagram y Facebook."
              columns={columns}
              fetchData={(params) => socialApi.list(user.id, params)}
              searchPlaceholder="Filtrar por propiedad..."
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
