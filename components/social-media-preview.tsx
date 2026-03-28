"use client";

import { useState } from "react";
import {
  Download,
  Instagram,
  Facebook,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/logo";

interface SocialMediaPreviewProps {
  images: string[];
  title: string;
  price: string;
  location: string;
  operationType: "venta" | "alquiler";
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
}

const templates = [
  { id: "modern", name: "Moderno", accent: "from-amber-400 to-orange-500" },
  { id: "elegant", name: "Elegante", accent: "from-slate-700 to-slate-900" },
  { id: "vibrant", name: "Vibrante", accent: "from-rose-400 to-purple-500" },
  { id: "minimal", name: "Minimalista", accent: "from-gray-100 to-gray-200" },
];

export function SocialMediaPreview({
  images,
  title,
  price,
  location,
  operationType,
  features,
}: SocialMediaPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [format, setFormat] = useState<"post" | "story">("post");

  const currentTemplate =
    templates.find((t) => t.id === selectedTemplate) || templates[0];
  const mainImage =
    images[0] ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=800&fit=crop";

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">
            Previsualizacion de Posts
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-36 bg-secondary border-border">
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
        <Tabs
          value={format}
          onValueChange={(v) => setFormat(v as "post" | "story")}
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary mb-6">
            <TabsTrigger
              value="post"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Monitor className="h-4 w-4" />
              Post (1:1)
            </TabsTrigger>
            <TabsTrigger
              value="story"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Smartphone className="h-4 w-4" />
              Story (9:16)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post">
            <div className="flex flex-col lg:flex-row gap-6">
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
              <div className="lg:w-64 space-y-4">
                <h4 className="font-medium text-foreground">
                  Imagenes disponibles
                </h4>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                  {images.slice(0, 6).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover scale-101"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 flex justify-center">
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
              <div className="lg:w-64 space-y-4">
                <h4 className="font-medium text-foreground">
                  Imagenes disponibles
                </h4>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                  {images.slice(0, 6).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover scale-101"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
  operationType: "venta" | "alquiler";
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
  const isLight = template.id === "minimal";

  return (
    <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden shadow-2xl">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-101"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <div
        className={`absolute top-4 left-4 px-3 py-1.5 rounded-full bg-linear-to-r ${template.accent} ${isLight ? "text-gray-900" : "text-white"} text-sm font-bold uppercase tracking-wider`}
      >
        {operationType === "venta" ? "En Venta" : "En Alquiler"}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-white/80 text-sm mb-3">{location}</p>

        {features && (
          <div className="flex gap-4 mb-4 text-white/90 text-sm">
            {features.bedrooms && <span>{features.bedrooms} Dorm.</span>}
            {features.bathrooms && <span>{features.bathrooms} Banos</span>}
            {features.area && <span>{features.area}m²</span>}
          </div>
        )}

        <div
          className={`inline-block px-4 py-2 rounded-lg bg-linear-to-r ${template.accent} ${isLight ? "text-gray-900" : "text-white"} font-bold text-lg`}
        >
          {price}
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
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
  const isLight = template.id === "minimal";

  return (
    <div className="relative w-64 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-101"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r ${template.accent} ${isLight ? "text-gray-900" : "text-white"} text-sm font-bold uppercase tracking-wider`}
      >
        {operationType === "venta" ? "En Venta" : "En Alquiler"}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{location}</p>

        {features && (
          <div className="flex justify-center gap-3 mb-4 text-white/90 text-xs">
            {features.bedrooms && (
              <span className="bg-white/20 px-2 py-1 rounded">
                {features.bedrooms} Dorm.
              </span>
            )}
            {features.bathrooms && (
              <span className="bg-white/20 px-2 py-1 rounded">
                {features.bathrooms} Banos
              </span>
            )}
            {features.area && (
              <span className="bg-white/20 px-2 py-1 rounded">
                {features.area}m²
              </span>
            )}
          </div>
        )}

        <div
          className={`inline-block px-6 py-3 rounded-xl bg-linear-to-r ${template.accent} ${isLight ? "text-gray-900" : "text-white"} font-bold text-xl`}
        >
          {price}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-white/60 text-xs">Desliza para mas</span>
          <svg
            className="w-4 h-4 text-white/60 animate-bounce"
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
