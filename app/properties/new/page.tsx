'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { propertiesApi, contentApi, listingsApi, templatesApi } from '@/lib/api'
import {
  AMENITIES,
  NEIGHBORHOODS_PY,
  formatPrice,
  type PropertyContent,
  type Property,
  type Template,
  type PropertyImage,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Home,
  Image as ImageIcon,
  Video,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Upload,
  X,
  GripVertical,
  MousePointer2,
  Info,
} from 'lucide-react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import Handlebars from 'handlebars'
import { Checkbox } from '@/components/ui/checkbox'

const AGENT_ID = '7bc227f4-4251-4ced-873c-29df8bd7229b' // TODO: replace with auth context

const STEPS = [
  { id: 1, label: 'Detalles', icon: Home },
  { id: 2, label: 'Galería', icon: ImageIcon },
  { id: 3, label: 'IA y Guion', icon: Video },
  { id: 4, label: 'Estudio Creativo', icon: Sparkles },
]

interface FormData {
  // Step 1
  operationType: string
  propertyType: string
  country: string
  city: string
  neighborhood: string
  address: string
  priceAmount: string
  currency: string
  bedrooms: string
  bathrooms: string
  parkingSpaces: string
  totalArea: string
  builtArea: string
  unbuiltArea: string
  levels: string
  amenities: string[]
  description: string
  // Step 2
  uploadedImages: PropertyImage[]
  // Step 3
  videoFormat: string
  voiceoverEnabled: boolean
  voiceGender: string
  editedScenes: {
    text: string
    suggestedDuration: number
    imageId: string | null
  }[]
  // Step 4
  selectedPdfTemplateId: string
  selectedSocialTemplateId: string
  selectedVideoTemplateId: string
  agentName: string
  agentPhone: string
  agentEmail: string
  agentCompany: string
  primaryColor: string
  secondaryColor: string
  // AI Editable Text
  title: string
  hook: string
  body: string
  caption: string
}

