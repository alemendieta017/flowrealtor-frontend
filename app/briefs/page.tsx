'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTableView } from '@/components/data-table-view';
import { briefsApi } from '@/lib/api';
import type { Brief } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';

const AGENT_ID = '7bc227f4-4251-4ced-873c-29df8bd7229b'; // TODO: auth

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

export default function BriefsPage() {
  const columns = [
    {
      header: 'Propiedad',
      accessor: (b: Brief) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
            <FileText className="text-primary h-5 w-5" />
          </div>
          <div>
            <div className="max-w-[150px] truncate text-xs font-medium sm:max-w-[250px] sm:text-sm">
              {b.property?.title || 'Sin título'}
            </div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              ID: {b.propertyId.slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Plantilla',
      accessor: (b: Brief) => <span className="text-xs capitalize sm:text-sm">{b.template}</span>,
    },
    {
      header: 'Estado',
      accessor: (b: Brief) => (
        <Badge
          variant="secondary"
          className={`${statusColors[b.status] || 'bg-gray-100'} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[b.status] || b.status}
        </Badge>
      ),
    },
    {
      header: 'Generado',
      accessor: (b: Brief) => (
        <span className="text-muted-foreground text-[10px] sm:text-sm">
          {new Date(b.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (b: Brief) => (
        <div className="flex items-center gap-2">
          {b.pdfUrl ? (
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs" asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/briefs/${b.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5" />{' '}
                <span className="hidden sm:inline">Descargar</span>
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="h-8 text-xs">
              Generando...
            </Button>
          )}
          <Link href={`/properties/${b.propertyId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
      className: 'text-right',
    },
  ];

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
                <h1 className="text-lg font-bold sm:text-xl">Briefs (PDF)</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  Fichas técnicas generadas
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
            <DataTableView<Brief>
              title="Mis Briefs"
              description="Lista de PDFs generados para tus propiedades."
              columns={columns}
              fetchData={(params) => briefsApi.list(AGENT_ID, params)}
              searchPlaceholder="Filtrar por propiedad..."
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
