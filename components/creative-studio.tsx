'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Sparkles,
  FileText,
  ImageIcon,
  Video as VideoIcon,
  Upload,
  GripVertical,
  X,
  Loader2,
  Palette,
  Layout,
  Type,
  Hash,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Handlebars from 'handlebars';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CreativeStudioProps {
  propertyId: string;
  initialData: any;
  content: any;
  templates: any[];
  onSave: (data: any, productType?: string) => Promise<void>;
  isGenerating?: boolean;
  mode?: 'create' | 'edit';
  initialTab?: 'brief' | 'social' | 'video';
}

export function CreativeStudio({
  propertyId,
  initialData,
  content,
  templates,
  onSave,
  isGenerating = false,
  mode = 'create',
  initialTab = 'social',
}: CreativeStudioProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [formData, setFormData] = useState({
    briefTitle: content?.briefTitle || content?.title || '',
    briefHook: content?.briefHook || content?.hook || '',
    briefDescripcion: content?.briefDescripcion || content?.body || '',
    selectedPdfTemplateId:
      initialData?.selectedPdfTemplateId || templates.find((t) => t.type === 'PDF')?.id || '',
    socialPostTitle: content?.socialPostTitle || content?.title || '',
    socialPostCaption: content?.socialPostCaption || content?.caption || '',
    hashtags: content?.hashtags || [],
    selectedSocialTemplateId:
      initialData?.selectedSocialTemplateId || templates.find((t) => t.type === 'SOCIAL')?.id || '',
    videoTitle: content?.videoTitle || content?.title || '',
    videoScript: content?.videoScript || { scenes: [] },
    selectedVideoTemplateId:
      initialData?.selectedVideoTemplateId ||
      templates.find((t) => t.type === 'VIDEO_REEL')?.id ||
      '',
    primaryColor: initialData?.primaryColor || '#2563eb',
    secondaryColor: initialData?.secondaryColor || '#1e40af',
    uploadedImages: initialData?.uploadedImages || [],
  });

  const [activeSlide, setActiveSlide] = useState('cover');

  // Debounced form data for expensive operations (preview and parent update)
  const debouncedFormData = useDebounce(formData, 300);

  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      briefTitle: prev.briefTitle || content?.briefTitle || content?.title || '',
      briefHook: prev.briefHook || content?.briefHook || content?.hook || '',
      briefDescripcion: prev.briefDescripcion || content?.briefDescripcion || content?.body || '',
      selectedPdfTemplateId:
        prev.selectedPdfTemplateId ||
        initialData?.selectedPdfTemplateId ||
        templates.find((t) => t.type === 'PDF')?.id ||
        '',
      socialPostTitle: prev.socialPostTitle || content?.socialPostTitle || content?.title || '',
      socialPostCaption:
        prev.socialPostCaption || content?.socialPostCaption || content?.caption || '',
      hashtags: prev.hashtags.length ? prev.hashtags : content?.hashtags || [],
      selectedSocialTemplateId:
        prev.selectedSocialTemplateId ||
        initialData?.selectedSocialTemplateId ||
        templates.find((t) => t.type === 'SOCIAL')?.id ||
        '',
      videoTitle: prev.videoTitle || content?.videoTitle || content?.title || '',
      videoScript: prev.videoScript.scenes.length
        ? prev.videoScript
        : content?.videoScript || { scenes: [] },
      selectedVideoTemplateId:
        prev.selectedVideoTemplateId ||
        initialData?.selectedVideoTemplateId ||
        templates.find((t) => t.type === 'VIDEO_REEL')?.id ||
        '',
      primaryColor: initialData?.primaryColor || prev.primaryColor,
      secondaryColor: initialData?.secondaryColor || prev.secondaryColor,
      uploadedImages: initialData?.uploadedImages || prev.uploadedImages,
    }));
  }, [initialData, content, templates]);

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerSize({
          w: entries[0].contentRect.width,
          h: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Sync with parent when debounced data changes
  useEffect(() => {
    if (mode === 'create') {
      onSave(debouncedFormData);
    }
  }, [debouncedFormData, mode, onSave]);

  const activeTemplateId = useMemo(() => {
    if (activeTab === 'brief') return formData.selectedPdfTemplateId;
    if (activeTab === 'social') return formData.selectedSocialTemplateId;
    return formData.selectedVideoTemplateId;
  }, [activeTab, formData]);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplateId),
    [templates, activeTemplateId],
  );

  const compilerCache = useRef<Record<string, Handlebars.TemplateDelegate>>({});
  const templateCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!activeTemplate || activeTemplate.livePreviewType !== 'html_iframe') {
      setPreviewHtml('');
      return;
    }

    let mounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let subPath = activeTemplate.type === 'SOCIAL' ? `raw?slide=${activeSlide}` : 'raw';
    const cacheKey = `${activeTemplate.id}-${subPath}`;

    const generatePreview = (rawStr: string) => {
      if (!mounted) return;
      try {
        let compiler = compilerCache.current[cacheKey];
        if (!compiler) {
          compiler = Handlebars.compile(rawStr);
          compilerCache.current[cacheKey] = compiler;
        }

        let currentImageUrl = debouncedFormData.uploadedImages[0]?.url;
        if (activeTab === 'social') {
          if (activeSlide === 'photo')
            currentImageUrl =
              debouncedFormData.uploadedImages[3]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'features')
            currentImageUrl =
              debouncedFormData.uploadedImages[1]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'amenities')
            currentImageUrl =
              debouncedFormData.uploadedImages[2]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'contact')
            currentImageUrl =
              debouncedFormData.uploadedImages[debouncedFormData.uploadedImages.length - 1]?.url ||
              debouncedFormData.uploadedImages[0]?.url;
        }

        const hbData = {
          title:
            activeTab === 'brief'
              ? debouncedFormData.briefTitle
              : activeTab === 'social'
                ? debouncedFormData.socialPostTitle
                : debouncedFormData.videoTitle,
          hook: debouncedFormData.briefHook,
          body: debouncedFormData.briefDescripcion,
          caption: debouncedFormData.socialPostCaption,
          primaryColor: debouncedFormData.primaryColor,
          secondaryColor: debouncedFormData.secondaryColor,
          operationLabel: initialData?.operationType === 'venta' ? 'EN VENTA' : 'EN ALQUILER',
          isRental: initialData?.operationType === 'alquiler',
          price: initialData?.priceFormatted || 'Consultar',
          location: `${initialData?.neighborhood || ''}, ${initialData?.city || ''}`,
          bedrooms: initialData?.bedrooms || '0',
          bathrooms: initialData?.bathrooms || '0',
          parking: initialData?.parkingSpaces || '0',
          area: initialData?.totalArea || '0',
          amenities: initialData?.amenities || [],
          agentName: initialData?.agentName || 'Agente',
          agentPhone: initialData?.agentPhone,
          agentEmail: initialData?.agentEmail,
          companyName: initialData?.agentCompany,
          imageUrl: currentImageUrl,
          coverImageUrl: debouncedFormData.uploadedImages[0]?.url,
          galleryImages: debouncedFormData.uploadedImages.map((img: any) => img.url),
          isStory: false,
        };
        setPreviewHtml(compiler(hbData));
      } catch (e) {
        console.error('Handlebars error:', e);
      } finally {
        if (mounted) setIsGeneratingPreview(false);
      }
    };

    setIsGeneratingPreview(true);

    if (templateCache.current[cacheKey]) {
      generatePreview(templateCache.current[cacheKey]);
    } else {
      fetch(`${apiUrl}/api/templates/${activeTemplate.id}/${subPath}`, {
        headers: { Accept: 'text/plain' },
      })
        .then((r) => r.text())
        .then((rawStr) => {
          if (mounted) {
            templateCache.current[cacheKey] = rawStr;
            generatePreview(rawStr);
          }
        })
        .catch(() => {
          if (mounted) setIsGeneratingPreview(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [activeTemplate, debouncedFormData, activeSlide, activeTab, initialData]);

  const previewSize = useMemo(() => {
    if (activeTab === 'brief') return { w: 794, h: 1123 };
    return { w: 1080, h: 1080 };
  }, [activeTab]);

  const scale = useMemo(() => {
    if (!containerSize.w || !containerSize.h) return 0.3;
    const isMobile = containerSize.w < 768;
    const PADDING_BUFFER = isMobile ? 32 : 60;
    const availableW = Math.max(0, containerSize.w - PADDING_BUFFER);
    const availableH = Math.max(0, containerSize.h - PADDING_BUFFER);
    return Math.min(availableW / previewSize.w, availableH / previewSize.h);
  }, [containerSize, previewSize]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formData.uploadedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateField('uploadedImages', items);
  };

  const removeImage = (id: string) => {
    updateField(
      'uploadedImages',
      formData.uploadedImages.filter((img: any) => img.id !== id),
    );
  };

  return (
    <div className="animate-in fade-in flex min-h-[600px] w-full flex-col gap-4 duration-500 lg:flex-row lg:gap-6">
      <div className="order-1 flex shrink-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
        <TabButton
          active={activeTab === 'brief'}
          onClick={() => setActiveTab('brief')}
          icon={<FileText className="h-5 w-5" />}
          label="Brief PDF"
        />
        <TabButton
          active={activeTab === 'social'}
          onClick={() => setActiveTab('social')}
          icon={<ImageIcon className="h-5 w-5" />}
          label="Redes Sociales"
        />
        <TabButton
          active={activeTab === 'video'}
          onClick={() => setActiveTab('video')}
          icon={<VideoIcon className="h-5 w-5" />}
          label="Video Reel"
        />
      </div>

      <div className="custom-scrollbar order-3 flex w-full shrink-0 flex-col gap-4 pr-0 lg:order-2 lg:w-[380px] lg:overflow-y-auto lg:pr-2">
        <Accordion type="multiple" defaultValue={['content', 'design']} className="space-y-3">
          <AccordionItem value="media" className="bg-card rounded-xl border px-4">
            <AccordionTrigger className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              1. Galería de Medios
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gallery" direction="vertical">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-3 gap-2"
                    >
                      {formData.uploadedImages.map((img: any, index: number) => (
                        <Draggable key={img.id} draggableId={img.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'group bg-muted relative aspect-square overflow-hidden rounded-lg border-2',
                                snapshot.isDragging
                                  ? 'border-primary z-10 scale-105'
                                  : 'border-transparent',
                              )}
                            >
                              <img
                                src={img.url}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              {index === 0 && (
                                <Badge className="bg-primary absolute bottom-1 left-1 px-1 py-0 text-[8px] font-bold uppercase">
                                  Portada
                                </Badge>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(img.id)}
                                className="bg-destructive/90 absolute top-1 right-1 z-20 rounded-full p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="design" className="bg-card rounded-xl border px-4">
            <AccordionTrigger className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              2. Diseño y Estilo
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="ml-1 text-[10px] font-bold uppercase">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="h-10 w-10 cursor-pointer rounded-lg border-2 p-1"
                      value={formData.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                    />
                    <Input
                      className="bg-background h-10 font-mono text-[10px] uppercase"
                      value={formData.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="ml-1 text-[10px] font-bold uppercase">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="h-10 w-10 cursor-pointer rounded-lg border-2 p-1"
                      value={formData.secondaryColor}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                    />
                    <Input
                      className="bg-background h-10 font-mono text-[10px] uppercase"
                      value={formData.secondaryColor}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="ml-1 text-[10px] font-bold uppercase">
                  Plantilla Seleccionada
                </Label>
                <Select
                  value={
                    activeTab === 'brief'
                      ? formData.selectedPdfTemplateId
                      : activeTab === 'social'
                        ? formData.selectedSocialTemplateId
                        : formData.selectedVideoTemplateId
                  }
                  onValueChange={(v) =>
                    updateField(
                      activeTab === 'brief'
                        ? 'selectedPdfTemplateId'
                        : activeTab === 'social'
                          ? 'selectedSocialTemplateId'
                          : 'selectedVideoTemplateId',
                      v,
                    )
                  }
                >
                  <SelectTrigger className="bg-background h-10 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter(
                        (t) =>
                          t.type ===
                          (activeTab === 'brief'
                            ? 'PDF'
                            : activeTab === 'social'
                              ? 'SOCIAL'
                              : 'VIDEO_REEL'),
                      )
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content" className="bg-card rounded-xl border px-4">
            <AccordionTrigger className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              3. Contenido Editable
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
              {activeTab === 'brief' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">Título PDF</Label>
                    <Input
                      className="bg-background h-9 rounded-lg text-xs"
                      value={formData.briefTitle}
                      onChange={(e) => updateField('briefTitle', e.target.value)}
                      placeholder="Título"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">Gancho / Hook</Label>
                    <Textarea
                      className="bg-background resize-none rounded-lg text-xs"
                      rows={2}
                      value={formData.briefHook}
                      onChange={(e) => updateField('briefHook', e.target.value)}
                      placeholder="Gancho"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">Descripción</Label>
                    <Textarea
                      className="bg-background resize-none rounded-lg text-xs"
                      rows={5}
                      value={formData.briefDescripcion}
                      onChange={(e) => updateField('briefDescripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </div>
                </>
              )}
              {activeTab === 'social' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">Título en Imagen</Label>
                    <Input
                      className="bg-background h-9 rounded-lg text-xs"
                      value={formData.socialPostTitle}
                      onChange={(e) => updateField('socialPostTitle', e.target.value)}
                      placeholder="Título"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">
                      Pie de Foto (Caption)
                    </Label>
                    <Textarea
                      className="bg-background resize-none rounded-lg text-xs"
                      rows={5}
                      value={formData.socialPostCaption}
                      onChange={(e) => updateField('socialPostCaption', e.target.value)}
                      placeholder="Caption"
                    />
                  </div>
                </>
              )}
              {activeTab === 'video' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[10px] font-bold uppercase">Título del Video</Label>
                    <Input
                      className="bg-background h-9 rounded-lg text-xs"
                      value={formData.videoTitle}
                      onChange={(e) => updateField('videoTitle', e.target.value)}
                      placeholder="Título del video"
                    />
                  </div>
                  <div className="space-y-3 pt-2">
                    <Label className="ml-1 text-[10px] font-bold uppercase">
                      Guion por Escenas
                    </Label>
                    <div className="space-y-3">
                      {formData.videoScript.scenes.map((scene: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                              Escena {idx + 1}
                            </span>
                            <span className="text-muted-foreground/60 text-[9px] font-bold">
                              {scene.suggestedDuration}s
                            </span>
                          </div>
                          <Textarea
                            className="bg-background resize-none rounded-lg text-xs"
                            rows={2}
                            value={scene.text}
                            onChange={(e) => {
                              const newScenes = [...formData.videoScript.scenes];
                              newScenes[idx] = {
                                ...newScenes[idx],
                                text: e.target.value,
                              };
                              updateField('videoScript', {
                                ...formData.videoScript,
                                scenes: newScenes,
                              });
                            }}
                            placeholder={`Texto de la escena ${idx + 1}`}
                          />
                        </div>
                      ))}
                      {formData.videoScript.scenes.length === 0 && (
                        <p className="text-muted-foreground py-4 text-center text-[10px] italic">
                          No hay escenas generadas para este video.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {mode === 'edit' && (
          <Button
            size="lg"
            className="bg-primary shadow-primary/20 mt-4 h-12 w-full rounded-xl font-bold tracking-widest uppercase shadow-lg"
            onClick={() => onSave(formData, activeTab)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            Guardar y Regenerar
          </Button>
        )}
      </div>

      <div
        className="relative order-2 flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-[#ebeef2] shadow-2xl lg:order-3 lg:min-h-[600px]"
        style={{ perspective: '1000px' }}
      >
        {isGeneratingPreview && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}

        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border bg-white/90 px-4 py-2 text-[10px] font-black uppercase shadow-sm backdrop-blur-md">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
          Live Preview: {activeTab.toUpperCase()}
        </div>

        <div
          ref={containerRef}
          className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-8 lg:px-6 lg:py-16"
        >
          {activeTab === 'video' ? (
            <div className="text-muted-foreground rounded-full bg-white/50 px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-sm">
              El video requiere regeneración para ver cambios
            </div>
          ) : previewHtml ? (
            <div
              className="pointer-events-none relative overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300"
              style={{
                width: `${previewSize.w}px`,
                height: `${previewSize.h}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <iframe
                srcDoc={previewHtml}
                scrolling="no"
                className="pointer-events-none h-full w-full rounded-lg border-none"
              />
            </div>
          ) : (
            <div className="text-muted-foreground rounded-full bg-white/50 px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-sm">
              Cargando vista previa...
            </div>
          )}
        </div>

        {activeTab === 'social' && (
          <div className="animate-in slide-in-from-bottom-4 absolute bottom-8 left-1/2 z-20 w-fit max-w-[95%] -translate-x-1/2 duration-500">
            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/50 bg-white/90 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
              {['cover', 'features', 'amenities', 'photo', 'contact'].map((slide) => (
                <button
                  key={slide}
                  onClick={() => setActiveSlide(slide)}
                  className={cn(
                    'min-w-[70px] shrink-0 rounded-xl border-2 px-2.5 py-2 text-[8px] font-black uppercase transition-all lg:min-w-[80px] lg:px-4 lg:py-2.5 lg:text-[10px]',
                    activeSlide === slide
                      ? 'bg-primary border-primary shadow-primary/25 scale-105 text-white shadow-lg'
                      : 'text-muted-foreground border-transparent bg-transparent hover:bg-black/5',
                  )}
                >
                  {slide}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-w-[80px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-all lg:w-full lg:p-4',
        active
          ? 'border-primary text-primary ring-primary/5 bg-white shadow-lg ring-4'
          : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent',
      )}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
    </button>
  );
}
