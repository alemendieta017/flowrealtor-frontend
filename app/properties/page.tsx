"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTableView } from "@/components/data-table-view";
import { propertiesApi } from "@/lib/api";
import { formatPrice, type Property } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Eye, MapPin, Plus } from "lucide-react";
import Link from "next/link";

const AGENT_ID = "7bc227f4-4251-4ced-873c-29df8bd7229b"; // TODO: auth

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  sold: "bg-blue-100 text-blue-700",
  rented: "bg-purple-100 text-purple-700",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  active: "Activa",
  sold: "Vendida",
  rented: "Alquilada",
};

export default function PropertiesPage() {
  const columns = [
    {
      header: "Propiedad",
      accessor: (p: Property) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
            {p.images?.[0] ? (
              <img
                src={p.images[0].url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium truncate max-w-[150px] sm:max-w-[200px] text-xs sm:text-sm">
              {p.title || `${p.propertyType} en ${p.neighborhood}`}
            </div>
            <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {p.neighborhood}, {p.city}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Tipo",
      accessor: (p: Property) => (
        <span className="capitalize text-xs sm:text-sm">{p.propertyType}</span>
      ),
    },
    {
      header: "Precio",
      accessor: (p: Property) => (
        <span className="font-medium text-xs sm:text-sm">
          {formatPrice(Number(p.priceAmount), p.currency)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (p: Property) => (
        <Badge
          variant="secondary"
          className={`${statusColors[p.status] || "bg-gray-100"} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[p.status] || p.status}
        </Badge>
      ),
    },
    {
      header: "Fecha",
      accessor: (p: Property) => (
        <span className="text-muted-foreground text-xs sm:text-sm">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (p: Property) => (
        <div className="flex items-center gap-2">
          <Link href={`/properties/${p.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-auto bg-muted/20">
          {/* Top Bar for Consistency */}
          <div className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Propiedades</h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  Gestioná tu catálogo inmobiliario
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

          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <DataTableView<Property>
              title="Mis Propiedades"
              description="Gestioná todas tus propiedades cargadas."
              columns={columns}
              fetchData={(params) => propertiesApi.list(AGENT_ID, params)}
              searchPlaceholder="Buscar por título o barrio..."
              filters={[
                {
                  key: "status",
                  placeholder: "Estado",
                  options: [
                    { label: "Activa", value: "active" },
                    { label: "Borrador", value: "draft" },
                    { label: "Vendida", value: "sold" },
                    { label: "Alquilada", value: "rented" },
                  ],
                },
                {
                  key: "type",
                  placeholder: "Tipo",
                  options: [
                    { label: "Casa", value: "casa" },
                    { label: "Departamento", value: "departamento" },
                    { label: "Oficina", value: "oficina" },
                    { label: "Terreno", value: "terreno" },
                    { label: "Local", value: "local" },
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