const initialForm: FormData = {
  operationType: 'venta',
  propertyType: 'casa',
  country: 'Paraguay',
  city: 'Asuncion',
  neighborhood: '',
  address: '',
  priceAmount: '',
  currency: 'USD',
  bedrooms: '',
  bathrooms: '',
  parkingSpaces: '',
  totalArea: '',
  builtArea: '',
  unbuiltArea: '',
  levels: '',
  amenities: [],
  description: '',
  uploadedImages: [],
  videoFormat: 'quick',
  voiceoverEnabled: true,
  voiceGender: 'female',
  editedScenes: [],
  selectedPdfTemplateId: '',
  selectedSocialTemplateId: '',
  selectedVideoTemplateId: '',
  agentName: 'Juan Pérez',
  agentPhone: '+595 999 123456',
  agentEmail: 'juan@flowrealtor.com',
  agentCompany: 'FlowRealtor',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  title: '',
  hook: '',
  body: '',
  caption: '',
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [content, setContent] = useState<PropertyContent | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadTemplates = async () => {
      try {
        const data = await templatesApi.getAll()
        if (mounted && data.length > 0) {
          setTemplates(data)
          setForm((f) => ({
            ...f,
            selectedPdfTemplateId: data.find((t) => t.type === 'PDF')?.id || '',
            selectedSocialTemplateId:
              data.find((t) => t.type.startsWith('SOCIAL'))?.id || '',
            selectedVideoTemplateId:
              data.find((t) => t.type === 'VIDEO_REEL')?.id || '',
          }))
        }
      } catch (e) {
        console.error('Error loading templates', e)
      }
    }
    loadTemplates()
    return () => {
      mounted = false
    }
  }, [])

  const update = (key: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleCreateProperty = async () => {
    if (propertyId) return // already created
    setLoading(true)
    setError(null)
    try {
      const property = await propertiesApi.create({
        agentId: AGENT_ID,
        operationType: form.operationType as Property['operationType'],
        propertyType: form.propertyType as Property['propertyType'],
        country: form.country,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        priceAmount: Number(form.priceAmount) || 0,
        currency: form.currency as 'USD' | 'PYG',
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
      })
      setPropertyId(property.id)
    } catch (e) {
      setError(String(e))
      throw e
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateContent = async (pid: string) => {
    setLoading(true)
    setError(null)
    try {
      const generated = await contentApi.generate({
        propertyId: pid,
        videoFormat: form.videoFormat,
        voiceGender: form.voiceGender,
      })
      setContent(generated)
      setForm((f) => ({
        ...f,
        title: generated.title,
        hook: generated.hook,
        body: generated.body,
        caption: generated.caption,
        editedScenes: generated.videoScript.scenes.map((s, i) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
          imageId: f.uploadedImages[i % f.uploadedImages.length]?.id || null,
        })),
      }))
    } catch (e) {
      setError(String(e))
      throw e
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScript = async () => {
    if (!propertyId || !content) return
    await contentApi.update(propertyId, {
      title: form.title,
      hook: form.hook,
      body: form.body,
      caption: form.caption,
      videoScript: {
        scenes: form.editedScenes.map((s) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
        })),
      },
    })
  }

  const handleGenerateListings = async () => {
    if (!propertyId) return
    setLoading(true)
    setError(null)
    try {
      await handleSaveScript()
      await listingsApi.generate({
        propertyId,
        briefConfig: {
          templateId: form.selectedPdfTemplateId || undefined,
          colors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
          },
        },
        socialConfig: {
          templateId: form.selectedSocialTemplateId || undefined,
          images: form.uploadedImages.map((img, idx) => ({
            imageId: img.id,
            order: idx,
          })),
          colors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
          },
        },
        videoConfig: {
          templateId: form.selectedVideoTemplateId || undefined,
          format: form.videoFormat,
          voiceoverEnabled: form.voiceoverEnabled,
          voiceGender: form.voiceGender,
          sceneOrder: form.editedScenes.map((s) => ({
            imageId: s.imageId || '',
            sceneText: s.text,
            duration: s.suggestedDuration,
          })),
        },
      })
      router.push(`/properties/${propertyId}`)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const goNext = async () => {
    try {
      if (step === 1) await handleCreateProperty()
      if (step === 2) {
        if (form.uploadedImages.length === 0) {
          setError('Por favor subí al menos una imagen antes de continuar.')
          return
        }
      }
      if (step === 3 && propertyId) {
        if (!content) {
          setError(
            "Haz clic en 'Generar Contenido IA' para que el asistente redacte el título y descripciones.",
          )
          return
        }
        await handleSaveScript()
      }

      setStep((s) => Math.min(s + 1, STEPS.length))
      setError(null)
    } catch { }
  }

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Nueva Propiedad</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Paso {step} de {STEPS.length}: {STEPS[step - 1].label}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <X className="h-4 w-4 mr-1" />{' '}
            <span className="hidden sm:inline">Cancelar</span>
          </Button>
        </div>
      </div>

      <div className="border-b bg-card pb-4 sticky top-[65px] sm:top-[73px] z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-2">
          <Progress value={progressPct} className="h-1.5 mb-3" />
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    step === s.id
                      ? 'bg-primary text-primary-foreground'
                      : step > s.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="h-3 w-3" /> {s.label}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />{' '}
            <span>{error}</span>
          </div>
        )}

        {step === 1 && <Step1 form={form} update={update} />}
        {step === 2 && (
          <Step2 propertyId={propertyId} form={form} update={update} />
        )}
        {step === 3 && (
          <Step3
            form={form}
            update={update}
            propertyId={propertyId}
            content={content}
            onGenerate={() => propertyId && handleGenerateContent(propertyId)}
            loading={loading}
          />
        )}
        {step === 4 && (
          <Step4
            form={form}
            update={update}
            templates={templates}
            content={content}
          />
        )}

        <div className="flex justify-between mt-8 pb-10 border-t pt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          {step < STEPS.length ? (
            <Button
              onClick={goNext}
              disabled={loading || (step === 3 && !content)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                  Procesando...
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerateListings}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Generar Todo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// --- STEP 1: Detalles ---
function Step1({
  form,
  update,
}: {
  form: FormData
  update: (k: keyof FormData, v: any) => void
}) {
  const [activeAccordion, setActiveAccordion] = useState<string>('datos')
  const toggleAmenity = (a: string) => {
    update(
      'amenities',
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Detalles del Inmueble
        </h2>
        <p className="text-sm text-muted-foreground">
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
        <AccordionItem
          value="datos"
          className="border rounded-xl bg-card px-4 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base">Datos Básicos</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Tipo, ubicación y operación
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 px-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo de Inmueble
                </Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) => update('propertyType', v)}
                >
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Barrio / Zona
                </Label>
                <Select
                  value={form.neighborhood}
                  onValueChange={(v) => update('neighborhood', v)}
                >
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ciudad
                </Label>
                <Input
                  className="bg-background"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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

        <AccordionItem
          value="caracteristicas"
          className="border rounded-xl bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base">Características</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Precio, dimensiones y ambientes
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 px-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Precio
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={form.currency}
                    onValueChange={(v) => update('currency', v)}
                  >
                    <SelectTrigger className="w-24 bg-background">
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  m² Total
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  value={form.totalArea}
                  onChange={(e) => update('totalArea', e.target.value)}
                />
              </div>
              <div className="col-span-full space-y-2 mt-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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

        <AccordionItem
          value="amenidades"
          className="border rounded-xl bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base">Amenidades</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Piscina, seguridad, extras
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 px-2">
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all shadow-sm',
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
  )
}

