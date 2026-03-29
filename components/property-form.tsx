'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AMENITIES, NEIGHBORHOODS_PY } from '@/lib/types';

const propertyTypes = [
  { value: 'casa', label: 'Casa', icon: Home },
  { value: 'departamento', label: 'Departamento', icon: Building2 },
  { value: 'oficina', label: 'Oficina', icon: Briefcase },
  { value: 'terreno', label: 'Terreno', icon: LandPlot },
  { value: 'local', label: 'Local', icon: Store },
];

interface PropertyFormProps {
  onSubmit?: (data: PropertyFormData) => void;
  onGenerateContent?: (data: PropertyFormData) => void;
}

export interface PropertyFormData {
  operationType: 'venta' | 'alquiler';
  propertyType: string;
  title: string;
  neighborhood: string;
  city: string;
  address: string;
  priceAmount: string;
  currency: 'USD' | 'PYG';
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  area: string;
  builtArea: string;
  amenities: string[];
  description: string;
  images: File[];
}

export function PropertyForm({ onSubmit, onGenerateContent }: PropertyFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    operationType: 'venta',
    propertyType: 'casa',
    title: '',
    neighborhood: '',
    city: 'Asunción',
    address: '',
    priceAmount: '',
    currency: 'USD',
    bedrooms: '',
    bathrooms: '',
    parkingSpaces: '',
    area: '',
    builtArea: '',
    amenities: [],
    description: '',
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
    <Card className="bg-card border-border mx-auto max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-xl">Nueva Propiedad</CardTitle>
            <CardDescription>
              Completa los datos para generar contenido de marketing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-secondary text-muted-foreground'
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
              <Label className="text-foreground mb-3 block">Tipo de Operación</Label>
              <Tabs
                value={formData.operationType}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    operationType: v as 'venta' | 'alquiler',
                  })
                }
              >
                <TabsList className="bg-secondary grid w-full grid-cols-2">
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
              <Label className="text-foreground mb-3 block">Tipo de Propiedad</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, propertyType: type.value })}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      formData.propertyType === type.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="neighborhood" className="text-foreground">
                  Barrio
                </Label>
                <Select
                  value={formData.neighborhood}
                  onValueChange={(v) => setFormData({ ...formData, neighborhood: v })}
                >
                  <SelectTrigger className="bg-secondary border-border mt-1.5">
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
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                <div className="mt-1.5 flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(v) =>
                      setFormData({ ...formData, currency: v as 'USD' | 'PYG' })
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border w-24">
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
                    placeholder={formData.currency === 'USD' ? '285.000' : '450.000.000'}
                    value={formData.priceAmount}
                    onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                    className="bg-secondary border-border flex-1"
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
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                  onChange={(e) => setFormData({ ...formData, builtArea: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
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
                  onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                  className="bg-secondary border-border mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground mb-3 block">Amenidades</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border text-muted-foreground hover:border-primary/50'
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-secondary border-border mt-1.5 min-h-24"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-foreground mb-3 block">Fotos de la Propiedad</Label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {imagePreview.map((preview, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="absolute inset-0 h-full w-full scale-101 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-destructive absolute top-2 right-2 rounded-full p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="bg-primary text-primary-foreground absolute bottom-2 left-2 text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                ))}
                <label className="border-border hover:border-primary/50 bg-secondary/30 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors">
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <span className="text-muted-foreground px-2 text-center text-xs">
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
              <p className="text-muted-foreground mt-2 text-xs">
                Sube al menos 3 fotos para mejores resultados. La primera será la imagen principal.
              </p>
            </div>

            <div className="from-primary/10 to-accent/10 border-primary/20 rounded-lg border bg-gradient-to-br p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 rounded-lg p-3">
                  <Sparkles className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-foreground mb-1 font-semibold">
                    Listo para generar contenido
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Con los datos ingresados, la IA generará automáticamente:
                  </p>
                  <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
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

        <div className="border-border mt-8 flex items-center justify-between border-t pt-6">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
