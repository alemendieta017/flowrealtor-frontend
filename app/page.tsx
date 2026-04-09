'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { propertiesApi } from '@/lib/api';
import { formatPrice, type Property } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Home, TrendingUp, Settings, Building2, MapPin, Loader2 } from 'lucide-react';

function PropertyCard({ property }: { property: Property }) {
  const coverImage = property.images?.[0];
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    sold: 'bg-blue-100 text-blue-700',
    rented: 'bg-purple-100 text-purple-700',
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-md">
        <div className="bg-muted relative aspect-video overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={property.title ?? property.neighborhood}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="text-muted-foreground h-8 w-8" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[property.status] ?? 'bg-gray-100'}`}
            >
              {property.status === 'draft'
                ? 'Borrador'
                : property.status === 'active'
                  ? 'Activa'
                  : property.status === 'sold'
                    ? 'Vendida'
                    : 'Alquilada'}
            </span>
          </div>
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold capitalize">
              {property.operationType === 'venta' ? 'Venta' : 'Alquiler'}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="truncate font-semibold">
            {property.title ?? `${property.propertyType} en ${property.neighborhood}`}
          </h3>
          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {property.neighborhood}, {property.city}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-primary font-bold">
              {formatPrice(Number(property.priceAmount), property.currency)}
            </span>
            <div className="text-muted-foreground flex gap-1 text-xs">
              {property.bedrooms && <span>{property.bedrooms} dorm.</span>}
              {property.bathrooms && <span>· {property.bathrooms} baños</span>}
              {property.builtArea && <span>· {property.builtArea}m²</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Fetch only recent 6 for display
    propertiesApi
      .list(user.id, { limit: 6 })
      .then((res) => {
        setProperties(res.data);
        setTotalCount(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch counts (simplified for MVP)
    propertiesApi
      .list(user.id, { limit: 100 })
      .then((res) => {
        setActiveCount(res.data.filter((p) => p.status === 'active').length);
        setDraftCount(res.data.filter((p) => p.status === 'draft').length);
      })
      .catch(() => {});
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Propiedades activas',
      value: activeCount,
      icon: Home,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'En proceso',
      value: draftCount,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total propiedades',
      value: totalCount,
      icon: Building2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* Top bar */}
          <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg font-bold sm:text-xl">Dashboard</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  FlowRealtor — Bienvenido
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

          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`${stat.bg} ${stat.color} rounded-xl p-3`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/properties/new">
                <Card className="border-primary/20 hover:border-primary cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-primary/10 rounded-lg p-2.5">
                      <Plus className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Nueva Propiedad</p>
                      <p className="text-muted-foreground text-xs">Generar contenido con IA</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/settings">
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-muted rounded-lg p-2.5">
                      <Settings className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Configurar Perfil</p>
                      <p className="text-muted-foreground text-xs">Logo, colores, contacto</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Card className="opacity-60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-muted rounded-lg p-2.5">
                    <TrendingUp className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Estadísticas</p>
                    <p className="text-muted-foreground text-xs">Próximamente</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties list */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Ultimas propiedades</h2>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/properties/new">
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed p-8 text-center sm:p-12">
                  <Building2 className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <h3 className="text-lg font-semibold">Aún no tenés propiedades</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Cargá tu primera propiedad y dejá que la IA genere el contenido automáticamente.
                  </p>
                  <Button asChild>
                    <Link href="/properties/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear primera propiedad
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
