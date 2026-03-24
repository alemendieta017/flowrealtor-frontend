"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { propertiesApi } from "@/lib/api";
import { formatPrice, type Property } from "@/lib/types";
import {
  Plus,
  Home,
  TrendingUp,
  FileText,
  Video,
  Settings,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";

const AGENT_ID = "7bc227f4-4251-4ced-873c-29df8bd7229b"; // TODO: replace with auth

function PropertyCard({ property }: { property: Property }) {
  const coverImage = property.images?.[0];
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
    rented: "bg-purple-100 text-purple-700",
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer group overflow-hidden">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={property.title ?? property.neighborhood}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[property.status] ?? "bg-gray-100"}`}
            >
              {property.status === "draft"
                ? "Borrador"
                : property.status === "active"
                  ? "Activa"
                  : property.status === "sold"
                    ? "Vendida"
                    : "Alquilada"}
            </span>
          </div>
          <div className="absolute top-2 left-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground capitalize">
              {property.operationType === "venta" ? "Venta" : "Alquiler"}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">
            {property.title ??
              `${property.propertyType} en ${property.neighborhood}`}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {property.neighborhood}, {property.city}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary">
              {formatPrice(Number(property.priceAmount), property.currency)}
            </span>
            <div className="flex gap-1 text-muted-foreground text-xs">
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only recent 6 for display
    propertiesApi
      .list(AGENT_ID, { limit: 6 })
      .then((res) => {
        setProperties(res.data);
        setTotalCount(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch counts (simplified for MVP)
    propertiesApi
      .list(AGENT_ID, { limit: 100 })
      .then((res) => {
        setActiveCount(res.data.filter((p) => p.status === "active").length);
        setDraftCount(res.data.filter((p) => p.status === "draft").length);
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      label: "Propiedades activas",
      value: activeCount,
      icon: Home,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "En proceso",
      value: draftCount,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total propiedades",
      value: totalCount,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-auto">
          {/* Top bar */}
          <div className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
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

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/properties/new">
                <Card className="hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Nueva Propiedad</p>
                      <p className="text-xs text-muted-foreground">
                        Generar contenido con IA
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/settings">
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-muted p-2.5 rounded-lg">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Configurar Perfil</p>
                      <p className="text-xs text-muted-foreground">
                        Logo, colores, contacto
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Card className="opacity-60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-muted p-2.5 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Estadísticas</p>
                    <p className="text-xs text-muted-foreground">
                      Próximamente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Mis Propiedades</h2>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/properties/new">
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : properties.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-8 sm:p-12 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">
                    Aún no tenés propiedades
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Cargá tu primera propiedad y dejá que la IA genere el
                    contenido automáticamente.
                  </p>
                  <Button asChild>
                    <Link href="/properties/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primera propiedad
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
