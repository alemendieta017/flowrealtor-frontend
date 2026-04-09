'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTableView } from '@/components/data-table-view';
import { propertiesApi } from '@/lib/api';
import { formatPrice, type Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Eye, MapPin, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  sold: 'bg-blue-100 text-blue-700',
  rented: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activa',
  sold: 'Vendida',
  rented: 'Alquilada',
};

export default function PropertiesPage() {
  const { user, isLoading } = useAuth();

  const columns = [
    {
      header: 'Propiedad',
      accessor: (p: Property) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted h-10 w-10 flex-shrink-0 overflow-hidden rounded">
            {p.images?.[0] ? (
              <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="text-muted-foreground h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <div className="max-w-[150px] truncate text-xs font-medium sm:max-w-[200px] sm:text-sm">
              {p.title || `${p.propertyType} en ${p.neighborhood}`}
            </div>
            <div className="text-muted-foreground flex items-center text-[10px] sm:text-xs">
              <MapPin className="mr-1 h-3 w-3" />
              {p.neighborhood}, {p.city}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (p: Property) => (
        <span className="text-xs capitalize sm:text-sm">{p.propertyType}</span>
      ),
    },
    {
      header: 'Precio',
      accessor: (p: Property) => (
        <span className="text-xs font-medium sm:text-sm">
          {formatPrice(Number(p.priceAmount), p.currency)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (p: Property) => (
        <Badge
          variant="secondary"
          className={`${statusColors[p.status] || 'bg-gray-100'} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[p.status] || p.status}
        </Badge>
      ),
    },
    {
      header: 'Fecha',
      accessor: (p: Property) => (
        <span className="text-muted-foreground text-xs sm:text-sm">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (p: Property) => (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/properties/${p.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
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
                <h1 className="text-lg font-bold sm:text-xl">Propiedades</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  Gestioná tu catálogo inmobiliario
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href="/properties/new">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Propiedad</span>
                <span className="sm:hidden">Nuevo</span>
              </Link>
            </Button>
          </div>

          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <DataTableView<Property>
              title="Mis Propiedades"
              description="Gestioná todas tus propiedades cargadas."
              columns={columns}
              fetchData={(params) => propertiesApi.list(user.id, params)}
              searchPlaceholder="Buscar por título o barrio..."
              filters={[
                {
                  key: 'status',
                  placeholder: 'Estado',
                  options: [
                    { label: 'Activa', value: 'active' },
                    { label: 'Borrador', value: 'draft' },
                    { label: 'Vendida', value: 'sold' },
                    { label: 'Alquilada', value: 'rented' },
                  ],
                },
                {
                  key: 'type',
                  placeholder: 'Tipo',
                  options: [
                    { label: 'Casa', value: 'casa' },
                    { label: 'Departamento', value: 'departamento' },
                    { label: 'Oficina', value: 'oficina' },
                    { label: 'Terreno', value: 'terreno' },
                    { label: 'Local', value: 'local' },
                  ],
                },
              ]}
              actions={null}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
