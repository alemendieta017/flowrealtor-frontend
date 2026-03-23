"use client";

import { MoreHorizontal, Eye, Download, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const properties = [
  {
    id: "1",
    title: "Casa Moderna en Villa Morra",
    type: "Venta",
    price: "USD 285.000",
    status: "Activa",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
    generatedContent: ["PDF", "Post", "Story"],
  },
  {
    id: "2",
    title: "Departamento en Carmelitas",
    type: "Alquiler",
    price: "Gs. 8.500.000/mes",
    status: "Activa",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop",
    generatedContent: ["PDF", "Post"],
  },
  {
    id: "3",
    title: "Oficina Premium en WTC",
    type: "Alquiler",
    price: "USD 2.800/mes",
    status: "Pendiente",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
    generatedContent: [],
  },
  {
    id: "4",
    title: "Terreno en Luque",
    type: "Venta",
    price: "USD 95.000",
    status: "Activa",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop",
    generatedContent: ["PDF"],
  },
];

export function RecentProperties() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Propiedades Recientes</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {property.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      property.type === "Venta" ? "default" : "secondary"
                    }
                    className={
                      property.type === "Venta"
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    {property.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {property.price}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {property.generatedContent.map((content) => (
                    <Badge
                      key={content}
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {content}
                    </Badge>
                  ))}
                  {property.generatedContent.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      Sin contenido generado
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Brief
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
