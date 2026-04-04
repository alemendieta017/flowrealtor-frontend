'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreativeStudio } from '@/components/creative-studio';
import {
  briefsApi,
  socialApi,
  videosApi,
  contentApi,
  propertiesApi,
  templatesApi,
  listingsApi,
} from '@/lib/api';
import { useListingStatus } from '@/hooks/use-listing-status';
import type {
  PropertyContent,
  Property,
  Brief,
  SocialPost,
  Video,
  Template,
  PropertyImage,
} from '@/lib/types';
import { formatPrice } from '@/lib/types';
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
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Handlebars from 'handlebars';

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
  const [mainTab, setMainTab] = useState('resultados');
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Studio State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploadedImages, setUploadedImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);

  const [studioForm, setStudioForm] = useState({
    title: '',
    hook: '',
    body: '',
    caption: '',
    agentName: 'Juan Pérez',
    agentPhone: '+595 999 123456',
    agentEmail: 'juan@flowrealtor.com',
    agentCompany: 'FlowRealtor',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    selectedPdfTemplateId: '',
    selectedSocialTemplateId: '',
    selectedVideoTemplateId: '',
    videoFormat: 'quick',
    voiceoverEnabled: true,
    voiceGender: 'female',
    editedScenes: [] as {
      text: string;
      suggestedDuration: number;
      imageId: string | null;
    }[],
  });

  const [previewTab, setPreviewTab] = useState('social');
  const [activeSlide, setActiveSlide] = useState('cover');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    loadAll();
    loadTemplates();
  }, [id]);

  useEffect(() => {
    if (progress.brief === 'done') loadBrief();
    if (progress.social === 'done') loadSocial();
    if (progress.video === 'done') loadVideo();
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
        editedScenes: f.editedScenes.length
          ? f.editedScenes
          : content.videoScript?.scenes?.map((s) => ({
              text: s.text,
              suggestedDuration: s.suggestedDuration,
              imageId: null,
            })) || [],
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
        selectedPdfTemplateId:
          f.selectedPdfTemplateId || data.find((t) => t.type === 'PDF')?.id || '',
        selectedSocialTemplateId:
          f.selectedSocialTemplateId || data.find((t) => t.type === 'SOCIAL')?.id || '',
        selectedVideoTemplateId:
          f.selectedVideoTemplateId || data.find((t) => t.type === 'VIDEO_REEL')?.id || '',
      }));
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show header if scrolling up OR close to top
      if (currentScrollY <= 80) {
        setShowHeader(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        // Scrolling down and past threshold
        setShowHeader(false);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live preview logic for Studio
  useEffect(() => {
    const currentList = templates.filter(
      (t) =>
        t.type ===
        (previewTab === 'social' ? 'SOCIAL' : previewTab === 'pdf' ? 'PDF' : 'VIDEO_REEL'),
    );
    const activeTemplateId =
      previewTab === 'social'
        ? studioForm.selectedSocialTemplateId
        : previewTab === 'pdf'
          ? studioForm.selectedPdfTemplateId
          : studioForm.selectedVideoTemplateId;
    const activeTemplate = currentList.find((t) => t.id === activeTemplateId);

    if (!activeTemplate || activeTemplate.livePreviewType !== 'html_iframe' || !property) {
      setPreviewHtml('');
      return;
    }

    let mounted = true;
    let subPath = 'raw';
    if (activeTemplate.type === 'SOCIAL') subPath = `raw?slide=${activeSlide}`;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/templates/${activeTemplate.id}/${subPath}`,
      {
        headers: { Accept: 'text/plain' },
      },
    )
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
            operation: property.operationType === 'venta' ? 'VENTA' : 'ALQUILER',
            operationLabel: property.operationType === 'venta' ? 'EN VENTA' : 'EN ALQUILER',
            price: formatPrice(Number(property.priceAmount) || 0, property.currency),
            neighborhood: property.neighborhood,
            city: property.city,
            address: property.address || property.neighborhood || property.city,
            location: `${property.neighborhood}, ${property.city}`,
            bedrooms: property.bedrooms || '0',
            bathrooms: property.bathrooms || '0',
            parking: property.parkingSpaces || '0',
            area: property.totalArea || property.builtArea || '0',
            imageUrl: uploadedImages[0]?.url,
            coverImageUrl: uploadedImages[0]?.url,
            galleryImages: uploadedImages.map((img) => img.url),
            isStory: false,
          };
          setPreviewHtml(compiler(hbData));
        } catch (e) {
          setPreviewHtml('<div>Error compiling preview</div>');
        }
      })
      .catch(() => {
        if (mounted) setPreviewHtml('<div>Error loading preview template</div>');
      });
    return () => {
      mounted = false;
    };
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
      e.target.value = '';
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

  const [studioActiveTab, setStudioActiveTab] = useState<'brief' | 'social' | 'video'>('social');

  const handleSaveProduct = async (studioData: any, productType?: string) => {
    if (!id) return;
    setRegeneratingAll(true);
    try {
      // 1. Update Content (Granular)
      await contentApi.update(id, {
        briefTitle: studioData.briefTitle,
        briefHook: studioData.briefHook,
        briefDescripcion: studioData.briefDescripcion,
        socialPostTitle: studioData.socialPostTitle,
        socialPostCaption: studioData.socialPostCaption,
        hashtags: studioData.hashtags,
        videoTitle: studioData.videoTitle,
        videoScript: studioData.videoScript,
      });

      // 2. Request generation for specific product or all
      const briefConfig = {
        templateId: studioData.selectedPdfTemplateId || undefined,
        colors: {
          primary: studioData.primaryColor,
          secondary: studioData.secondaryColor,
        },
      };

      const socialConfig = {
        templateId: studioData.selectedSocialTemplateId || undefined,
        images: studioData.uploadedImages.map((img: any, idx: number) => ({
          imageId: img.id,
          order: idx,
        })),
        colors: {
          primary: studioData.primaryColor,
          secondary: studioData.secondaryColor,
        },
      };

      const videoConfig = {
        templateId: studioData.selectedVideoTemplateId || undefined,
        format: studioForm.videoFormat as 'quick' | 'narrated',
        voiceoverEnabled: studioForm.voiceoverEnabled,
        voiceGender: studioForm.voiceGender as 'male' | 'female',
        sceneOrder: studioData.videoScript.scenes.map((s: any, idx: number) => ({
          imageId: studioData.uploadedImages[idx % studioData.uploadedImages.length]?.id || '',
          sceneText: s.text,
          duration: s.suggestedDuration,
        })),
      };

      if (!productType || productType === 'brief') {
        await listingsApi.generate({ propertyId: id, briefConfig });
      }
      if (!productType || productType === 'social') {
        await listingsApi.generate({ propertyId: id, socialConfig });
      }
      if (!productType || productType === 'video') {
        await listingsApi.generate({ propertyId: id, videoConfig });
      }

      setMainTab('resultados');
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingAll(false);
    }
  };

  const openStudio = (tab: 'brief' | 'social' | 'video') => {
    setStudioActiveTab(tab);
    setMainTab('estudio');
  };

  const allProcessing =
    progress.brief === 'processing' ||
    progress.social === 'processing' ||
    progress.video === 'processing' ||
    regeneratingAll;

  const allDone =
    brief?.status === 'completed' &&
    socialPosts.some((p) => p.status === 'completed') &&
    video?.status === 'completed';

  const previewSize =
    previewTab === 'pdf' ? { w: 794, h: 1123, scale: 0.45 } : { w: 1080, h: 1080, scale: 0.32 };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div
        className={cn(
          'bg-card/95 supports-backdrop-filter:bg-card/80 sticky top-0 z-30 transform border-b px-4 py-4 backdrop-blur-md transition-all duration-300 ease-in-out sm:px-6',
          showHeader
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0',
        )}
      >
        <div className={cn("mx-auto flex flex-col justify-between gap-4 sm:flex-row sm:items-center transition-all duration-300", mainTab === 'estudio' ? "max-w-7xl" : "max-w-6xl")}>
          <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="overflow-hidden">
              <h1 className="truncate text-base font-bold sm:text-lg">
                {content?.title || property?.neighborhood || 'Propiedad'}
              </h1>
              <p className="text-muted-foreground truncate text-[10px] sm:text-sm">
                {property?.city} —{' '}
                {property?.operationType === 'venta' ? 'En Venta' : 'En Alquiler'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {allProcessing && (
              <Badge variant="outline" className="gap-1.5 text-[10px] sm:text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Generando...</span>
              </Badge>
            )}
            {allDone && !allProcessing && (
              <Badge className="gap-1.5 bg-green-500 text-[10px] sm:text-xs">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">¡Todo listo!</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className={cn("mx-auto px-4 py-6 sm:px-6 transition-all duration-300", mainTab === 'estudio' ? "max-w-7xl" : "max-w-6xl")}>
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="resultados" className="text-xs sm:text-sm">
              Resultados Finales
            </TabsTrigger>
            <TabsTrigger value="estudio" className="gap-2 text-xs sm:text-sm">
              <Palette className="h-4 w-4" /> Estudio Creativo
            </TabsTrigger>
          </TabsList>

          {/* ===================== RESULTADOS FINALES ===================== */}
          <TabsContent value="resultados" className="mt-0">
            <Tabs defaultValue="brief">
              <TabsList className="mb-6 flex w-full">
                <TabsTrigger value="brief" className="gap-1 text-xs sm:gap-2 sm:text-sm">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Brief</span>
                  <StatusDot status={brief?.status} />
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-1 text-xs sm:gap-2 sm:text-sm">
                  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Redes</span>
                  <StatusDot status={socialPosts[0]?.status} />
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-1 text-xs sm:gap-2 sm:text-sm">
                  <VideoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">Video</span>
                  <StatusDot status={video?.status} />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="brief">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
                  <div className="lg:col-span-4">
                    {brief?.status === 'processing' || progress.brief === 'processing' ? (
                      <LoadingCard label="Generando PDF..." />
                    ) : brief?.status === 'completed' && brief.pdfUrl ? (
                      <div className="rosunded-xl bg-muted/30 aspect-[0.7] w-full overflow-hidden border">
                        <iframe
                          src={brief.pdfUrl}
                          className="h-full w-full overflow-hidden border-none"
                          scrolling="no"
                          title="PDF Preview"
                        />
                      </div>
                    ) : brief?.status === 'failed' ? (
                      <ErrorCard label="Error generando PDF" />
                    ) : (
                      <PendingCard label="PDF en espera..." />
                    )}
                  </div>
                  <div className="space-y-4 lg:col-span-2">
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
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => openStudio('brief')}
                        >
                          <Palette className="h-4 w-4" /> Editar y Regenerar
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div className="lg:col-span-3">
                    <Tabs defaultValue="carousel">
                      <TabsList className="mb-4 w-full sm:w-auto">
                        <TabsTrigger value="carousel" className="flex-1 text-xs sm:flex-none">
                          Carousel
                        </TabsTrigger>
                        <TabsTrigger value="single" className="flex-1 text-xs sm:flex-none">
                          Post
                        </TabsTrigger>
                        <TabsTrigger value="story" className="flex-1 text-xs sm:flex-none">
                          Story
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="carousel">
                        {(() => {
                          const carousel = socialPosts.find((p) => p.type === 'carousel');
                          if (progress.social === 'processing' || carousel?.status === 'processing')
                            return <LoadingCard label="Generando imágenes..." />;
                          if (carousel?.status === 'failed')
                            return <ErrorCard label="Error generando imágenes" />;
                          if (carousel?.generatedImages?.length) {
                            return (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {carousel.generatedImages
                                  .sort((a, b) => a.order - b.order)
                                  .map((img, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-muted relative aspect-square overflow-hidden rounded-lg border"
                                    >
                                      <img
                                        src={img.url}
                                        alt={`Slide ${idx + 1}`}
                                        className="absolute inset-0 h-full w-full object-cover"
                                      />
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
                          const single = socialPosts.find((p) => p.type === 'single');
                          if (progress.social === 'processing' || single?.status === 'processing')
                            return <LoadingCard label="Generando post..." />;
                          if (single?.generatedImages?.length)
                            return (
                              <div className="flex justify-center">
                                <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl border">
                                  <img
                                    src={single.generatedImages[0].url}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                </div>
                              </div>
                            );
                          return <PendingCard label="Post en espera..." />;
                        })()}
                      </TabsContent>
                      <TabsContent value="story">
                        {(() => {
                          const story = socialPosts.find((p) => p.type === 'story');
                          if (progress.social === 'processing' || story?.status === 'processing')
                            return <LoadingCard label="Generando story..." />;
                          if (story?.generatedImages?.length)
                            return (
                              <div className="flex justify-center">
                                <div className="relative aspect-9/16 w-48 overflow-hidden rounded-xl border sm:w-56">
                                  <img
                                    src={story.generatedImages[0].url}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                </div>
                              </div>
                            );
                          return <PendingCard label="Story en espera..." />;
                        })()}
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="space-y-4 lg:col-span-1">
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
                    <div className="bg-card space-y-2 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Caption</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyToClipboard(content?.caption || '', 'caption')}
                        >
                          {copiedField === 'caption' ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <Copy className="mr-1 h-3 w-3" />
                          )}{' '}
                          Copiar
                        </Button>
                      </div>
                      <p className="text-muted-foreground line-clamp-6 text-xs whitespace-pre-wrap">
                        {content?.caption}
                      </p>

                      <div className="pt-2">
                        <Button
                          variant="link"
                          className="text-primary w-full text-xs"
                          onClick={() => openStudio('social')}
                        >
                          <Sparkles className="mr-1 h-3 w-3" /> Modificar en el Estudio
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
                  <div className="lg:col-span-4">
                    {(progress.video === 'processing' || video?.status === 'processing') && (
                      <div className="space-y-3">
                        <LoadingCard label="Renderizando video..." />
                        <Progress value={progress.videoProgress} className="h-1" />
                      </div>
                    )}
                    {video?.status === 'completed' && video.videoUrl && (
                      <div className="mx-auto aspect-9/16 max-h-[600px] w-full max-w-sm overflow-hidden rounded-xl bg-black shadow-xl">
                        <video src={video.videoUrl} controls className="h-full w-full" />
                      </div>
                    )}
                    {!video && progress.video === 'idle' && (
                      <PendingCard label="Video en espera..." />
                    )}
                  </div>
                  <div className="space-y-4 lg:col-span-2">
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
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => openStudio('video')}
                        >
                          <Palette className="h-4 w-4" /> Editar y Regenerar
                        </Button>
                      </CardContent>
                    </Card>
                    {video?.audioUrl && (
                      <div className="bg-card space-y-2 rounded-xl border p-4">
                        <Label className="text-xs font-semibold">Audio generado</Label>
                        <audio controls src={video.audioUrl} className="h-8 w-full" />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ===================== ESTUDIO CREATIVO ===================== */}
          <TabsContent value="estudio" className="mt-0 space-y-6">
            <CreativeStudio
              propertyId={id as string}
              initialData={{
                ...studioForm,
                uploadedImages,
                operationType: property?.operationType,
                priceFormatted: formatPrice(
                  Number(property?.priceAmount) || 0,
                  property?.currency || 'USD',
                ),
                neighborhood: property?.neighborhood,
                city: property?.city,
                bedrooms: property?.bedrooms,
                bathrooms: property?.bathrooms,
                parkingSpaces: property?.parkingSpaces,
                totalArea: property?.totalArea,
                amenities: property?.amenities,
              }}
              content={content}
              templates={templates}
              onSave={handleSaveProduct}
              isGenerating={regeneratingAll}
              mode="edit"
              initialTab={studioActiveTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helpers
function StatusDot({ status }: { status?: string }) {
  if (!status || status === 'draft' || status === 'pending') return null;
  return (
    <span
      className={cn(
        'ml-1 inline-block h-2 w-2 rounded-full',
        status === 'completed'
          ? 'bg-green-500'
          : status === 'processing'
            ? 'animate-pulse bg-yellow-500'
            : status === 'failed'
              ? 'bg-red-500'
              : 'bg-gray-400',
      )}
    />
  );
}
function LoadingCard({ label }: { label: string }) {
  return (
    <div className="bg-muted/20 flex flex-col items-center gap-3 rounded-xl border p-8">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
}
function PendingCard({ label }: { label: string }) {
  return (
    <div className="bg-muted/10 flex flex-col items-center gap-3 rounded-xl border border-dashed p-8">
      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
        <Loader2 className="text-muted-foreground h-4 w-4" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
}
function ErrorCard({ label }: { label: string }) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center gap-3 rounded-xl border p-8">
      <p className="text-destructive text-sm font-medium">{label}</p>
    </div>
  );
}
