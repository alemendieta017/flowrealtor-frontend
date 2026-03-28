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
  Hash
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Handlebars from 'handlebars';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  initialTab = 'social'
}: CreativeStudioProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [formData, setFormData] = useState({
    briefTitle: content?.briefTitle || content?.title || '',
    briefHook: content?.briefHook || content?.hook || '',
    briefDescripcion: content?.briefDescripcion || content?.body || '',
    selectedPdfTemplateId: initialData?.selectedPdfTemplateId || templates.find(t => t.type === 'PDF')?.id || '',
    socialPostTitle: content?.socialPostTitle || content?.title || '',
    socialPostCaption: content?.socialPostCaption || content?.caption || '',
    hashtags: content?.hashtags || [],
    selectedSocialTemplateId: initialData?.selectedSocialTemplateId || templates.find(t => t.type === 'SOCIAL')?.id || '',
    videoTitle: content?.videoTitle || content?.title || '',
    videoScript: content?.videoScript || { scenes: [] },
    selectedVideoTemplateId: initialData?.selectedVideoTemplateId || templates.find(t => t.type === 'VIDEO_REEL')?.id || '',
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
    setFormData(prev => ({
      ...prev,
      briefTitle: prev.briefTitle || content?.briefTitle || content?.title || '',
      briefHook: prev.briefHook || content?.briefHook || content?.hook || '',
      briefDescripcion: prev.briefDescripcion || content?.briefDescripcion || content?.body || '',
      selectedPdfTemplateId: prev.selectedPdfTemplateId || initialData?.selectedPdfTemplateId || templates.find(t => t.type === 'PDF')?.id || '',
      socialPostTitle: prev.socialPostTitle || content?.socialPostTitle || content?.title || '',
      socialPostCaption: prev.socialPostCaption || content?.socialPostCaption || content?.caption || '',
      hashtags: prev.hashtags.length ? prev.hashtags : content?.hashtags || [],
      selectedSocialTemplateId: prev.selectedSocialTemplateId || initialData?.selectedSocialTemplateId || templates.find(t => t.type === 'SOCIAL')?.id || '',
      videoTitle: prev.videoTitle || content?.videoTitle || content?.title || '',
      videoScript: prev.videoScript.scenes.length ? prev.videoScript : content?.videoScript || { scenes: [] },
      selectedVideoTemplateId: prev.selectedVideoTemplateId || initialData?.selectedVideoTemplateId || templates.find(t => t.type === 'VIDEO_REEL')?.id || '',
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const activeTemplate = useMemo(() =>
    templates.find(t => t.id === activeTemplateId),
    [templates, activeTemplateId]);

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
          if (activeSlide === 'photo') currentImageUrl = debouncedFormData.uploadedImages[3]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'features') currentImageUrl = debouncedFormData.uploadedImages[1]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'amenities') currentImageUrl = debouncedFormData.uploadedImages[2]?.url || debouncedFormData.uploadedImages[0]?.url;
          else if (activeSlide === 'contact') currentImageUrl = debouncedFormData.uploadedImages[debouncedFormData.uploadedImages.length - 1]?.url || debouncedFormData.uploadedImages[0]?.url;
        }

        const hbData = {
          title: activeTab === 'brief' ? debouncedFormData.briefTitle : activeTab === 'social' ? debouncedFormData.socialPostTitle : debouncedFormData.videoTitle,
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
        .then(r => r.text())
        .then(rawStr => {
          if (mounted) {
            templateCache.current[cacheKey] = rawStr;
            generatePreview(rawStr);
          }
        })
        .catch(() => {
          if (mounted) setIsGeneratingPreview(false);
        });
    }

    return () => { mounted = false; };
  }, [activeTemplate, debouncedFormData, activeSlide, activeTab, initialData]);

  const previewSize = useMemo(() => {
    if (activeTab === 'brief') return { w: 794, h: 1123 };
    return { w: 1080, h: 1080 };
  }, [activeTab]);

  const scale = useMemo(() => {
    if (!containerSize.w || !containerSize.h) return 0.3;
    const PADDING_BUFFER = 60;
    const availableW = containerSize.w - PADDING_BUFFER;
    const availableH = containerSize.h - PADDING_BUFFER;
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
    updateField('uploadedImages', formData.uploadedImages.filter((img: any) => img.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full animate-in fade-in duration-500 min-h-[600px]">
      <div className="flex lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 order-1">
        <TabButton active={activeTab === 'brief'} onClick={() => setActiveTab('brief')} icon={<FileText className="h-5 w-5" />} label="Brief PDF" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<ImageIcon className="h-5 w-5" />} label="Redes Sociales" />
        <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon className="h-5 w-5" />} label="Video Reel" />
      </div>

      <div className="w-full lg:w-[400px] flex flex-col gap-4 lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar shrink-0 order-3 lg:order-2">
        <Accordion type="multiple" defaultValue={['content', 'design']} className="space-y-3">
          <AccordionItem value="media" className="border rounded-xl bg-card px-4">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Galería de Medios</AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gallery" direction="vertical">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-3 gap-2">
                      {formData.uploadedImages.map((img: any, index: number) => (
                        <Draggable key={img.id} draggableId={img.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted",
                                snapshot.isDragging ? "border-primary scale-105 z-10" : "border-transparent"
                              )}
                            >
                              <img src={img.url} className="absolute inset-0 w-full h-full object-cover" />
                              {index === 0 && <Badge className="absolute bottom-1 left-1 text-[8px] px-1 py-0 bg-primary font-bold uppercase">Portada</Badge>}
                              <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

          <AccordionItem value="design" className="border rounded-xl bg-card px-4">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Diseño y Estilo</AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase ml-1">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 cursor-pointer rounded-lg border-2" value={formData.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} />
                    <Input className="h-10 text-[10px] font-mono uppercase bg-background" value={formData.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase ml-1">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 cursor-pointer rounded-lg border-2" value={formData.secondaryColor} onChange={(e) => updateField('secondaryColor', e.target.value)} />
                    <Input className="h-10 text-[10px] font-mono uppercase bg-background" value={formData.secondaryColor} onChange={(e) => updateField('secondaryColor', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase ml-1">Plantilla Seleccionada</Label>
                <Select
                  value={activeTab === 'brief' ? formData.selectedPdfTemplateId : activeTab === 'social' ? formData.selectedSocialTemplateId : formData.selectedVideoTemplateId}
                  onValueChange={(v) => updateField(activeTab === 'brief' ? 'selectedPdfTemplateId' : activeTab === 'social' ? 'selectedSocialTemplateId' : 'selectedVideoTemplateId', v)}
                >
                  <SelectTrigger className="text-xs bg-background h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.type === (activeTab === 'brief' ? 'PDF' : activeTab === 'social' ? 'SOCIAL' : 'VIDEO_REEL')).map(t => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content" className="border rounded-xl bg-card px-4">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground">3. Contenido Editable</AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              {activeTab === 'brief' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Título PDF</Label>
                    <Input className="text-xs bg-background h-9 rounded-lg" value={formData.briefTitle} onChange={(e) => updateField('briefTitle', e.target.value)} placeholder="Título" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Gancho / Hook</Label>
                    <Textarea className="text-xs bg-background rounded-lg resize-none" rows={2} value={formData.briefHook} onChange={(e) => updateField('briefHook', e.target.value)} placeholder="Gancho" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Descripción</Label>
                    <Textarea className="text-xs bg-background rounded-lg resize-none" rows={5} value={formData.briefDescripcion} onChange={(e) => updateField('briefDescripcion', e.target.value)} placeholder="Descripción" />
                  </div>
                </>
              )}
              {activeTab === 'social' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Título en Imagen</Label>
                    <Input className="text-xs bg-background h-9 rounded-lg" value={formData.socialPostTitle} onChange={(e) => updateField('socialPostTitle', e.target.value)} placeholder="Título" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Pie de Foto (Caption)</Label>
                    <Textarea className="text-xs bg-background rounded-lg resize-none" rows={5} value={formData.socialPostCaption} onChange={(e) => updateField('socialPostCaption', e.target.value)} placeholder="Caption" />
                  </div>
                </>
              )}
              {activeTab === 'video' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Título del Video</Label>
                    <Input
                      className="text-xs bg-background h-9 rounded-lg"
                      value={formData.videoTitle}
                      onChange={(e) => updateField('videoTitle', e.target.value)}
                      placeholder="Título del video"
                    />
                  </div>
                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] font-bold uppercase ml-1">Guion por Escenas</Label>
                    <div className="space-y-3">
                      {formData.videoScript.scenes.map((scene: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              Escena {idx + 1}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/60">
                              {scene.suggestedDuration}s
                            </span>
                          </div>
                          <Textarea
                            className="text-xs bg-background rounded-lg resize-none"
                            rows={2}
                            value={scene.text}
                            onChange={(e) => {
                              const newScenes = [...formData.videoScript.scenes];
                              newScenes[idx] = { ...newScenes[idx], text: e.target.value };
                              updateField('videoScript', { ...formData.videoScript, scenes: newScenes });
                            }}
                            placeholder={`Texto de la escena ${idx + 1}`}
                          />
                        </div>
                      ))}
                      {formData.videoScript.scenes.length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic text-center py-4">
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
          <Button size="lg" className="w-full mt-4 h-12 rounded-xl font-bold uppercase tracking-widest bg-primary shadow-lg shadow-primary/20" onClick={() => onSave(formData, activeTab)} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Guardar y Regenerar
          </Button>
        )}
      </div>

      <div className="flex-1 bg-[#ebeef2] rounded-[2.5rem] border-[6px] border-white flex flex-col overflow-hidden relative min-h-[400px] lg:min-h-[600px] shadow-2xl order-2 lg:order-3" style={{ perspective: "1000px" }}>
        {isGeneratingPreview && <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-30 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase border shadow-sm z-20 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          Live Preview: {activeTab.toUpperCase()}
        </div>

        <div
          ref={containerRef}
          className="w-full flex-1 flex items-center justify-center relative z-10 py-10 lg:py-16 px-6"
        >
          {activeTab === "video" ? (
            <div className="text-xs text-muted-foreground bg-white/50 px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-sm">El video requiere regeneración para ver cambios</div>
          ) : previewHtml ? (
            <div
              className="relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white overflow-hidden transition-transform duration-300 pointer-events-none"
              style={{
                width: `${previewSize.w}px`,
                height: `${previewSize.h}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center center !important',
                position: 'absolute'
              }}
            >
              <iframe srcDoc={previewHtml} scrolling="no" className="w-full h-full border-none rounded-lg pointer-events-none" />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-white/50 px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-sm">Cargando vista previa...</div>
          )}
        </div>

        {activeTab === "social" && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-fit max-w-[95%] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 flex gap-1 items-center overflow-x-auto">
              {["cover", "features", "amenities", "photo", "contact"].map((slide) => (
                <button
                  key={slide}
                  onClick={() => setActiveSlide(slide)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shrink-0 min-w-[80px] border-2",
                    activeSlide === slide
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                      : "bg-transparent hover:bg-black/5 text-muted-foreground border-transparent"
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

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center justify-center gap-2 p-3 lg:p-4 rounded-2xl border-2 transition-all min-w-[80px] lg:w-full", active ? "bg-white border-primary text-primary shadow-lg ring-4 ring-primary/5" : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
