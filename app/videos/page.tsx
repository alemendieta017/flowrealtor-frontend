'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTableView } from '@/components/data-table-view';
import { videosApi } from '@/lib/api';
import type { Video } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video as VideoIcon, ExternalLink, Plus, Play, Loader2 } from 'lucide-react';
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

export default function VideosPage() {
  const { user, isLoading } = useAuth();

  const columns = [
    {
      header: 'Propiedad',
      accessor: (v: Video) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
            <VideoIcon className="text-primary h-5 w-5" />
          </div>
          <div>
            <div className="max-w-[150px] truncate text-xs font-medium sm:max-w-[250px] sm:text-sm">
              {v.property?.title || 'Sin título'}
            </div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              ID: {v.propertyId.slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Formato',
      accessor: (v: Video) => (
        <Badge variant="outline" className="text-[10px] capitalize sm:text-xs">
          {v.format === 'quick' ? 'Reel Rápido' : 'Tour Narrado'}
        </Badge>
      ),
    },
    {
      header: 'Estado',
      accessor: (v: Video) => (
        <Badge
          variant="secondary"
          className={`${statusColors[v.status] || 'bg-gray-100'} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[v.status] || v.status}
        </Badge>
      ),
    },
    {
      header: 'Generado',
      accessor: (v: Video) => (
        <span className="text-muted-foreground text-[10px] sm:text-sm">
          {new Date(v.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (v: Video) => (
        <div className="flex items-center gap-2">
          <Link href={`/properties/${v.propertyId}`}>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Play className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Ver Video</span>
            </Button>
          </Link>
          <Link href={`/properties/${v.propertyId}`}>
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
                <h1 className="text-lg font-bold sm:text-xl">Videos</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  Reels y tours generados con IA
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
            <DataTableView<Video>
              title="Mis Videos"
              description="Videos de alta calidad para tus propiedades."
              columns={columns}
              fetchData={(params) => videosApi.list(user.id, params)}
              searchPlaceholder="Filtrar por propiedad..."
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
