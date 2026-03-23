"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Download, Share2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedContent {
  title: string;
  hook: string;
  body: string;
  caption: string;
  hashtags: string[];
  videoScript: string;
}

interface ContentPreviewProps {
  content: GeneratedContent;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onEdit?: (content: GeneratedContent) => void;
}

export function ContentPreview({
  content,
  isLoading,
  onRegenerate,
  onEdit,
}: ContentPreviewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<GeneratedContent>(content);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveEdit = () => {
    onEdit?.(editedContent);
    setEditMode(null);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Contenido Generado</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Regenerar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="copy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger
              value="copy"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Copy
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Redes Sociales
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="copy" className="space-y-4 mt-4">
            <ContentBlock
              label="Titulo Gancho"
              content={content.title}
              copiedField={copiedField}
              onCopy={() => copyToClipboard(content.title, "title")}
              fieldKey="title"
              editMode={editMode}
              setEditMode={setEditMode}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              onSave={handleSaveEdit}
            />

            <ContentBlock
              label="Frase Hook"
              content={content.hook}
              copiedField={copiedField}
              onCopy={() => copyToClipboard(content.hook, "hook")}
              fieldKey="hook"
              editMode={editMode}
              setEditMode={setEditMode}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              onSave={handleSaveEdit}
            />

            <ContentBlock
              label="Descripcion Completa"
              content={content.body}
              copiedField={copiedField}
              onCopy={() => copyToClipboard(content.body, "body")}
              fieldKey="body"
              editMode={editMode}
              setEditMode={setEditMode}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              onSave={handleSaveEdit}
              multiline
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <ContentBlock
              label="Caption para Redes"
              content={content.caption}
              copiedField={copiedField}
              onCopy={() => copyToClipboard(content.caption, "caption")}
              fieldKey="caption"
              editMode={editMode}
              setEditMode={setEditMode}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              onSave={handleSaveEdit}
              multiline
            />

            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Hashtags
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(content.hashtags.join(" "), "hashtags")
                  }
                  className="gap-2"
                >
                  {copiedField === "hashtags" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copiar todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => copyToClipboard(tag, `hashtag-${index}`)}
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90">
                <Share2 className="h-4 w-4" />
                Publicar en Instagram
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Share2 className="h-4 w-4" />
                Publicar en Facebook
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <ContentBlock
              label="Guion para Video"
              content={content.videoScript}
              copiedField={copiedField}
              onCopy={() => copyToClipboard(content.videoScript, "videoScript")}
              fieldKey="videoScript"
              editMode={editMode}
              setEditMode={setEditMode}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              onSave={handleSaveEdit}
              multiline
            />

            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4">
              <h4 className="font-medium text-foreground mb-2">
                Generar Video con Voz en Off
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                El video se generara automaticamente usando las fotos de la
                propiedad y el guion de arriba con voz sintetizada.
              </p>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Generar Video
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ContentBlockProps {
  label: string;
  content: string;
  copiedField: string | null;
  onCopy: () => void;
  fieldKey: string;
  editMode: string | null;
  setEditMode: (mode: string | null) => void;
  editedContent: GeneratedContent;
  setEditedContent: (content: GeneratedContent) => void;
  onSave: () => void;
  multiline?: boolean;
}

function ContentBlock({
  label,
  content,
  copiedField,
  onCopy,
  fieldKey,
  editMode,
  setEditMode,
  editedContent,
  setEditedContent,
  onSave,
  multiline,
}: ContentBlockProps) {
  const isEditing = editMode === fieldKey;

  return (
    <div className="rounded-lg bg-secondary/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="text-green-500"
              >
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditMode(fieldKey)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onCopy}>
                {copiedField === fieldKey ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <Textarea
          value={editedContent[fieldKey as keyof GeneratedContent] as string}
          onChange={(e) =>
            setEditedContent({ ...editedContent, [fieldKey]: e.target.value })
          }
          className="bg-background border-border min-h-24"
        />
      ) : (
        <p
          className={`text-sm text-muted-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}
        >
          {content}
        </p>
      )}
    </div>
  );
}