// --- STEP 2: Galería de Medios ---
function Step2({
  propertyId,
  form,
  update,
}: {
  propertyId: string | null
  form: FormData
  update: (k: keyof FormData, v: any) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!propertyId || !e.target.files?.length) return
    setUploading(true)
    try {
      const files = Array.from(e.target.files)
      const uploaded = await propertiesApi.uploadImages(propertyId, files)
      update('uploadedImages', [...form.uploadedImages, ...uploaded])
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !propertyId) return
    const items = Array.from(form.uploadedImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    update('uploadedImages', items)
  }

  const removeImage = async (imageId: string) => {
    if (!propertyId) return
    try {
      await propertiesApi.deleteImage(propertyId, imageId)
      update(
        'uploadedImages',
        form.uploadedImages.filter((img) => img.id !== imageId),
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-pretty">
          Galería de Medios
        </h2>
        <p className="text-muted-foreground">
          Sube tus fotos y ordénalas arrastrando. La primera será la{' '}
          <span className="font-bold text-foreground">portada</span>.
        </p>
      </div>

      <label className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-card shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <span className="font-bold text-lg">Haz clic o arrastra fotos</span>
        <span className="text-sm text-muted-foreground mt-1">
          Soporta JPG, PNG y WEBP. Máximo 20 fotos.
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {uploading && (
        <div className="text-center text-sm font-medium animate-pulse text-primary flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-5 w-5 animate-spin" /> Subiendo y optimizando
          imágenes...
        </div>
      )}

      {form.uploadedImages.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="gallery" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-4 mt-8"
              >
                {form.uploadedImages.map((img, index) => (
                  <Draggable key={img.id} draggableId={img.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                        className="relative group w-36 h-36 rounded-xl overflow-hidden border-2 bg-card shadow-lg ring-primary/50 transition-all hover:border-primary"
                      >
                        <img
                          src={img.url}
                          alt="Property"
                          className="absolute inset-0 w-full h-full object-cover scale-101 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <GripVertical className="h-8 w-8 text-white" />
                        </div>
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 text-[10px] bg-primary border-none shadow-md uppercase font-bold px-2 py-0.5">
                            Portada
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(img.id)
                          }}
                          className="absolute top-2 right-2 bg-destructive/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive z-30"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}

// --- STEP 3: IA y Guion ---
function Step3({
  form,
  update,
  propertyId,
  content,
  onGenerate,
  loading,
}: any) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeSceneIdx, setActiveSceneIdx] = useState<number | null>(null)

  if (!content) {
    return (
      <div className="max-w-lg mx-auto space-y-8 py-12 animate-in fade-in duration-500 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Creación de Contenido
          </h2>
          <p className="text-muted-foreground text-pretty">
            Analizaremos los datos cargados para redactar el título y el guion
            perfecto.
          </p>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="p-8 space-y-6 text-left">
            <div className="space-y-3">
              <Label className="font-bold text-base">
                Tipo de Video Deseado
              </Label>
              <Select
                value={form.videoFormat}
                onValueChange={(v) => update('videoFormat', v)}
              >
                <SelectTrigger className="h-12 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">
                    🚀 Reel Rápido (30s) - Para captar atención
                  </SelectItem>
                  <SelectItem value="narrated">
                    🏡 Recorrido Detallado (60s) - Para YouTube/FB
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex items-center space-x-3 border-2 rounded-xl p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => update('voiceoverEnabled', !form.voiceoverEnabled)}
            >
              <Checkbox
                id="voiceover"
                className="w-5 h-5"
                checked={form.voiceoverEnabled}
                onCheckedChange={(checked) =>
                  update('voiceoverEnabled', !!checked)
                }
              />
              <div className="flex flex-col">
                <label className="text-sm font-bold leading-tight cursor-pointer">
                  Activar narración de voz
                </label>
                <span className="text-xs text-muted-foreground">
                  Se generará un audio profesional describiendo la casa.
                </span>
              </div>
            </div>

            <Button
              className="w-full h-14 gap-3 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90"
              onClick={onGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
              Generar Contenido
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Propuesta de la IA
          </h2>
          <p className="text-sm text-muted-foreground">
            Revisa los textos del video. Para editar todo el contenido, ve al
            Estudio Creativo.
          </p>
        </div>
      </div>

      <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 shadow-inner">
        <div className="text-[10px] uppercase tracking-widest text-primary font-black mb-2 flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Título Publicitario Generado
        </div>
        <div className="text-xl font-bold leading-tight">{content.title}</div>
      </div>

      <div className="grid gap-4">
        {form.editedScenes.map((scene: any, idx: number) => {
          const selectedImage = form.uploadedImages.find(
            (img: any) => img.id === scene.imageId,
          )
          return (
            <Card
              key={idx}
              className="border-l-8 border-l-primary/30 hover:border-l-primary transition-all overflow-hidden"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3 text-left">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    Escena {idx + 1} — {scene.suggestedDuration}s
                  </Label>
                  <Textarea
                    value={scene.text}
                    onChange={(e) => {
                      const newScenes = [...form.editedScenes]
                      newScenes[idx].text = e.target.value
                      update('editedScenes', newScenes)
                    }}
                    rows={2}
                    className="text-sm resize-none focus-visible:ring-primary border-none bg-muted/30 p-3 rounded-lg"
                  />
                </div>
                <div className="flex-shrink-0 flex items-center">
                  <div
                    onClick={() => {
                      setActiveSceneIdx(idx)
                      setModalOpen(true)
                    }}
                    className={cn(
                      'relative w-28 h-28 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all bg-card hover:bg-muted shadow-sm',
                      selectedImage
                        ? 'border-primary border-solid'
                        : 'hover:border-primary',
                    )}
                  >
                    {selectedImage ? (
                      <img
                        src={selectedImage.url}
                        className="absolute inset-0 w-full h-full object-cover scale-101"
                        alt="Scene"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                          Elegir Foto
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl bg-background shadow-2xl border-none">
            <CardHeader className="flex flex-row items-center justify-between py-5 border-b px-8">
              <CardTitle className="text-xl font-bold">
                Galería para Escena{' '}
                {activeSceneIdx !== null ? activeSceneIdx + 1 : ''}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {form.uploadedImages.map((img: any) => (
                <div
                  key={img.id}
                  className={cn(
                    'relative aspect-square cursor-pointer rounded-xl overflow-hidden border-4 transition-all shadow-md',
                    form.editedScenes[activeSceneIdx!]?.imageId === img.id
                      ? 'border-primary scale-95'
                      : 'border-transparent hover:border-primary/50',
                  )}
                  onClick={() => {
                    const newScenes = [...form.editedScenes]
                    if (activeSceneIdx !== null)
                      newScenes[activeSceneIdx].imageId = img.id
                    update('editedScenes', newScenes)
                    setModalOpen(false)
                  }}
                >
                  <img
                    src={img.url}
                    className="absolute inset-0 w-full h-full object-cover scale-101"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// --- STEP 4: Estudio Creativo ---
function Step4({ form, update, templates, content }: any) {
  const [activeTab, setActiveTab] = useState('social')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [activeSlide, setActiveSlide] = useState('cover')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (content && !form.title) {
      update('title', content.title)
      update('hook', content.hook)
      update('body', content.body)
      update('caption', content.caption)
    }
  }, [content])

  const socialTemplates = templates.filter((t: any) => t.type === 'SOCIAL')
  const pdfTemplates = templates.filter((t: any) => t.type === 'PDF')
  const videoTemplates = templates.filter((t: any) => t.type === 'VIDEO_REEL')

  const currentList =
    activeTab === 'social'
      ? socialTemplates
      : activeTab === 'pdf'
        ? pdfTemplates
        : videoTemplates
  const currentSelectedIdKey =
    activeTab === 'social'
      ? 'selectedSocialTemplateId'
      : activeTab === 'pdf'
        ? 'selectedPdfTemplateId'
        : 'selectedVideoTemplateId'
  const activeTemplateId = form[currentSelectedIdKey]
  const activeTemplate = templates.find((t: any) => t.id === activeTemplateId)

  useEffect(() => {
    if (
      !activeTemplate ||
      activeTemplate.livePreviewType !== 'html_iframe' ||
      !content
    ) {
      setPreviewHtml('')
      return
    }

    let mounted = true
    let subPath = 'raw'
    if (activeTemplate.type === 'SOCIAL') {
      subPath = `raw?slide=${activeSlide}`
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/templates/${activeTemplate.id}/${subPath}`,
      {
        headers: { Accept: 'text/plain' },
      },
    )
      .then((r) => r.text())
      .then((rawStr) => {
        if (!mounted) return
        try {
          const compiler = Handlebars.compile(rawStr)
          const hbData = {
            title: form.title,
            hook: form.hook,
            body: form.body,
            caption: form.caption,
            primaryColor: form.primaryColor,
            secondaryColor: form.secondaryColor,
            operation: form.operationType === 'venta' ? 'VENTA' : 'ALQUILER',
            operationLabel:
              form.operationType === 'venta' ? 'EN VENTA' : 'EN ALQUILER',
            price: formatPrice(Number(form.priceAmount) || 0, form.currency),
            neighborhood: form.neighborhood,
            city: form.city,
            address: form.address || form.neighborhood || form.city,
            location: `${form.neighborhood}, ${form.city}`,
            bedrooms: form.bedrooms || '0',
            bathrooms: form.bathrooms || '0',
            parking: form.parkingSpaces || '0',
            parkingSpaces: form.parkingSpaces || '0',
            area: form.totalArea || form.builtArea || '0',
            builtArea: form.builtArea || '0',
            totalArea: form.totalArea || '0',
            amenities: form.amenities,
            agentName: form.agentName,
            agentPhone: form.agentPhone,
            agentEmail: form.agentEmail,
            agentCompany: form.agentCompany,
            companyName: form.agentCompany,
            imageUrl: form.uploadedImages[0]?.url,
            coverImageUrl: form.uploadedImages[0]?.url,
            galleryImages: form.uploadedImages.map((img: any) => img.url),
            isStory: false,
          }
          setPreviewHtml(compiler(hbData))
        } catch (e) {
          console.error('Handlebars compile error:', e)
          setPreviewHtml(
            "<div style='padding:20px;color:red;font-family:sans-serif;'>Error al compilar la vista previa</div>",
          )
        }
      })

    return () => {
      mounted = false
    }
  }, [activeTemplate, form, content, activeSlide])

  const previewSize = useMemo(() => {
    if (activeTab === 'pdf') return { w: 794, h: 1123, scale: 0.45 }
    return { w: 1080, h: 1080, scale: 0.32 }
  }, [activeTab])

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[80vh] animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="w-full md:w-96 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar text-left">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase">
            Estudio Creativo
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Personaliza el diseño y los textos finales.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="social"
              className="text-xs font-bold rounded-lg uppercase"
            >
              Redes
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="text-xs font-bold rounded-lg uppercase"
            >
              PDF
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="text-xs font-bold rounded-lg uppercase"
            >
              Video
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Accordion
          type="single"
          collapsible
          defaultValue="template"
          className="w-full space-y-2 border-none"
        >
          <AccordionItem
            value="template"
            className="border rounded-xl bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
              1. Diseño Visual
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-1">
              <div className="grid grid-cols-2 gap-4">
                {currentList.map((t: any) => (
                  <Card
                    key={t.id}
                    className={cn(
                      'cursor-pointer overflow-hidden transition-all group border-2 shadow-sm rounded-xl',
                      activeTemplateId === t.id
                        ? 'border-primary ring-4 ring-primary/10 scale-95'
                        : 'border-transparent hover:border-primary/20',
                    )}
                    onClick={() => update(currentSelectedIdKey, t.id)}
                  >
                    <div className="aspect-square bg-muted relative">
                      {t.thumbnailUrl ? (
                        <img
                          src={t.thumbnailUrl}
                          className="absolute inset-0 w-full h-full object-cover scale-101"
                          alt={t.label}
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                      )}
                      {activeTemplateId === t.id && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Check className="h-8 w-8 text-primary bg-white rounded-full p-1 shadow-xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-[9px] font-black truncate text-center bg-card uppercase tracking-tighter">
                      {t.label}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase ml-1">
                    Color Primario
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-10 h-10 p-1 cursor-pointer rounded-lg border-2"
                      value={form.primaryColor}
                      onChange={(e) => update('primaryColor', e.target.value)}
                    />
                    <Input
                      className="h-10 text-[10px] font-mono uppercase bg-background"
                      value={form.primaryColor}
                      onChange={(e) => update('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase ml-1">
                    Color Secundario
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-10 h-10 p-1 cursor-pointer rounded-lg border-2"
                      value={form.secondaryColor}
                      onChange={(e) => update('secondaryColor', e.target.value)}
                    />
                    <Input
                      className="h-10 text-[10px] font-mono uppercase bg-background"
                      value={form.secondaryColor}
                      onChange={(e) => update('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="content"
            className="border rounded-xl bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
              2. Textos Publicitarios
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4 px-1">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Título Sugerido
                </Label>
                <Input
                  className="h-9 text-xs bg-background"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Gancho (Hook)
                </Label>
                <Textarea
                  className="text-xs resize-none bg-background"
                  rows={2}
                  value={form.hook}
                  onChange={(e) => update('hook', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Cuerpo / Descripción
                </Label>
                <Textarea
                  className="text-xs resize-none bg-background"
                  rows={4}
                  value={form.body}
                  onChange={(e) => update('body', e.target.value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="agent"
            className="border rounded-xl bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
              3. Información de Contacto
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3 px-1">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Nombre
                </Label>
                <Input
                  className="h-9 text-xs bg-background"
                  value={form.agentName}
                  onChange={(e) => update('agentName', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  WhatsApp
                </Label>
                <Input
                  className="h-9 text-xs bg-background"
                  value={form.agentPhone}
                  onChange={(e) => update('agentPhone', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Email
                </Label>
                <Input
                  className="h-9 text-xs bg-background"
                  value={form.agentEmail}
                  onChange={(e) => update('agentEmail', e.target.value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex-1 bg-[#ebeef2] rounded-3xl border-4 border-white flex flex-col items-center justify-between overflow-hidden relative shadow-inner p-4 pb-0">
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xl z-10 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          Previsualización en Vivo
        </div>

        <div className="w-full flex-1 flex items-center justify-center relative min-h-[400px]">
          {activeTemplate?.livePreviewType === 'html_iframe' ? (
            previewHtml ? (
              <div
                className="relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] bg-white overflow-hidden rounded-sm"
                style={{
                  width: `${previewSize.w * previewSize.scale}px`,
                  height: `${previewSize.h * previewSize.scale}px`,
                }}
              >
                <iframe
                  ref={iframeRef}
                  sandbox="allow-same-origin allow-scripts"
                  srcDoc={previewHtml}
                  className="absolute top-0 left-0 border-none pointer-events-none"
                  style={{
                    width: `${previewSize.w}px`,
                    height: `${previewSize.h}px`,
                    transform: `scale(${previewSize.scale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">
                  Generando Vista...
                </span>
              </div>
            )
          ) : activeTemplate?.livePreviewType === 'static_video' ? (
            activeTemplate.demoVideoUrl ? (
              <div className="relative aspect-[9/16] h-full max-h-[520px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden border-[12px] border-black ring-4 ring-white/20 animate-in zoom-in-95 duration-500">
                <video
                  src={activeTemplate.demoVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="text-muted-foreground text-xs uppercase font-black tracking-widest bg-white/50 px-6 py-3 rounded-full">
                Video demo no disponible
              </div>
            )
          ) : (
            <div className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] bg-white/50 px-8 py-4 rounded-full shadow-sm">
              Selecciona una plantilla
            </div>
          )}
        </div>

        {/* Carousel Strip */}
        {activeTab === 'social' && activeTemplate?.type === 'SOCIAL' && (
          <div className="w-full h-24 bg-white border-t border-x rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 flex gap-3 overflow-x-auto custom-scrollbar justify-center items-center">
            {[
              { id: 'cover', label: 'Portada' },
              { id: 'features', label: 'Info' },
              { id: 'amenities', label: 'Extras' },
              { id: 'photo', label: 'Fotos' },
              { id: 'contact', label: 'Cierre' },
            ].map((slide) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className={cn(
                  'h-full px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2',
                  activeSlide === slide.id
                    ? 'bg-primary/5 border-primary shadow-sm scale-105'
                    : 'bg-muted/30 border-transparent hover:bg-muted',
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
                    activeSlide === slide.id
                      ? 'bg-primary text-white'
                      : 'bg-background text-muted-foreground',
                  )}
                >
                  {slide.id === 'photo' ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    slide.label.charAt(0)
                  )}
                </div>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-widest',
                    activeSlide === slide.id
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {slide.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
