"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { propertiesApi, contentApi, listingsApi, agentsApi } from "@/lib/api";
import {
  AMENITIES,
  NEIGHBORHOODS_PY,
  type PropertyContent,
  type Property,
  type Agent,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Home,
  MapPin,
  Video,
  FileText,
  Image,
  User,
  Zap,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Upload,
  Edit3,
  X,
} from "lucide-react";

const AGENT_ID = "7bc227f4-4251-4ced-873c-29df8bd7229b"; // TODO: replace with auth context

const STEPS = [
  { id: 1, label: "Datos Básicos", icon: Home },
  { id: 2, label: "Características", icon: MapPin },
  { id: 3, label: "Amenidades", icon: Check },
  { id: 4, label: "Config. Video", icon: Video },
  { id: 5, label: "Guion IA", icon: FileText },
  { id: 6, label: "Imágenes", icon: Image },
  { id: 7, label: "Agente", icon: User },
];

interface FormData {
  // Step 1
  operationType: string;
  propertyType: string;
  country: string;
  city: string;
  neighborhood: string;
  address: string;
  // Step 2
  priceAmount: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  totalArea: string;
  builtArea: string;
  unbuiltArea: string;
  levels: string;
  // Step 3
  amenities: string[];
  description: string;
  // Step 4
  videoFormat: string;
  voiceoverEnabled: boolean;
  voiceGender: string;
  videoStyle: string;
  additionalContext: string;
  // Step 5 (populated from API)
  editedScenes: { text: string; suggestedDuration: number }[];
  sceneImages: (File | null)[];
  // Step 6
  generalImages: File[];
  // Step 7
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentCompany: string;
}

