import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AMENITIES, NEIGHBORHOODS_PY } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Home, ChevronRight, GripVertical, Check } from 'lucide-react';
import type { PropertyFormData } from '@/lib/schemas/property.schema';

export function Step1({
  form,
  update,
}: {
  form: PropertyFormData;
  update: (k: keyof PropertyFormData, v: any) => void;
}) {
  const [activeAccordion, setActiveAccordion] = useState<string>('datos');
  const toggleAmenity = (a: string) => {
    update(
      'amenities',
      form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a],
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl space-y-6 duration-500">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Detalles del Inmueble</h2>
        <p className="text-muted-foreground text-sm">
          Ingresa la información básica para generar el contenido.
        </p>
      </div>

      <Accordion
        type="single"
        value={activeAccordion}
        onValueChange={setActiveAccordion}
        collapsible
        className="w-full space-y-4 border-none"
      >
        <AccordionItem value="datos" className="bg-card overflow-hidden rounded-xl border px-4">
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                <Home className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">Datos Básicos</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Tipo, ubicación y operación
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 pb-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Operación
                </Label>
                <Select
                  value={form.operationType}
                  onValueChange={(v) => update('operationType', v)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="alquiler">Alquiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Tipo de Inmueble
                </Label>
                <Select value={form.propertyType} onValueChange={(v) => update('propertyType', v)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="departamento">Depto</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Barrio / Zona
                </Label>
                <Select value={form.neighborhood} onValueChange={(v) => update('neighborhood', v)}>
                  <SelectTrigger className="bg-background">
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
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Ciudad
                </Label>
                <Input
                  className="bg-background"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Dirección (Opcional)
                </Label>
                <Input
                  className="bg-background"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="Calle y número aprox."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveAccordion('caracteristicas')}
                variant="secondary"
                className="gap-2"
              >
                Siguiente Sección <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="caracteristicas" className="bg-card rounded-xl border px-4">
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">Características</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Precio, dimensiones y ambientes
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 pb-6">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <div className="col-span-2 space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Precio
                </Label>
                <div className="flex gap-2">
                  <Select value={form.currency} onValueChange={(v) => update('currency', v)}>
                    <SelectTrigger className="bg-background w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="PYG">PYG</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="bg-background"
                    value={form.priceAmount}
                    onChange={(e) => update('priceAmount', e.target.value)}
                    placeholder="Ej: 150000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Habitaciones
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  value={form.bedrooms}
                  onChange={(e) => update('bedrooms', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Baños
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  value={form.bathrooms}
                  onChange={(e) => update('bathrooms', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Cocheras
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  value={form.parkingSpaces}
                  onChange={(e) => update('parkingSpaces', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  m² Total
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  value={form.totalArea}
                  onChange={(e) => update('totalArea', e.target.value)}
                />
              </div>
              <div className="col-span-full mt-2 space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Descripción Adicional
                </Label>
                <Textarea
                  className="bg-background"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  placeholder="Menciona detalles que lo hagan único..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveAccordion('amenidades')}
                variant="secondary"
                className="gap-2"
              >
                Siguiente Sección <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenidades" className="bg-card rounded-xl border px-4">
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                <Check className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">Amenidades</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Piscina, seguridad, extras
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2 pb-6">
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all',
                    form.amenities.includes(a)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
