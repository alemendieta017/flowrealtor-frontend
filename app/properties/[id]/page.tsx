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
      <div className="border-b bg-card px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">
                {content?.title || property?.neighborhood || "Propiedad"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {property?.city} —{" "}
                {property?.operationType === "venta"
                  ? "En Venta"
                  : "En Alquiler"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allProcessing && (
              <Badge variant="outline" className="gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generando...
              </Badge>
            )}
            {allDone && (
              <Badge className="bg-green-500 gap-1.5">
                <Check className="h-3 w-3" />
                ¡Todo listo!
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <Tabs defaultValue="brief">
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="brief" className="gap-2">
              <FileText className="h-4 w-4" />
              Brief PDF
              <StatusDot status={brief?.status} />
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Image className="h-4 w-4" />
              Redes Sociales
              <StatusDot status={socialPosts[0]?.status} />
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <VideoIcon className="h-4 w-4" />
              Video / Reel
              <StatusDot status={video?.status} />
            </TabsTrigger>
          </TabsList>

          {/* ========== TAB: BRIEF ========== */}
          <TabsContent value="brief">
            <div className="grid grid-cols-5 gap-6">
              {/* PDF Preview */}
              <div className="col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Ficha Técnica PDF</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateBrief}
                      disabled={!!regenerating}
                    >
                      {regenerating === "brief" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Regenerar
                    </Button>
                    {brief?.pdfUrl && (
                      <Button size="sm" asChild>
                        <a href={brief.pdfUrl} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {brief?.status === "processing" ||
                progress.brief === "processing" ? (
                  <LoadingCard label="Generando PDF..." />
                ) : brief?.status === "completed" && brief.pdfUrl ? (
                  <div className="border rounded-xl overflow-hidden bg-muted/30 aspect-[0.7]">
                    <iframe
                      src={brief.pdfUrl}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                ) : brief?.status === "failed" ? (
                  <ErrorCard
                    label="Error generando PDF"
                    onRetry={regenerateBrief}
                  />
                ) : (
                  <PendingCard label="PDF en espera de generación..." />
                )}
              </div>

              {/* Config panel */}
              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold">Contenido del Brief</h3>
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
            <div className="grid grid-cols-5 gap-6">
              {/* Social preview */}
              <div className="col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Piezas para Redes</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateSocial}
                    disabled={!!regenerating}
                  >
                    {regenerating === "social" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Regenerar
                  </Button>
                </div>

                <Tabs defaultValue="carousel">
                  <TabsList>
                    <TabsTrigger value="carousel">Carousel (1:1)</TabsTrigger>
                    <TabsTrigger value="single">Single (1:1)</TabsTrigger>
                    <TabsTrigger value="story">Story (9:16)</TabsTrigger>
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
                          <div className="grid grid-cols-3 gap-2">
                            {carousel.generatedImages
                              .sort((a, b) => a.order - b.order)
                              .map((img, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square rounded-lg overflow-hidden"
                                >
                                  <img
                                    src={img.url}
                                    alt={`Slide ${idx + 1}`}
                                    className="w-full h-full object-cover"
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
                            <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden">
                              <img
                                src={single.generatedImages[0].url}
                                alt="Single Post"
                                className="w-full h-full object-cover"
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
                            <div className="w-48 aspect-9/16 rounded-xl overflow-hidden">
                              <img
                                src={story.generatedImages[0].url}
                                alt="Story"
                                className="w-full h-full object-cover"
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
              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold">Copy para Redes</h3>
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
                  <Label className="text-sm text-muted-foreground">
                    Hashtags
                  </Label>
                  <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg min-h-12 bg-muted/30">
                    {(content?.hashtags ?? []).map((h) => (
                      <Badge key={h} variant="secondary" className="text-xs">
                        #{h}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
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
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Publicar en Instagram
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Publicar en Facebook
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========== TAB: VIDEO ========== */}
          <TabsContent value="video">
            <div className="grid grid-cols-5 gap-6">
              {/* Video preview */}
              <div className="col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Video Reel</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateVideo}
                      disabled={!!regenerating}
                    >
                      {regenerating === "video" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Regenerar
                    </Button>
                    {video?.videoUrl && (
                      <Button size="sm" asChild>
                        <a href={video.videoUrl} download>
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {(progress.video === "processing" ||
                  video?.status === "processing") && (
                  <div className="space-y-3">
                    <LoadingCard label="Renderizando video con IA..." />
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso</span>
                        <span>{progress.videoProgress}%</span>
                      </div>
                      <Progress value={progress.videoProgress} />
                    </div>
                  </div>
                )}

                {video?.status === "completed" && video.videoUrl && (
                  <div className="rounded-xl overflow-hidden bg-black aspect-9/16 max-h-[500px] mx-auto">
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
                    <CardContent className="p-4">
                      <Label className="text-sm text-muted-foreground">
                        Audio generado
                      </Label>
                      <audio
                        controls
                        src={video.audioUrl}
                        className="w-full mt-2"
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
                  <PendingCard label="Video en espera de generación..." />
                )}
              </div>

              {/* Script panel */}
              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold">Guion del Video</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(content?.videoScript?.scenes ?? []).map((scene, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-1">
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
                          className="text-sm resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
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
                    className="w-full"
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
