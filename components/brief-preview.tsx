"use client";

import { Download, Mail, Share2, FileText, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/logo";
import { useState } from "react";

interface BriefPreviewProps {
  property: {
    title: string;
    operationType: "venta" | "alquiler";
    propertyType: string;
    location: string;
    price: string;
    features: {
      bedrooms?: number;
      bathrooms?: number;
      parkingSpaces?: number;
      area?: number;
      builtArea?: number;
    };
    amenities: string[];
    description?: string;
  };
  content: {
    title: string;
    hook: string;
    body: string;
  };
  images: string[];
  agentInfo?: {
    name: string;
    phone: string;
    email: string;
    photo?: string;
    logo?: string;
  };
}

const themes = [
  {
    id: "modern",
    name: "Moderno",
    primary: "bg-amber-500",
    secondary: "bg-slate-900",
  },
  {
    id: "elegant",
    name: "Elegante",
    primary: "bg-slate-800",
    secondary: "bg-amber-400",
  },
  {
    id: "corporate",
    name: "Corporativo",
    primary: "bg-blue-600",
    secondary: "bg-gray-100",
  },
];

export function BriefPreview({
  property,
  content,
  images,
  agentInfo = {
    name: "Juan Diaz",
    phone: "+595 981 123 456",
    email: "juan@inmobiliaria.com",
  },
}: BriefPreviewProps) {
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const currentTheme = themes.find((t) => t.id === selectedTheme) || themes[0];

  const mainImage =
    images[0] ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800";
  const gridImages = images.slice(1, 5);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Brief PDF
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-lg mx-auto aspect-[8.5/11]">
              <div className={`${currentTheme.primary} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <Logo size="sm" />
                  <Badge className="bg-white/20 text-white border-0">
                    {property.operationType === "venta"
                      ? "EN VENTA"
                      : "EN ALQUILER"}
                  </Badge>
                </div>
              </div>

              <div className="relative h-40 overflow-hidden">
                <img
                  src={mainImage}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover scale-101"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-white font-bold text-lg">
                    {content.title}
                  </h2>
                  <p className="text-white/80 text-sm">{property.location}</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div
                  className={`${currentTheme.primary} text-white px-4 py-2 rounded-lg text-center`}
                >
                  <span className="text-2xl font-bold">{property.price}</span>
                  {property.operationType === "alquiler" && (
                    <span className="text-sm opacity-80">/mes</span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  {property.features.bedrooms && (
                    <div className="bg-gray-100 rounded p-2">
                      <p className="font-bold text-gray-900">
                        {property.features.bedrooms}
                      </p>
                      <p className="text-xs text-gray-600">Dorm.</p>
                    </div>
                  )}
                  {property.features.bathrooms && (
                    <div className="bg-gray-100 rounded p-2">
                      <p className="font-bold text-gray-900">
                        {property.features.bathrooms}
                      </p>
                      <p className="text-xs text-gray-600">Banos</p>
                    </div>
                  )}
                  {property.features.parkingSpaces && (
                    <div className="bg-gray-100 rounded p-2">
                      <p className="font-bold text-gray-900">
                        {property.features.parkingSpaces}
                      </p>
                      <p className="text-xs text-gray-600">Cochera</p>
                    </div>
                  )}
                  {property.features.builtArea && (
                    <div className="bg-gray-100 rounded p-2">
                      <p className="font-bold text-gray-900">
                        {property.features.builtArea}
                      </p>
                      <p className="text-xs text-gray-600">m² const.</p>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-xs leading-relaxed line-clamp-4">
                  {content.body}
                </p>

                {gridImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {gridImages.map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded">
                        <img
                          src={img}
                          alt={`Foto ${i + 2}`}
                          className="absolute inset-0 w-full h-full object-cover scale-101"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 6).map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="outline"
                      className="text-xs border-gray-300 text-gray-600"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={`${currentTheme.primary} p-3 mt-auto`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    {agentInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="text-white text-sm">
                    <p className="font-semibold">{agentInfo.name}</p>
                    <p className="opacity-80 text-xs">{agentInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-64 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Acciones</h4>
              <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Descargar PDF
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Enviar por Email
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="h-4 w-4" />
                Compartir Link
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-3">Opciones</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Incluir QR de contacto
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Mostrar precio
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Mostrar direccion exacta
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Incluir datos del agente
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
