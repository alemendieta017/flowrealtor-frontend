'use client';

import { useState } from 'react';
import { Download, Instagram, Facebook, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/logo';

interface SocialMediaPreviewProps {
  images: string[];
  title: string;
  price: string;
  location: string;
  operationType: 'venta' | 'alquiler';
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
}

const templates = [
  { id: 'modern', name: 'Moderno', accent: 'from-amber-400 to-orange-500' },
  { id: 'elegant', name: 'Elegante', accent: 'from-slate-700 to-slate-900' },
  { id: 'vibrant', name: 'Vibrante', accent: 'from-rose-400 to-purple-500' },
  { id: 'minimal', name: 'Minimalista', accent: 'from-gray-100 to-gray-200' },
];

export function SocialMediaPreview({
  images,
  title,
  price,
  location,
  operationType,
  features,
}: SocialMediaPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [format, setFormat] = useState<'post' | 'story'>('post');

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];
  const mainImage =
    images[0] ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=800&fit=crop';

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Previsualizacion de Posts</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="bg-secondary border-border w-36">
                <SelectValue placeholder="Plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={format} onValueChange={(v) => setFormat(v as 'post' | 'story')}>
          <TabsList className="bg-secondary mb-6 grid w-full grid-cols-2">
            <TabsTrigger
              value="post"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Monitor className="h-4 w-4" />
              Post (1:1)
            </TabsTrigger>
            <TabsTrigger
              value="story"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Story (9:16)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <PostPreview
                  image={mainImage}
                  title={title}
                  price={price}
                  location={location}
                  operationType={operationType}
                  features={features}
                  template={currentTemplate}
                />
              </div>
              <div className="space-y-4 lg:w-64">
                <h4 className="text-foreground font-medium">Imagenes disponibles</h4>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
                  {images.slice(0, 6).map((img, index) => (
                    <div
                      key={index}
                      className="hover:border-primary relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-colors"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="absolute inset-0 h-full w-full scale-101 object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2">
                    <Download className="h-4 w-4" />
                    Descargar Post
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Instagram className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="story">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex flex-1 justify-center">
                <StoryPreview
                  image={mainImage}
                  title={title}
                  price={price}
                  location={location}
                  operationType={operationType}
                  features={features}
                  template={currentTemplate}
                />
              </div>
              <div className="space-y-4 lg:w-64">
                <h4 className="text-foreground font-medium">Imagenes disponibles</h4>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
                  {images.slice(0, 6).map((img, index) => (
                    <div
                      key={index}
                      className="hover:border-primary relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-colors"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="absolute inset-0 h-full w-full scale-101 object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2">
                    <Download className="h-4 w-4" />
                    Descargar Story
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Instagram className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface PreviewProps {
  image: string;
  title: string;
  price: string;
  location: string;
  operationType: 'venta' | 'alquiler';
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  template: (typeof templates)[0];
}

function PostPreview({
  image,
  title,
  price,
  location,
  operationType,
  features,
  template,
}: PreviewProps) {
  const isLight = template.id === 'minimal';

  return (
    <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg shadow-2xl">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full scale-101 object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <div
        className={`absolute top-4 left-4 rounded-full bg-linear-to-r px-3 py-1.5 ${template.accent} ${isLight ? 'text-gray-900' : 'text-white'} text-sm font-bold tracking-wider uppercase`}
      >
        {operationType === 'venta' ? 'En Venta' : 'En Alquiler'}
      </div>

      <div className="absolute right-0 bottom-0 left-0 p-6">
        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-white">{title}</h3>
        <p className="mb-3 text-sm text-white/80">{location}</p>

        {features && (
          <div className="mb-4 flex gap-4 text-sm text-white/90">
            {features.bedrooms && <span>{features.bedrooms} Dorm.</span>}
            {features.bathrooms && <span>{features.bathrooms} Banos</span>}
            {features.area && <span>{features.area}m²</span>}
          </div>
        )}

        <div
          className={`inline-block rounded-lg bg-linear-to-r px-4 py-2 ${template.accent} ${isLight ? 'text-gray-900' : 'text-white'} text-lg font-bold`}
        >
          {price}
        </div>
      </div>

      <div className="absolute right-4 bottom-4">
        <Logo size="sm" className="opacity-80" />
      </div>
    </div>
  );
}

function StoryPreview({
  image,
  title,
  price,
  location,
  operationType,
  features,
  template,
}: PreviewProps) {
  const isLight = template.id === 'minimal';

  return (
    <div className="relative aspect-[9/16] w-64 overflow-hidden rounded-2xl shadow-2xl">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full scale-101 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r px-4 py-2 ${template.accent} ${isLight ? 'text-gray-900' : 'text-white'} text-sm font-bold tracking-wider uppercase`}
      >
        {operationType === 'venta' ? 'En Venta' : 'En Alquiler'}
      </div>

      <div className="absolute right-0 bottom-0 left-0 p-6 text-center">
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-4 text-sm text-white/80">{location}</p>

        {features && (
          <div className="mb-4 flex justify-center gap-3 text-xs text-white/90">
            {features.bedrooms && (
              <span className="rounded bg-white/20 px-2 py-1">{features.bedrooms} Dorm.</span>
            )}
            {features.bathrooms && (
              <span className="rounded bg-white/20 px-2 py-1">{features.bathrooms} Banos</span>
            )}
            {features.area && (
              <span className="rounded bg-white/20 px-2 py-1">{features.area}m²</span>
            )}
          </div>
        )}

        <div
          className={`inline-block rounded-xl bg-linear-to-r px-6 py-3 ${template.accent} ${isLight ? 'text-gray-900' : 'text-white'} text-xl font-bold`}
        >
          {price}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-white/60">Desliza para mas</span>
          <svg
            className="h-4 w-4 animate-bounce text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      </div>

      <div className="absolute top-6 right-4">
        <Logo size="sm" className="opacity-80" />
      </div>
    </div>
  );
}