const initialForm: FormData = {
  operationType: "venta",
  propertyType: "casa",
  country: "Paraguay",
  city: "Asuncion",
  neighborhood: "",
  address: "",
  priceAmount: "",
  currency: "USD",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  totalArea: "",
  builtArea: "",
  unbuiltArea: "",
  levels: "",
  amenities: [],
  description: "",
  videoFormat: "quick",
  voiceoverEnabled: true,
  voiceGender: "female",
  videoStyle: "professional",
  additionalContext: "",
  editedScenes: [],
  sceneImages: [],
  generalImages: [],
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  agentCompany: "",
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [content, setContent] = useState<PropertyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  // Step 3 -> 4: Create property in backend
  const handleCreateProperty = async () => {
    if (propertyId) return; // already created
    setLoading(true);
    setError(null);
    try {
      const property = await propertiesApi.create({
        agentId: AGENT_ID,
        operationType: form.operationType as Property["operationType"],
        propertyType: form.propertyType as Property["propertyType"],
        country: form.country,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        priceAmount: Number(form.priceAmount),
        currency: form.currency as "USD" | "PYG",
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        parkingSpaces: form.parkingSpaces
          ? Number(form.parkingSpaces)
          : undefined,
        totalArea: form.totalArea ? Number(form.totalArea) : undefined,
        builtArea: form.builtArea ? Number(form.builtArea) : undefined,
        unbuiltArea: form.unbuiltArea ? Number(form.unbuiltArea) : undefined,
        levels: form.levels ? Number(form.levels) : undefined,
        amenities: form.amenities,
        description: form.description,
      });
      setPropertyId(property.id);
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> 5: Generate content with LLM
  const handleGenerateContent = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const generated = await contentApi.generate({
        propertyId: pid,
        videoFormat: form.videoFormat,
        videoStyle: form.videoStyle,
        voiceGender: form.voiceGender,
        additionalContext: form.additionalContext || undefined,
      });
      setContent(generated);
      setForm((f) => ({
        ...f,
        editedScenes: generated.videoScript.scenes.map((s) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
        })),
        sceneImages: new Array(generated.videoScript.scenes.length).fill(null),
      }));
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Save edited script to backend
  const handleSaveScript = async () => {
    if (!propertyId || !content) return;
    await contentApi.update(propertyId, {
      videoScript: {
        scenes: form.editedScenes.map((s) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
        })),
      },
    });
  };

  // Upload scene images
  const handleUploadSceneImages = async (pid: string) => {
    const files = form.sceneImages.filter((f): f is File => f !== null);
    if (files.length > 0) {
      await propertiesApi.uploadImages(pid, files);
    }
  };

  // Upload general images
  const handleUploadGeneralImages = async (pid: string) => {
    if (form.generalImages.length > 0) {
      await propertiesApi.uploadImages(pid, form.generalImages);
    }
  };

  // Final submit
  const handleGenerate = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      // Upload all remaining images
      await handleUploadGeneralImages(propertyId);

      // Save script if edited
      await handleSaveScript();

      // Get all uploaded images to build sceneOrder
      const images = await propertiesApi.getImages(propertyId);
      const sceneOrder = form.editedScenes.map((scene, idx) => ({
        imageId: images[idx]?.id ?? "",
        sceneText: scene.text,
        duration: scene.suggestedDuration,
      }));

      // Kick off listing generation
      await listingsApi.generate({
        propertyId,
        videoConfig: {
          format: form.videoFormat,
          voiceoverEnabled: form.voiceoverEnabled,
          voiceGender: form.voiceGender,
          style: form.videoStyle,
          sceneOrder,
        },
      });

      // Navigate to results page
      router.push(`/properties/${propertyId}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const goNext = async () => {
    try {
      if (step === 3) {
        await handleCreateProperty();
      }
      if (step === 4 && propertyId) {
        await handleGenerateContent(propertyId);
      }
      if (step === 5 && propertyId) {
        await handleSaveScript();
        await handleUploadSceneImages(propertyId);
      }
      setStep((s) => Math.min(s + 1, STEPS.length));
      setError(null);
    } catch {
      // error already set
    }
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Nueva Propiedad</h1>
            <p className="text-sm text-muted-foreground">
              Paso {step} de {STEPS.length}: {STEPS[step - 1].label}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b bg-card px-6 pb-4">
        <div className="mx-auto max-w-4xl">
          <Progress value={progressPct} className="h-1.5 mb-3" />
          <div className="flex gap-1 overflow-x-auto">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  disabled
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    step === s.id
                      ? "bg-primary text-primary-foreground"
                      : step > s.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {step === 1 && <Step1 form={form} update={update} />}
        {step === 2 && <Step2 form={form} update={update} />}
        {step === 3 && (
          <Step3 form={form} toggleAmenity={toggleAmenity} update={update} />
        )}
        {step === 4 && <Step4 form={form} update={update} />}
        {step === 5 && (
          <Step5
            form={form}
            content={content}
            loading={loading}
            onUpdateScene={(idx, text) => {
              const scenes = [...form.editedScenes];
              scenes[idx] = { ...scenes[idx], text };
              update("editedScenes", scenes);
            }}
            onSceneImage={(idx, file) => {
              const imgs = [...form.sceneImages];
              imgs[idx] = file;
              update("sceneImages", imgs);
            }}
          />
        )}
        {step === 6 && (
          <Step6
            files={form.generalImages}
            onChange={(files) => update("generalImages", files)}
          />
        )}
        {step === 7 && <Step7 form={form} update={update} />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>

          {step < STEPS.length ? (
            <Button onClick={goNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {step === 4 ? "Generando con IA..." : "Procesando..."}
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando Listado...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generar Listado Profesional
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- STEP COMPONENTS ----

function Step1({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Datos Básicos</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de operación</Label>
          <Select
            value={form.operationType}
            onValueChange={(v) => update("operationType", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venta">Venta</SelectItem>
              <SelectItem value="alquiler">Alquiler</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de propiedad</Label>
          <Select
            value={form.propertyType}
            onValueChange={(v) => update("propertyType", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="departamento">Departamento</SelectItem>
              <SelectItem value="oficina">Oficina</SelectItem>
              <SelectItem value="terreno">Terreno</SelectItem>
              <SelectItem value="local">Local Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>País</Label>
          <Input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Asuncion"
          />
        </div>
        <div className="space-y-2">
          <Label>Barrio / Zona</Label>
          <Select
            value={form.neighborhood}
            onValueChange={(v) => update("neighborhood", v)}
          >
            <SelectTrigger>
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
          <Label>Dirección (opcional)</Label>
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Calle y número"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Características</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Precio</Label>
          <Input
            type="number"
            value={form.priceAmount}
            onChange={(e) => update("priceAmount", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select
            value={form.currency}
            onValueChange={(v) => update("currency", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="PYG">PYG (Gs.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {[
          { key: "bedrooms", label: "Dormitorios" },
          { key: "bathrooms", label: "Baños" },
          { key: "parkingSpaces", label: "Cocheras" },
          { key: "totalArea", label: "m² Terreno" },
          { key: "builtArea", label: "m² Construidos" },
          { key: "unbuiltArea", label: "m² Sin Edificar" },
          { key: "levels", label: "Niveles / Plantas" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input
              type="number"
              value={(form as unknown as Record<string, string>)[key]}
              onChange={(e) => update(key as keyof FormData, e.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Descripción adicional (opcional)</Label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Agrega cualquier detalle especial que quieras incluir..."
          rows={3}
        />
      </div>
    </div>
  );
}

function Step3({
  form,
  toggleAmenity,
  update,
}: {
  form: FormData;
  toggleAmenity: (a: string) => void;
  update: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Amenidades</h2>
      <p className="text-muted-foreground">
        Seleccioná todas las comodidades que tiene la propiedad
      </p>
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => toggleAmenity(a)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              form.amenities.includes(a)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary",
            )}
          >
            {form.amenities.includes(a) && (
              <Check className="inline h-3 w-3 mr-1" />
            )}
            {a}
          </button>
        ))}
      </div>
      {form.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground mr-2">
            Seleccionadas:
          </span>
          {form.amenities.map((a) => (
            <Badge key={a} variant="secondary">
              {a}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function Step4({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración del Video</h2>
      <div className="grid grid-cols-2 gap-6">
        <Card
          onClick={() => update("videoFormat", "quick")}
          className={cn(
            "cursor-pointer transition-all",
            form.videoFormat === "quick" ? "ring-2 ring-primary" : "",
          )}
        >
          <CardContent className="p-4">
            <div className="font-semibold">⚡ Reel Rápido</div>
            <div className="text-sm text-muted-foreground mt-1">
              15-30 segundos, dinámico, ideal para Instagram
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => update("videoFormat", "narrated")}
          className={cn(
            "cursor-pointer transition-all",
            form.videoFormat === "narrated" ? "ring-2 ring-primary" : "",
          )}
        >
          <CardContent className="p-4">
            <div className="font-semibold">🎙️ Tour Narrado</div>
            <div className="text-sm text-muted-foreground mt-1">
              60-90 segundos, detallado, con voz en off completa
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estilo del video</Label>
          <Select
            value={form.videoStyle}
            onValueChange={(v) => update("videoStyle", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Profesional</SelectItem>
              <SelectItem value="luxury">Lujo Premium</SelectItem>
              <SelectItem value="energetic">Energético / Moderno</SelectItem>
              <SelectItem value="elegant">Elegante</SelectItem>
              <SelectItem value="modern">Contemporáneo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Voz en off</Label>
          <Select
            value={form.voiceGender}
            onValueChange={(v) => update("voiceGender", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Femenina (Nova)</SelectItem>
              <SelectItem value="male">Masculina (Onyx)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id="voiceover"
          checked={form.voiceoverEnabled}
          onCheckedChange={(v) => update("voiceoverEnabled", v)}
        />
        <Label htmlFor="voiceover">Activar voz en off con IA</Label>
      </div>
      <div className="space-y-2">
        <Label>Contexto adicional para la IA (opcional)</Label>
        <Textarea
          value={form.additionalContext}
          onChange={(e) => update("additionalContext", e.target.value)}
          placeholder="Ej: Resaltar que es ideal para inversión, que el barrio tiene excelente conectividad..."
          rows={2}
        />
      </div>
    </div>
  );
}

function Step5({
  form,
  content,
  loading,
  onUpdateScene,
  onSceneImage,
}: {
  form: FormData;
  content: PropertyContent | null;
  loading: boolean;
  onUpdateScene: (idx: number, text: string) => void;
  onSceneImage: (idx: number, file: File) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">
          La IA está generando el guion y contenido...
        </p>
        <p className="text-sm text-muted-foreground">
          Esto puede tomar unos segundos
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No se pudo generar el contenido. Por favor volvé al paso anterior.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Guion Generado por IA</h2>
        <p className="text-muted-foreground mt-1">
          Podés editar el texto de cada escena y asignar la foto que querés para
          ese momento del video.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="bg-primary/5">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Título
            </div>
            <div className="font-semibold text-sm mt-1">{content.title}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Hook
            </div>
            <div className="font-semibold text-sm mt-1">{content.hook}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Escenas
            </div>
            <div className="font-semibold text-sm mt-1">
              {content.videoScript.scenes.length} escenas
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {form.editedScenes.map((scene, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={scene.text}
                  onChange={(e) => onUpdateScene(idx, e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                  placeholder="Texto narrado para esta escena..."
                />
                <div className="text-xs text-muted-foreground">
                  Duración sugerida: {scene.suggestedDuration}s
                </div>
              </div>
              <div className="flex-shrink-0">
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    form.sceneImages[idx]
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary",
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onSceneImage(idx, f);
                    }}
                  />
                  {form.sceneImages[idx] ? (
                    <img
                      src={URL.createObjectURL(form.sceneImages[idx]!)}
                      alt="Scene"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1 text-center">
                        Foto
                      </span>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Step6({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      onChange([...files, ...dropped]);
    },
    [files, onChange],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Imágenes Adicionales</h2>
      <p className="text-muted-foreground">
        Subí fotos adicionales de la propiedad para el brief PDF y las
        publicaciones en redes.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
      >
        <label className="cursor-pointer block">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files ?? []);
              onChange([...files, ...newFiles]);
            }}
          />
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium">Arrastrá o hacé clic para subir fotos</p>
          <p className="text-sm text-muted-foreground mt-1">
            JPG, PNG, WEBP — máx. 20 fotos
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {files.map((file, idx) => (
            <div key={idx} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChange(files.filter((_, i) => i !== idx))}
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step7({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Datos del Agente</h2>
      <p className="text-muted-foreground">
        Estos datos aparecerán en el PDF y las publicaciones. Podés modificarlos
        para esta propiedad.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input
            value={form.agentName}
            onChange={(e) => update("agentName", e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div className="space-y-2">
          <Label>Inmobiliaria</Label>
          <Input
            value={form.agentCompany}
            onChange={(e) => update("agentCompany", e.target.value)}
            placeholder="Nombre de tu inmobiliaria"
          />
        </div>
        <div className="space-y-2">
          <Label>Teléfono / WhatsApp</Label>
          <Input
            value={form.agentPhone}
            onChange={(e) => update("agentPhone", e.target.value)}
            placeholder="+595 9xx xxx xxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.agentEmail}
            onChange={(e) => update("agentEmail", e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">
              Listo para generar
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Al presionar &quot;Generar Listado Profesional&quot;, la IA
            producirá automáticamente:
          </p>
          <ul className="mt-2 text-sm space-y-1">
            <li>📄 Ficha técnica profesional en PDF</li>
            <li>📱 Carousel y Story para Instagram</li>
            <li>🎬 Video reel con voz en off</li>
            <li>📧 Email de presentación</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
