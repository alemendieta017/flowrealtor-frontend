'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    primaryColor: initialData?.primaryColor || '#1e40af',
    secondaryColor: initialData?.secondaryColor || '#f59e0b',
    uploadedImages: initialData?.uploadedImages || [],
  });

  const [activeSlide, setActiveSlide] = useState('cover');
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (mode === 'create') {
        onSave(newData);
      }
      return newData;
    });
  };

  const activeTemplateId = useMemo(() => {
    if (activeTab === 'brief') return formData.selectedPdfTemplateId;
    if (activeTab === 'social') return formData.selectedSocialTemplateId;
    return formData.selectedVideoTemplateId;
  }, [activeTab, formData]);

  const activeTemplate = useMemo(() => 
    templates.find(t => t.id === activeTemplateId), 
  [templates, activeTemplateId]);

  useEffect(() => {
    if (!activeTemplate || activeTemplate.livePreviewType !== 'html_iframe') {
      setPreviewHtml('');
      return;
    }

    let mounted = true;
    setIsGeneratingPreview(true);
    let subPath = activeTemplate.type === 'SOCIAL' ? `raw?slide=${activeSlide}` : 'raw';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    fetch(`${apiUrl}/api/templates/${activeTemplate.id}/${subPath}`, {
      headers: { Accept: 'text/plain' },
    })
      .then(r => r.text())
      .then(rawStr => {
        if (!mounted) return;
        try {
          const compiler = Handlebars.compile(rawStr);
          let currentImageUrl = formData.uploadedImages[0]?.url;
          if (activeTab === 'social') {
             if (activeSlide === 'photo') currentImageUrl = formData.uploadedImages[3]?.url || formData.uploadedImages[0]?.url;
             else if (activeSlide === 'features') currentImageUrl = formData.uploadedImages[1]?.url || formData.uploadedImages[0]?.url;
             else if (activeSlide === 'amenities') currentImageUrl = formData.uploadedImages[2]?.url || formData.uploadedImages[0]?.url;
             else if (activeSlide === 'contact') currentImageUrl = formData.uploadedImages[formData.uploadedImages.length - 1]?.url || formData.uploadedImages[0]?.url;
          }

          const hbData = {
            title: activeTab === 'brief' ? formData.briefTitle : activeTab === 'social' ? formData.socialPostTitle : formData.videoTitle,
            hook: formData.briefHook,
            body: formData.briefDescripcion,
            caption: formData.socialPostCaption,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
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
            coverImageUrl: formData.uploadedImages[0]?.url,
            galleryImages: formData.uploadedImages.map((img: any) => img.url),
            isStory: false,
          };
          setPreviewHtml(compiler(hbData));
        } catch (e) {
          console.error('Handlebars error:', e);
        } finally {
          if (mounted) setIsGeneratingPreview(false);
        }
      })
      .catch(() => {
        if (mounted) setIsGeneratingPreview(false);
      });

    return () => { mounted = false; };
  }, [activeTemplate, formData, activeSlide, activeTab, initialData]);

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
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in duration-500 min-h-[600px]">
      <div className="flex lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        <TabButton active={activeTab === 'brief'} onClick={() => setActiveTab('brief')} icon={<FileText className="h-5 w-5" />} label="Brief PDF" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<ImageIcon className="h-5 w-5" />} label="Redes Sociales" />
        <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon className="h-5 w-5" />} label="Video Reel" />
      </div>

      <div className="w-full lg:w-[400px] flex flex-col gap-4 lg:overflow-y-auto pr-2 custom-scrollbar shrink-0">
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

      <div className="flex-1 bg-[#ebeef2] rounded-3xl border-4 border-white flex flex-col items-center justify-center overflow-hidden relative p-4 min-h-[500px] shadow-inner" style={{ perspective: "1000px" }}>
        {isGeneratingPreview && <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-30 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase border shadow-sm z-20 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          Live Preview: {activeTab.toUpperCase()}
        </div>

        <div 
          ref={containerRef}
          className="w-full flex-1 flex items-center justify-center relative z-10 py-12 px-4"
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
                <iframe srcDoc={previewHtml} scrolling="no" className="w-full h-full border-none pointer-events-none" />
              </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-white/50 px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-sm">Cargando vista previa...</div>
          )}
        </div>

        {activeTab === "social" && (
          <div className="w-full h-20 bg-white border-t rounded-t-3xl p-3 flex gap-2 overflow-x-auto relative z-20 items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            {["cover", "features", "amenities", "photo", "contact"].map((slide) => (
              <button key={slide} onClick={() => setActiveSlide(slide)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 min-w-[80px] border-2", activeSlide === slide ? "bg-primary text-white border-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent")}>
                {slide}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[100px] lg:w-full", active ? "bg-white border-primary text-primary shadow-lg ring-4 ring-primary/5" : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
