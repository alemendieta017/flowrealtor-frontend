'use client';

import { Download, Mail, Share2, FileText, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/logo';
import { useState } from 'react';

interface BriefPreviewProps {
  property: {
    title: string;
    operationType: 'venta' | 'alquiler';
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
    id: 'modern',
    name: 'Moderno',
    primary: 'bg-amber-500',
    secondary: 'bg-slate-900',
  },
  {
    id: 'elegant',
    name: 'Elegante',
    primary: 'bg-slate-800',
    secondary: 'bg-amber-400',
  },
  {
    id: 'corporate',
    name: 'Corporativo',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-100',
  },
];

export function BriefPreview({
  property,
  content,
  images,
  agentInfo = {
    name: 'Juan Diaz',
    phone: '+595 981 123 456',
    email: 'juan@inmobiliaria.com',
  },
}: BriefPreviewProps) {
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const currentTheme = themes.find((t) => t.id === selectedTheme) || themes[0];

  const mainImage =
    images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';
  const gridImages = images.slice(1, 5);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            Brief PDF
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="bg-secondary border-border w-36">
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
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="mx-auto aspect-[8.5/11] max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
              <div className={`${currentTheme.primary} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <Logo size="sm" />
                  <Badge className="border-0 bg-white/20 text-white">
                    {property.operationType === 'venta' ? 'EN VENTA' : 'EN ALQUILER'}
                  </Badge>
                </div>
              </div>

              <div className="relative h-40 overflow-hidden">
                <img
                  src={mainImage}
                  alt={property.title}
                  className="absolute inset-0 h-full w-full scale-101 object-cover"
                />
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-lg font-bold text-white">{content.title}</h2>
                  <p className="text-sm text-white/80">{property.location}</p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div
                  className={`${currentTheme.primary} rounded-lg px-4 py-2 text-center text-white`}
                >
                  <span className="text-2xl font-bold">{property.price}</span>
                  {property.operationType === 'alquiler' && (
                    <span className="text-sm opacity-80">/mes</span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  {property.features.bedrooms && (
                    <div className="rounded bg-gray-100 p-2">
                      <p className="font-bold text-gray-900">{property.features.bedrooms}</p>
                      <p className="text-xs text-gray-600">Dorm.</p>
                    </div>
                  )}
                  {property.features.bathrooms && (
                    <div className="rounded bg-gray-100 p-2">
                      <p className="font-bold text-gray-900">{property.features.bathrooms}</p>
                      <p className="text-xs text-gray-600">Banos</p>
                    </div>
                  )}
                  {property.features.parkingSpaces && (
                    <div className="rounded bg-gray-100 p-2">
                      <p className="font-bold text-gray-900">{property.features.parkingSpaces}</p>
                      <p className="text-xs text-gray-600">Cochera</p>
                    </div>
                  )}
                  {property.features.builtArea && (
                    <div className="rounded bg-gray-100 p-2">
                      <p className="font-bold text-gray-900">{property.features.builtArea}</p>
                      <p className="text-xs text-gray-600">m² const.</p>
                    </div>
                  )}
                </div>

                <p className="line-clamp-4 text-xs leading-relaxed text-gray-700">{content.body}</p>

                {gridImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {gridImages.map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded">
                        <img
                          src={img}
                          alt={`Foto ${i + 2}`}
                          className="absolute inset-0 h-full w-full scale-101 object-cover"
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
                      className="border-gray-300 text-xs text-gray-600"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={`${currentTheme.primary} mt-auto p-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold text-white">
                    {agentInfo.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="text-sm text-white">
                    <p className="font-semibold">{agentInfo.name}</p>
                    <p className="text-xs opacity-80">{agentInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:w-64">
            <div className="space-y-2">
              <h4 className="text-foreground font-medium">Acciones</h4>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2">
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

            <div className="border-border border-t pt-4">
              <h4 className="text-foreground mb-3 font-medium">Opciones</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
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
