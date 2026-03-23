"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTableView } from "@/components/data-table-view";
import { briefsApi } from "@/lib/api";
import type { Brief } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

const AGENT_ID = "7bc227f4-4251-4ced-873c-29df8bd7229b"; // TODO: auth

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
};

export default function BriefsPage() {
  const columns = [
    {
      header: "Propiedad",
      accessor: (b: Brief) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium truncate max-w-[150px] sm:max-w-[250px] text-xs sm:text-sm">
              {b.property?.title || "Sin título"}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              ID: {b.propertyId.slice(0, 8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Plantilla",
      accessor: (b: Brief) => (
        <span className="capitalize text-xs sm:text-sm">{b.template}</span>
      ),
    },
    {
      header: "Estado",
      accessor: (b: Brief) => (
        <Badge
          variant="secondary"
          className={`${statusColors[b.status] || "bg-gray-100"} border-none text-[10px] sm:text-xs`}
        >
          {statusLabels[b.status] || b.status}
        </Badge>
      ),
    },
    {
      header: "Generado",
      accessor: (b: Brief) => (
        <span className="text-muted-foreground text-[10px] sm:text-sm">
          {new Date(b.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (b: Brief) => (
        <div className="flex items-center gap-2">
          {b.pdfUrl ? (
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/briefs/${b.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Descargar</span>
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="text-xs h-8">
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
                <h1 className="text-lg sm:text-xl font-bold">Briefs (PDF)</h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
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

          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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
