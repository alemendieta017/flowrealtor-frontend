"use client";

import { useState } from "react";
import {
  Upload,
  X,
  Plus,
  Home,
  Building2,
  Briefcase,
  LandPlot,
  Store,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AMENITIES, NEIGHBORHOODS_PY } from "@/lib/types";

const propertyTypes = [
  { value: "casa", label: "Casa", icon: Home },
  { value: "departamento", label: "Departamento", icon: Building2 },
  { value: "oficina", label: "Oficina", icon: Briefcase },
  { value: "terreno", label: "Terreno", icon: LandPlot },
  { value: "local", label: "Local", icon: Store },
];

interface PropertyFormProps {
  onSubmit?: (data: PropertyFormData) => void;
  onGenerateContent?: (data: PropertyFormData) => void;
}

export interface PropertyFormData {
  operationType: "venta" | "alquiler";
  propertyType: string;
  title: string;
  neighborhood: string;
  city: string;
  address: string;
  priceAmount: string;
  currency: "USD" | "PYG";
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  area: string;
  builtArea: string;
  amenities: string[];
  description: string;
  images: File[];
}

export function PropertyForm({
  onSubmit,
  onGenerateContent,
}: PropertyFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    operationType: "venta",
    propertyType: "casa",
    title: "",
    neighborhood: "",
    city: "Asunción",
    address: "",
    priceAmount: "",
    currency: "USD",
    bedrooms: "",
    bathrooms: "",
    parkingSpaces: "",
    area: "",
    builtArea: "",
    amenities: [],
    description: "",
    images: [],
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      setFormData({ ...formData, images: newImages });

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  const handleGenerateContent = () => {
    onGenerateContent?.(formData);
  };

  const totalSteps = 3;

  return (
    <Card className="bg-card border-border max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">
              Nueva Propiedad
            </CardTitle>
            <CardDescription>
              Completa los datos para generar contenido de marketing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                      ? "bg-green-500 text-white"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-foreground mb-3 block">
                Tipo de Operación
              </Label>
              <Tabs
                value={formData.operationType}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    operationType: v as "venta" | "alquiler",
                  })
                }
              >
                <TabsList className="grid w-full grid-cols-2 bg-secondary">
                  <TabsTrigger
                    value="venta"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Venta
                  </TabsTrigger>
                  <TabsTrigger
                    value="alquiler"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Alquiler
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <Label className="text-foreground mb-3 block">
                Tipo de Propiedad
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, propertyType: type.value })
                    }
                    className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                      formData.propertyType === type.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <type.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title" className="text-foreground">
                  Título de la Propiedad
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Casa moderna con piscina en Villa Morra"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>

              <div>
                <Label htmlFor="neighborhood" className="text-foreground">
                  Barrio
                </Label>
                <Select
                  value={formData.neighborhood}
                  onValueChange={(v) =>
                    setFormData({ ...formData, neighborhood: v })
                  }
                >
                  <SelectTrigger className="mt-1.5 bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar barrio" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEIGHBORHOODS_PY.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city" className="text-foreground">
                  Ciudad
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-foreground">
                  Dirección (opcional)
                </Label>
                <Input
                  id="address"
                  placeholder="Calle y número"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price" className="text-foreground">
                  Precio
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Select
                    value={formData.currency}
                    onValueChange={(v) =>
                      setFormData({ ...formData, currency: v as "USD" | "PYG" })
                    }
                  >
                    <SelectTrigger className="w-24 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="PYG">Gs.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="price"
                    type="text"
                    placeholder={
                      formData.currency === "USD" ? "285.000" : "450.000.000"
                    }
                    value={formData.priceAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, priceAmount: e.target.value })
                    }
                    className="flex-1 bg-secondary border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="area" className="text-foreground">
                  Superficie Total (m²)
                </Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="500"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>

              <div>
                <Label htmlFor="builtArea" className="text-foreground">
                  Superficie Construida (m²)
                </Label>
                <Input
                  id="builtArea"
                  type="number"
                  placeholder="350"
                  value={formData.builtArea}
                  onChange={(e) =>
                    setFormData({ ...formData, builtArea: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms" className="text-foreground">
                  Dormitorios
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrooms: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms" className="text-foreground">
                  Baños
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="2"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bathrooms: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="parking" className="text-foreground">
                  Estacionamientos
                </Label>
                <Input
                  id="parking"
                  type="number"
                  placeholder="2"
                  value={formData.parkingSpaces}
                  onChange={(e) =>
                    setFormData({ ...formData, parkingSpaces: e.target.value })
                  }
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground mb-3 block">Amenidades</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={
                      formData.amenities.includes(amenity)
                        ? "default"
                        : "outline"
                    }
                    className={`cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">
                Descripción adicional (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales sobre la propiedad que quieras incluir..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1.5 bg-secondary border-border min-h-24"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-foreground mb-3 block">
                Fotos de la Propiedad
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover scale-101"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-secondary/30">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Subir fotos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sube al menos 3 fotos para mejores resultados. La primera será
                la imagen principal.
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Listo para generar contenido
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Con los datos ingresados, la IA generará automáticamente:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Título atractivo y descripción persuasiva
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Caption optimizado con hashtags
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Guion para video con voz en off
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Brief PDF profesional
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSubmit}>
                Guardar como borrador
              </Button>
              <Button
                onClick={handleGenerateContent}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" />
                Generar Contenido
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
