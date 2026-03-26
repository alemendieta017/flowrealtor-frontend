"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  briefsApi,
  socialApi,
  videosApi,
  contentApi,
  propertiesApi,
  templatesApi,
  listingsApi,
} from "@/lib/api";
import { useListingStatus } from "@/hooks/use-listing-status";
import type {
  PropertyContent,
  Property,
  Brief,
  SocialPost,
  Video,
  Template,
  PropertyImage,
} from "@/lib/types";
import { formatPrice } from "@/lib/types";
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Share2,
  ExternalLink,
  ArrowLeft,
  Bell,
  Upload,
  X,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Handlebars from "handlebars";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Core Data
  const [property, setProperty] = useState<Property | null>(null);
  const [content, setContent] = useState<PropertyContent | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [video, setVideo] = useState<Video | null>(null);

  // Status
  const { progress, status } = useListingStatus(id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Layout State
  const [mainTab, setMainTab] = useState("resultados");

  // Studio State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploadedImages, setUploadedImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);

  const [studioForm, setStudioForm] = useState({
    title: "",
    hook: "",
    body: "",
    caption: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    selectedPdfTemplateId: "",
    selectedSocialTemplateId: "",
    selectedVideoTemplateId: "",
    videoFormat: "quick",
    voiceoverEnabled: true,
    voiceGender: "female",
    editedScenes: [] as { text: string; suggestedDuration: number; imageId: string | null }[],
  });

  const [previewTab, setPreviewTab] = useState("social");
  const [activeSlide, setActiveSlide] = useState("cover");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    loadAll();
    loadTemplates();
  }, [id]);

  useEffect(() => {
    if (progress.brief === "done") loadBrief();
    if (progress.social === "done") loadSocial();
    if (progress.video === "done") loadVideo();
  }, [progress.brief, progress.social, progress.video]);

  // Sync Content to Studio Form
  useEffect(() => {
    if (content) {
      setStudioForm((f) => ({
        ...f,
        title: f.title || content.title,
        hook: f.hook || content.hook,
        body: f.body || content.body,
        caption: f.caption || content.caption,
        editedScenes: f.editedScenes.length ? f.editedScenes : content.videoScript?.scenes?.map(s => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
          imageId: null
        })) || []
      }));
    }
  }, [content]);

  async function loadAll() {
    const [prop, cont] = await Promise.all([
      propertiesApi.get(id).catch(() => null),
      contentApi.get(id).catch(() => null),
    ]);
    if (prop) {
      setProperty(prop);
      if (prop.images) setUploadedImages(prop.images);
    }
    if (cont) setContent(cont);
    await Promise.all([loadBrief(), loadSocial(), loadVideo()]);
  }

  async function loadTemplates() {
    const data = await templatesApi.getAll().catch(() => []);
    if (data.length > 0) {
      setTemplates(data);
      setStudioForm((f) => ({
        ...f,
        selectedPdfTemplateId: f.selectedPdfTemplateId || data.find((t) => t.type === "PDF")?.id || "",
        selectedSocialTemplateId: f.selectedSocialTemplateId || data.find((t) => t.type === "SOCIAL")?.id || "",
        selectedVideoTemplateId: f.selectedVideoTemplateId || data.find((t) => t.type === "VIDEO_REEL")?.id || "",
      }));
    }
  }

  // Live preview logic for Studio
  useEffect(() => {
    const currentList = templates.filter(t => t.type === (previewTab === "social" ? "SOCIAL" : previewTab === "pdf" ? "PDF" : "VIDEO_REEL"));
    const activeTemplateId = previewTab === "social" ? studioForm.selectedSocialTemplateId : previewTab === "pdf" ? studioForm.selectedPdfTemplateId : studioForm.selectedVideoTemplateId;
    const activeTemplate = currentList.find(t => t.id === activeTemplateId);

    if (!activeTemplate || activeTemplate.livePreviewType !== "html_iframe" || !property) {
      setPreviewHtml("");
      return;
    }

    let mounted = true;
    let subPath = "raw";
    if (activeTemplate.type === "SOCIAL") subPath = `raw?slide=${activeSlide}`;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/templates/${activeTemplate.id}/${subPath}`, {
      headers: { Accept: "text/plain" },
    })
      .then((r) => r.text())
      .then((rawStr) => {
        if (!mounted) return;
        try {
          const compiler = Handlebars.compile(rawStr);
          const hbData = {
            title: studioForm.title,
            hook: studioForm.hook,
            body: studioForm.body,
            caption: studioForm.caption,
            primaryColor: studioForm.primaryColor,
            secondaryColor: studioForm.secondaryColor,
            operation: property.operationType === "venta" ? "VENTA" : "ALQUILER",
            operationLabel: property.operationType === "venta" ? "EN VENTA" : "EN ALQUILER",
            price: formatPrice(Number(property.priceAmount) || 0, property.currency),
            neighborhood: property.neighborhood,
            city: property.city,
            address: property.address || property.neighborhood || property.city,
            location: `${property.neighborhood}, ${property.city}`,
            bedrooms: property.bedrooms || "0",
            bathrooms: property.bathrooms || "0",
            parking: property.parkingSpaces || "0",
            area: property.totalArea || property.builtArea || "0",
            imageUrl: uploadedImages[0]?.url,
            coverImageUrl: uploadedImages[0]?.url,
            galleryImages: uploadedImages.map((img) => img.url),
            isStory: false,
          };
          setPreviewHtml(compiler(hbData));
        } catch (e) {
          setPreviewHtml("<div>Error compiling preview</div>");
        }
      })
      .catch(() => {
        if (mounted) setPreviewHtml("<div>Error loading preview template</div>");
      });
    return () => { mounted = false };
  }, [studioForm, previewTab, activeSlide, templates, property, uploadedImages]);


  async function loadBrief() {
    const b = await briefsApi.get(id).catch(() => null);
    if (b) setBrief(b);
  }

  async function loadSocial() {
    const posts = await socialApi.getPosts(id).catch(() => []);
    setSocialPosts(posts);
  }

  async function loadVideo() {
    const v = await videosApi.get(id).catch(() => null);
    if (v) setVideo(v);
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const uploaded = await propertiesApi.uploadImages(id, files);
      setUploadedImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(uploadedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setUploadedImages(items);
  };

  const removeImage = async (imageId: string) => {
    if (!id) return;
    try {
      await propertiesApi.deleteImage(id, imageId);
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegenerateAll = async () => {
    if (!id) return;
    setRegeneratingAll(true);
    try {
      // 1. Update Content
      await contentApi.update(id, {
        title: studioForm.title,
        hook: studioForm.hook,
        body: studioForm.body,
        caption: studioForm.caption,
      });
      // 2. Request listings generation
      await listingsApi.generate({
        propertyId: id,
        briefConfig: {
          templateId: studioForm.selectedPdfTemplateId || undefined,
          colors: {
            primary: studioForm.primaryColor,
            secondary: studioForm.secondaryColor,
          },
        },
        socialConfig: {
          templateId: studioForm.selectedSocialTemplateId || undefined,
          images: uploadedImages.map((img, idx) => ({
            imageId: img.id,
            order: idx,
          })),
          colors: {
            primary: studioForm.primaryColor,
            secondary: studioForm.secondaryColor,
          },
        },
        videoConfig: {
          templateId: studioForm.selectedVideoTemplateId || undefined,
          format: studioForm.videoFormat as "quick" | "narrated",
          voiceoverEnabled: studioForm.voiceoverEnabled,
          voiceGender: studioForm.voiceGender as "male" | "female",
          sceneOrder: studioForm.editedScenes.map((s, idx) => ({
            imageId: uploadedImages[idx % uploadedImages.length]?.id || "",
            sceneText: s.text,
            duration: s.suggestedDuration,
          })),
        },
      });
      // Switch back to results and reload
      setMainTab("resultados");
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingAll(false);
    }
  };

  const allProcessing =
    progress.brief === "processing" ||
    progress.social === "processing" ||
    progress.video === "processing" ||
    regeneratingAll;

  const allDone =
    brief?.status === "completed" &&
    socialPosts.some((p) => p.status === "completed") &&
    video?.status === "completed";

  const previewSize = previewTab === "pdf" ? { w: 794, h: 1123, scale: 0.45 } : { w: 1080, h: 1080, scale: 0.32 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="overflow-hidden">
              <h1 className="text-base sm:text-lg font-bold truncate">
                {content?.title || property?.neighborhood || "Propiedad"}
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                {property?.city} —{" "}
                {property?.operationType === "venta"
                  ? "En Venta"
                  : "En Alquiler"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {allProcessing && (
              <Badge variant="outline" className="gap-1.5 text-[10px] sm:text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Generando...</span>
              </Badge>
            )}
            {allDone && !allProcessing && (
              <Badge className="bg-green-500 gap-1.5 text-[10px] sm:text-xs">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">¡Todo listo!</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
            <TabsTrigger value="resultados" className="text-xs sm:text-sm">
              Resultados Finales
            </TabsTrigger>
            <TabsTrigger value="estudio" className="text-xs sm:text-sm gap-2">
              <Sparkles className="h-4 w-4" /> Estudio Creativo
            </TabsTrigger>
          </TabsList>

          {/* ===================== RESULTADOS FINALES ===================== */}
          <TabsContent value="resultados" className="mt-0">
            <Tabs defaultValue="brief">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="brief" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Brief</span>
                  <StatusDot status={brief?.status} />
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Redes</span>
                  <StatusDot status={socialPosts[0]?.status} />
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <VideoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Video</span>
                  <StatusDot status={video?.status} />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="brief">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    {brief?.status === "processing" || progress.brief === "processing" ? (
                      <LoadingCard label="Generando PDF..." />
                    ) : brief?.status === "completed" && brief.pdfUrl ? (
                      <div className="border rounded-xl overflow-hidden bg-muted/30 aspect-[0.7] w-full">
                        <iframe
                          src={brief.pdfUrl}
                          className="w-full h-full overflow-hidden border-none"
                          scrolling="no"
                          title="PDF Preview"
                        />
                      </div>
                    ) : brief?.status === "failed" ? (
                      <ErrorCard label="Error generando PDF" />
                    ) : (
                      <PendingCard label="PDF en espera..." />
                    )}
                  </div>
                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Acciones PDF</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {brief?.pdfUrl && (
                          <Button className="w-full gap-2" asChild>
                            <a href={brief.pdfUrl} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4" /> Descargar PDF
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" className="w-full gap-2" onClick={() => setMainTab("estudio")}>
                          <Sparkles className="h-4 w-4" /> Editar y Regenerar
                        </Button>
                      </CardContent>
                    </Card>
                    <div className="space-y-1.5 p-4 border rounded-xl bg-card">
                      <Label className="text-sm font-semibold">Enlace Público</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={brief?.pdfUrl || ""} className="h-8 text-xs bg-muted" />
                        <Button size="icon" variant="secondary" className="h-8 w-8 shrink-0" onClick={() => brief?.pdfUrl && copyToClipboard(brief.pdfUrl, "link")}>
                          {copiedField === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <Tabs defaultValue="carousel">
                      <TabsList className="w-full sm:w-auto mb-4">
                        <TabsTrigger value="carousel" className="flex-1 sm:flex-none text-xs">Carousel</TabsTrigger>
                        <TabsTrigger value="single" className="flex-1 sm:flex-none text-xs">Post</TabsTrigger>
                        <TabsTrigger value="story" className="flex-1 sm:flex-none text-xs">Story</TabsTrigger>
                      </TabsList>
                      <TabsContent value="carousel">
                        {(() => {
                          const carousel = socialPosts.find((p) => p.type === "carousel");
                          if (progress.social === "processing" || carousel?.status === "processing") return <LoadingCard label="Generando imágenes..." />;
                          if (carousel?.status === "failed") return <ErrorCard label="Error generando imágenes" />;
                          if (carousel?.generatedImages?.length) {
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {carousel.generatedImages.sort((a, b) => a.order - b.order).map((img, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                    <img src={img.url} alt={`Slide ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return <PendingCard label="Carousel en espera..." />;
                        })()}
                      </TabsContent>
                      <TabsContent value="single">
                         {(() => {
                          const single = socialPosts.find((p) => p.type === "single");
                          if (progress.social === "processing" || single?.status === "processing") return <LoadingCard label="Generando post..." />;
                          if (single?.generatedImages?.length) return (
                            <div className="flex justify-center"><div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden border"><img src={single.generatedImages[0].url} className="absolute inset-0 w-full h-full object-cover" /></div></div>
                          );
                          return <PendingCard label="Post en espera..." />;
                        })()}
                      </TabsContent>
                      <TabsContent value="story">
                        {(() => {
                          const story = socialPosts.find((p) => p.type === "story");
                          if (progress.social === "processing" || story?.status === "processing") return <LoadingCard label="Generando story..." />;
                          if (story?.generatedImages?.length) return (
                            <div className="flex justify-center"><div className="relative w-48 sm:w-56 aspect-[9/16] rounded-xl overflow-hidden border"><img src={story.generatedImages[0].url} className="absolute inset-0 w-full h-full object-cover" /></div></div>
                          );
                          return <PendingCard label="Story en espera..." />;
                        })()}
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Publicar</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                         <Button className="w-full gap-2">
                           <Download className="h-4 w-4" /> Descargar Todo
                         </Button>
                         <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" className="gap-2 text-xs" size="sm">
                            <ExternalLink className="h-3 w-3" /> IG
                          </Button>
                          <Button variant="outline" className="gap-2 text-xs" size="sm">
                            <ExternalLink className="h-3 w-3" /> FB
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2 p-4 border rounded-xl bg-card">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold">Caption</Label>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => copyToClipboard(content?.caption || "", "caption")}>
                          {copiedField === "caption" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">{content?.caption}</p>
                      
                      <div className="pt-2">
                        <Button variant="link" className="w-full text-xs text-primary" onClick={() => setMainTab("estudio")}>
                           <Sparkles className="h-3 w-3 mr-1" /> Modificar en el Estudio
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    {(progress.video === "processing" || video?.status === "processing") && (
                      <div className="space-y-3">
                        <LoadingCard label="Renderizando video..." />
                        <Progress value={progress.videoProgress} className="h-1" />
                      </div>
                    )}
                    {video?.status === "completed" && video.videoUrl && (
                      <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[600px] w-full max-w-sm mx-auto shadow-xl">
                        <video src={video.videoUrl} controls className="w-full h-full" />
                      </div>
                    )}
                    {!video && progress.video === "idle" && <PendingCard label="Video en espera..." />}
                  </div>
                  <div className="lg:col-span-1 space-y-4">
                     <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Acciones Video</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {video?.videoUrl && (
                          <Button className="w-full gap-2" asChild>
                            <a href={video.videoUrl} download>
                              <Download className="h-4 w-4" /> Descargar MP4
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" className="w-full gap-2" onClick={() => setMainTab("estudio")}>
                          <Sparkles className="h-4 w-4" /> Editar y Regenerar
                        </Button>
                      </CardContent>
                    </Card>
                    {video?.audioUrl && (
                      <div className="space-y-2 p-4 border rounded-xl bg-card">
                        <Label className="text-xs font-semibold">Audio generado</Label>
                        <audio controls src={video.audioUrl} className="w-full h-8" />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ===================== ESTUDIO CREATIVO ===================== */}
          <TabsContent value="estudio" className="mt-0 space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-250px)] lg:min-h-[600px] animate-in fade-in duration-500 w-full">
              <div className="w-full lg:w-[450px] flex flex-col gap-6 lg:overflow-y-auto pr-2 custom-scrollbar shrink-0 text-left">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight uppercase">
                    Estudio Creativo
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Personaliza el diseño y los textos finales.
                  </p>
                </div>

                <Accordion type="single" collapsible defaultValue="gallery" className="w-full space-y-3">
                  
                  {/* GALLERY SECTION */}
                  <AccordionItem value="gallery" className="border rounded-xl bg-card px-4">
                    <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      1. Galería de Medios
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-4">
                        <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                           <Upload className="h-6 w-6 text-primary mb-2" />
                           <span className="text-sm font-medium">Subir nuevas fotos</span>
                           <input type="file" multiple accept="image/*" className="hidden" onChange={handleUploadImage} disabled={uploading} />
                        </label>
                        {uploading && <div className="text-xs text-center text-primary animate-pulse">Subiendo...</div>}
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="gallery" direction="vertical">
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-3 gap-2">
                                {uploadedImages.map((img, index) => (
                                  <Draggable key={img.id} draggableId={img.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn("relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted", snapshot.isDragging ? "border-primary scale-105 z-10" : "border-transparent")}
                                      >
                                        <img src={img.url} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <GripVertical className="text-white h-6 w-6" />
                                        </div>
                                        {index === 0 && <Badge className="absolute bottom-1 left-1 text-[8px] px-1 py-0 bg-primary">Portada</Badge>}
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                          className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* DESIGN SECTION */}
                  <AccordionItem value="design" className="border rounded-xl bg-card px-4">
                     <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      2. Diseño Visual
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase">Color Primario</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-10 h-10 p-1 rounded-lg cursor-pointer" value={studioForm.primaryColor} onChange={(e) => setStudioForm(f => ({...f, primaryColor: e.target.value}))} />
                            <Input className="h-10 text-xs font-mono uppercase bg-background" value={studioForm.primaryColor} onChange={(e) => setStudioForm(f => ({...f, primaryColor: e.target.value}))} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase">Color Secundario</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-10 h-10 p-1 rounded-lg cursor-pointer" value={studioForm.secondaryColor} onChange={(e) => setStudioForm(f => ({...f, secondaryColor: e.target.value}))} />
                            <Input className="h-10 text-xs font-mono uppercase bg-background" value={studioForm.secondaryColor} onChange={(e) => setStudioForm(f => ({...f, secondaryColor: e.target.value}))} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <Label className="text-xs font-bold">Plantilla PDF</Label>
                        <Select value={studioForm.selectedPdfTemplateId} onValueChange={(v) => setStudioForm(f => ({...f, selectedPdfTemplateId: v}))}>
                          <SelectTrigger className="text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {templates.filter(t => t.type === "PDF").map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold">Plantilla Redes Sociales</Label>
                        <Select value={studioForm.selectedSocialTemplateId} onValueChange={(v) => setStudioForm(f => ({...f, selectedSocialTemplateId: v}))}>
                          <SelectTrigger className="text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {templates.filter(t => t.type === "SOCIAL").map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold">Plantilla Video</Label>
                        <Select value={studioForm.selectedVideoTemplateId} onValueChange={(v) => setStudioForm(f => ({...f, selectedVideoTemplateId: v}))}>
                          <SelectTrigger className="text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {templates.filter(t => t.type === "VIDEO_REEL").map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* CONTENT SECTION */}
                  <AccordionItem value="content" className="border rounded-xl bg-card px-4">
                     <AccordionTrigger className="hover:no-underline text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      3. Textos Publicitarios
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase">Título</Label>
                        <Input className="text-xs bg-background" value={studioForm.title} onChange={(e) => setStudioForm(f => ({...f, title: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase">Hook (Gancho)</Label>
                        <Textarea className="text-xs resize-none bg-background" rows={2} value={studioForm.hook} onChange={(e) => setStudioForm(f => ({...f, hook: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase">Cuerpo de la Publicación</Label>
                        <Textarea className="text-xs resize-none bg-background" rows={4} value={studioForm.body} onChange={(e) => setStudioForm(f => ({...f, body: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase">Caption (Redes)</Label>
                        <Textarea className="text-xs resize-none bg-background" rows={4} value={studioForm.caption} onChange={(e) => setStudioForm(f => ({...f, caption: e.target.value}))} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

                <div className="mt-4 pb-12 lg:pb-0">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg text-sm gap-2"
                    onClick={handleRegenerateAll}
                    disabled={regeneratingAll}
                  >
                    {regeneratingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Guardar y Regenerar Todo
                  </Button>
                </div>
              </div>

              {/* LIVE PREVIEW PANE */}
              <div className="flex-1 bg-[#ebeef2] rounded-3xl border-4 border-white flex flex-col items-center justify-between overflow-hidden relative shadow-inner p-4 pb-0 min-h-[500px]">
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xl z-20 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  Vista Previa
                </div>

                <div className="w-full flex justify-center mb-4 z-10 relative mt-2">
                  <Tabs value={previewTab} onValueChange={setPreviewTab} className="bg-white/80 backdrop-blur-md p-1 rounded-lg shadow-sm border inline-flex">
                    <TabsList className="h-8">
                      <TabsTrigger value="social" className="text-[10px] px-3 font-bold uppercase">Redes</TabsTrigger>
                      <TabsTrigger value="pdf" className="text-[10px] px-3 font-bold uppercase">PDF</TabsTrigger>
                      <TabsTrigger value="video" className="text-[10px] px-3 font-bold uppercase">Video</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="w-full flex-1 flex items-center justify-center relative pb-6 z-10">
                  {previewTab === "video" ? (
                     <div className="text-xs text-muted-foreground bg-white/50 px-6 py-2 rounded-full font-bold tracking-wider">
                       El video requiere ser regenerado para previsualizar
                     </div>
                  ) : previewHtml ? (
                    <div
                      className="relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] bg-white overflow-hidden rounded-sm"
                      style={{
                        width: `${previewSize.w * previewSize.scale}px`,
                        height: `${previewSize.h * previewSize.scale}px`,
                      }}
                    >
                      <iframe
                        sandbox="allow-same-origin allow-scripts"
                        srcDoc={previewHtml}
                        scrolling="no"
                        className="absolute top-0 left-0 border-none pointer-events-none overflow-hidden"
                        style={{
                          width: `${previewSize.w}px`,
                          height: `${previewSize.h}px`,
                          transform: `scale(${previewSize.scale})`,
                          transformOrigin: "top left",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground bg-white/50 px-6 py-2 rounded-full font-bold tracking-wider">
                      Cargando vista previa...
                    </div>
                  )}
                </div>

                {previewTab === "social" && (
                  <div className="w-full h-20 bg-white border-t rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-3 flex gap-2 overflow-x-auto custom-scrollbar justify-center relative z-20">
                    {["cover", "features", "amenities", "photo", "contact"].map((slide) => (
                      <button
                        key={slide}
                        onClick={() => setActiveSlide(slide)}
                        className={cn("px-4 rounded-lg text-[10px] font-bold uppercase transition-all", activeSlide === slide ? "bg-primary/10 text-primary border-primary border" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted")}
                      >
                        {slide}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helpers
function StatusDot({ status }: { status?: string }) {
  if (!status || status === "draft" || status === "pending") return null;
  return (
    <span
      className={cn(
        "ml-1 w-2 h-2 rounded-full inline-block",
        status === "completed" ? "bg-green-500" : status === "processing" ? "bg-yellow-500 animate-pulse" : status === "failed" ? "bg-red-500" : "bg-gray-400"
      )}
    />
  );
}
function LoadingCard({ label }: { label: string }) {
  return (
    <div className="border rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
function PendingCard({ label }: { label: string }) {
  return (
    <div className="border rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/10 border-dashed">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
function ErrorCard({ label }: { label: string }) {
  return (
    <div className="border border-destructive/30 rounded-xl p-8 flex flex-col items-center gap-3 bg-destructive/5">
      <p className="text-sm text-destructive font-medium">{label}</p>
    </div>
  );
}
