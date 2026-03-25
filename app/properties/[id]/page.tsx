"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/api";
import { useListingStatus } from "@/hooks/use-listing-status";
import type {
  PropertyContent,
  Property,
  Brief,
  SocialPost,
  Video,
} from "@/lib/types";
import {
  FileText,
  Image,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PropertyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [content, setContent] = useState<PropertyContent | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [video, setVideo] = useState<Video | null>(null);
  const [editingContent, setEditingContent] = useState<
    Partial<PropertyContent>
  >({});
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { progress, status } = useListingStatus(id);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  // Refetch when progress marks something done
  useEffect(() => {
    if (progress.brief === "done") loadBrief();
    if (progress.social === "done") loadSocial();
    if (progress.video === "done") loadVideo();
  }, [progress.brief, progress.social, progress.video]);

  async function loadAll() {
    const [prop, cont] = await Promise.all([
      propertiesApi.get(id).catch(() => null),
      contentApi.get(id).catch(() => null),
    ]);
    if (prop) setProperty(prop);
    if (cont) setContent(cont);
    await Promise.all([loadBrief(), loadSocial(), loadVideo()]);
  }

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

  const saveContent = async () => {
    if (!Object.keys(editingContent).length) return;
    setSaving(true);
    try {
      const updated = await contentApi.update(id, editingContent);
      setContent(updated);
      setEditingContent({});
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const regenerateBrief = async () => {
    await saveContent();
    setRegenerating("brief");
    try {
      const b = await briefsApi.generate(id);
      setBrief(b);
    } finally {
      setRegenerating(null);
    }
  };

  const regenerateSocial = async () => {
    await saveContent();
    setRegenerating("social");
    try {
      const posts = await socialApi.generate(id);
      setSocialPosts(posts);
    } finally {
      setRegenerating(null);
    }
  };

  const regenerateVideo = async () => {
    await saveContent();
    setRegenerating("video");
    try {
      const v = await videosApi.generate(id);
      setVideo(v);
    } finally {
      setRegenerating(null);
    }
  };

  const currentContent = { ...content, ...editingContent } as PropertyContent;

  const allProcessing =
    progress.brief === "processing" ||
    progress.social === "processing" ||
    progress.video === "processing";

  const allDone =
    brief?.status === "completed" &&
    socialPosts.some((p) => p.status === "completed") &&
    video?.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
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
            {allDone && (
              <Badge className="bg-green-500 gap-1.5 text-[10px] sm:text-xs">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">¡Todo listo!</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue="brief">
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="brief" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Brief</span>
              <StatusDot status={brief?.status} />
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Redes</span>
              <StatusDot status={socialPosts[0]?.status} />
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <VideoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Video</span>
              <StatusDot status={video?.status} />
            </TabsTrigger>
          </TabsList>

          {/* ========== TAB: BRIEF ========== */}
          <TabsContent value="brief">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* PDF Preview */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base sm:text-lg">Ficha Técnica PDF</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateBrief}
                      disabled={!!regenerating}
                      className="text-xs"
                    >
                      {regenerating === "brief" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 sm:mr-1" />
                      )}
                      <span className="hidden sm:inline">Regenerar</span>
                    </Button>
                    {brief?.pdfUrl && (
                      <Button size="sm" asChild className="text-xs">
                        <a href={brief.pdfUrl} target="_blank" rel="noreferrer">
                          <Download className="h-3.5 w-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Descargar</span>
                          <span className="sm:hidden">PDF</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {brief?.status === "processing" ||
                progress.brief === "processing" ? (
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
                  <ErrorCard
                    label="Error generando PDF"
                    onRetry={regenerateBrief}
                  />
                ) : (
                  <PendingCard label="PDF en espera..." />
                )}
              </div>

              {/* Config panel */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm sm:text-base">Contenido del Brief</h3>
                <EditableField
                  label="Título Gancho"
                  value={editingContent.title ?? content?.title ?? ""}
                  onChange={(v) =>
                    setEditingContent((p) => ({ ...p, title: v }))
                  }
                  onCopy={() =>
                    copyToClipboard(currentContent.title ?? "", "title")
                  }
                  copied={copiedField === "title"}
                />
                <EditableField
                  label="Hook / Frase de Apertura"
                  value={editingContent.hook ?? content?.hook ?? ""}
                  onChange={(v) =>
                    setEditingContent((p) => ({ ...p, hook: v }))
                  }
                  onCopy={() =>
                    copyToClipboard(currentContent.hook ?? "", "hook")
                  }
                  copied={copiedField === "hook"}
                  multiline
                />
                <EditableField
                  label="Descripción"
                  value={editingContent.body ?? content?.body ?? ""}
                  onChange={(v) =>
                    setEditingContent((p) => ({ ...p, body: v }))
                  }
                  onCopy={() =>
                    copyToClipboard(currentContent.body ?? "", "body")
                  }
                  copied={copiedField === "body"}
                  multiline
                  rows={5}
                />
                {Object.keys(editingContent).length > 0 && (
                  <Button
                    onClick={saveContent}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Guardar cambios
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ========== TAB: SOCIAL ========== */}
          <TabsContent value="social">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Social preview */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base sm:text-lg">Piezas para Redes</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateSocial}
                    disabled={!!regenerating}
                    className="text-xs"
                  >
                    {regenerating === "social" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 sm:mr-1" />
                    )}
                    <span className="hidden sm:inline">Regenerar</span>
                  </Button>
                </div>

                <Tabs defaultValue="carousel">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="carousel" className="flex-1 sm:flex-none text-xs">Carousel</TabsTrigger>
                    <TabsTrigger value="single" className="flex-1 sm:flex-none text-xs">Post</TabsTrigger>
                    <TabsTrigger value="story" className="flex-1 sm:flex-none text-xs">Story</TabsTrigger>
                  </TabsList>
                  <TabsContent value="carousel">
                    {(() => {
                      const carousel = socialPosts.find(
                        (p) => p.type === "carousel",
                      );
                      if (
                        progress.social === "processing" ||
                        carousel?.status === "processing"
                      ) {
                        return <LoadingCard label="Generando imágenes..." />;
                      }
                      if (carousel?.status === "failed") {
                        return (
                          <ErrorCard
                            label="Error generando imágenes"
                            onRetry={regenerateSocial}
                          />
                        );
                      }
                      if (carousel?.generatedImages?.length) {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {carousel.generatedImages
                              .sort((a, b) => a.order - b.order)
                              .map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative aspect-square rounded-lg overflow-hidden border"
                                >
                                  <img
                                    src={img.url}
                                    alt={`Slide ${idx + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover scale-101"
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
                      const single = socialPosts.find((p) => p.type === "single");
                      if (
                        progress.social === "processing" ||
                        single?.status === "processing"
                      ) {
                        return <LoadingCard label="Generando post..." />;
                      }
                      if (single?.status === "failed") {
                        return (
                          <ErrorCard
                            label="Error generando post"
                            onRetry={regenerateSocial}
                          />
                        );
                      }
                      if (single?.generatedImages?.length) {
                        return (
                          <div className="flex justify-center">
                            <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden border shadow-sm">
                              <img
                                src={single.generatedImages[0].url}
                                alt="Single Post"
                                className="absolute inset-0 w-full h-full object-cover scale-101"
                              />
                            </div>
                          </div>
                        );
                      }
                      return <PendingCard label="Post en espera..." />;
                    })()}
                  </TabsContent>
                  <TabsContent value="story">
                    {(() => {
                      const story = socialPosts.find((p) => p.type === "story");
                      if (
                        progress.social === "processing" ||
                        story?.status === "processing"
                      ) {
                        return <LoadingCard label="Generando story..." />;
                      }
                      if (story?.status === "failed") {
                        return (
                          <ErrorCard
                            label="Error generando story"
                            onRetry={regenerateSocial}
                          />
                        );
                      }
                      if (story?.generatedImages?.length) {
                        return (
                          <div className="flex justify-center">
                            <div className="relative w-48 sm:w-56 aspect-[9/16] rounded-xl overflow-hidden border shadow-sm">
                              <img
                                src={story.generatedImages[0].url}
                                alt="Story"
                                className="absolute inset-0 w-full h-full object-cover scale-101"
                              />
                            </div>
                          </div>
                        );
                      }
                      return <PendingCard label="Story en espera..." />;
                    })()}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Copy panel */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm sm:text-base">Copy para Redes</h3>
                <EditableField
                  label="Caption"
                  value={editingContent.caption ?? content?.caption ?? ""}
                  onChange={(v) =>
                    setEditingContent((p) => ({ ...p, caption: v }))
                  }
                  onCopy={() =>
                    copyToClipboard(currentContent.caption ?? "", "caption")
                  }
                  copied={copiedField === "caption"}
                  multiline
                  rows={4}
                />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Hashtags
                  </Label>
                  <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg min-h-12 bg-muted/30">
                    {(content?.hashtags ?? []).map((h) => (
                      <Badge key={h} variant="secondary" className="text-[10px]">
                        #{h}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      copyToClipboard(
                        (content?.hashtags ?? []).map((h) => `#${h}`).join(" "),
                        "hashtags",
                      )
                    }
                  >
                    {copiedField === "hashtags" ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    Copiar hashtags
                  </Button>
                </div>
                {Object.keys(editingContent).length > 0 && (
                  <Button
                    onClick={saveContent}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Guardar cambios
                  </Button>
                )}

                <div className="pt-2 space-y-2">
                  <h4 className="text-sm font-medium">Publicar</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-2 text-xs" size="sm">
                      <ExternalLink className="h-3 w-3" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="gap-2 text-xs" size="sm">
                      <ExternalLink className="h-3 w-3" />
                      Facebook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========== TAB: VIDEO ========== */}
          <TabsContent value="video">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Video preview */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base sm:text-lg">Video Reel</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateVideo}
                      disabled={!!regenerating}
                      className="text-xs"
                    >
                      {regenerating === "video" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 sm:mr-1" />
                      )}
                      <span className="hidden sm:inline">Regenerar</span>
                    </Button>
                    {video?.videoUrl && (
                      <Button size="sm" asChild className="text-xs">
                        <a href={video.videoUrl} download>
                          <Download className="h-3.5 w-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Descargar</span>
                          <span className="sm:hidden">Video</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {(progress.video === "processing" ||
                  video?.status === "processing") && (
                  <div className="space-y-3">
                    <LoadingCard label="Renderizando video..." />
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span>Progreso</span>
                        <span>{progress.videoProgress}%</span>
                      </div>
                      <Progress value={progress.videoProgress} className="h-1" />
                    </div>
                  </div>
                )}

                {video?.status === "completed" && video.videoUrl && (
                  <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[500px] w-full max-w-sm mx-auto shadow-xl">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full"
                      poster=""
                    />
                  </div>
                )}

                {video?.status === "completed" && video.audioUrl && (
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <Label className="text-xs text-muted-foreground">
                        Audio generado
                      </Label>
                      <audio
                        controls
                        src={video.audioUrl}
                        className="w-full mt-2 h-10"
                      />
                    </CardContent>
                  </Card>
                )}

                {video?.status === "failed" && (
                  <ErrorCard
                    label="Error generando video"
                    onRetry={regenerateVideo}
                  />
                )}

                {!video && progress.video === "idle" && (
                  <PendingCard label="Video en espera..." />
                )}
              </div>

              {/* Script panel */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm sm:text-base">Guion del Video</h3>
                <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
                  {(content?.videoScript?.scenes ?? []).map((scene, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={
                            (editingContent.videoScript?.scenes ??
                              content?.videoScript?.scenes ??
                              [])[idx]?.text ?? scene.text
                          }
                          onChange={(e) => {
                            const scenes = [
                              ...(editingContent.videoScript?.scenes ??
                                content?.videoScript?.scenes ??
                                []),
                            ];
                            scenes[idx] = {
                              ...scenes[idx],
                              text: e.target.value,
                            };
                            setEditingContent((p) => ({
                              ...p,
                              videoScript: { scenes },
                            }));
                          }}
                          rows={2}
                          className="text-xs sm:text-sm resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {scene.suggestedDuration}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(editingContent).length > 0 && (
                  <Button
                    onClick={saveContent}
                    disabled={saving}
                    className="w-full text-sm"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Guardar guion
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>

  );
}

// Helper components

function StatusDot({ status }: { status?: string }) {
  if (!status || status === "draft" || status === "pending") return null;
  return (
    <span
      className={cn(
        "ml-1 w-2 h-2 rounded-full inline-block",
        status === "completed"
          ? "bg-green-500"
          : status === "processing"
            ? "bg-yellow-500 animate-pulse"
            : status === "failed"
              ? "bg-red-500"
              : "bg-gray-400",
      )}
    />
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="border rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PendingCard({ label }: { label: string }) {
  return (
    <div className="border rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/10 border-dashed">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ErrorCard({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="border border-destructive/30 rounded-xl p-8 flex flex-col items-center gap-3 bg-destructive/5">
      <p className="text-sm text-destructive">{label}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-1" /> Reintentar
      </Button>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  onCopy,
  copied,
  multiline = false,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCopy: () => void;
  copied: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <button
          onClick={onCopy}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="text-sm resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  );
}
