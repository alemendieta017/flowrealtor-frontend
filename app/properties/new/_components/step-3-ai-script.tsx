import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyFormData } from '@/lib/schemas/property.schema';
import type { PropertyContent } from '@/lib/types';

export function Step3({
  form,
  update,
  propertyId,
  content,
  onGenerate,
  loading,
}: {
  form: PropertyFormData;
  update: (k: keyof PropertyFormData, v: any) => void;
  propertyId: string | null;
  content: PropertyContent | null;
  onGenerate: () => void;
  loading: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number | null>(null);

  if (!content) {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-8 py-12 text-center duration-500">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Creación de Contenido</h2>
          <p className="text-muted-foreground text-pretty">
            Analizaremos los datos cargados para redactar el título y el guion perfecto.
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardContent className="space-y-6 p-8 text-left">
            <div className="space-y-3">
              <Label className="text-base font-bold">Tipo de Video Deseado</Label>
              <Select value={form.videoFormat} onValueChange={(v) => update('videoFormat', v)}>
                <SelectTrigger className="bg-background h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">🚀 Reel Rápido (30s) - Para captar atención</SelectItem>
                  <SelectItem value="narrated">
                    🏡 Recorrido Detallado (60s) - Para YouTube/FB
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-xl border-2 p-4 transition-colors"
              onClick={() => update('voiceoverEnabled', !form.voiceoverEnabled)}
            >
              <Checkbox
                id="voiceover"
                className="h-5 w-5"
                checked={form.voiceoverEnabled}
                onCheckedChange={(checked) => update('voiceoverEnabled', !!checked)}
              />
              <div className="flex flex-col">
                <label className="cursor-pointer text-sm leading-tight font-bold">
                  Activar narración de voz
                </label>
                <span className="text-muted-foreground text-xs">
                  Se generará un audio profesional describiendo la casa.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuracion de escenas</h2>
          <p className="text-muted-foreground text-sm">
            Revisa los textos del video. Para editar todo el contenido, ve al Estudio Creativo.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {form.editedScenes.map((scene: any, idx: number) => {
          const selectedImage = form.uploadedImages.find((img: any) => img.id === scene.imageId);
          return (
            <Card
              key={idx}
              className="border-l-primary/30 hover:border-l-primary overflow-hidden border-l-8 transition-all"
            >
              <CardContent className="flex flex-col gap-6 px-5 py-3 sm:flex-row">
                <div className="flex-1 space-y-3 text-left">
                  <Label className="text-muted-foreground text-[10px] font-black tracking-wider uppercase">
                    Escena {idx + 1} — {scene.suggestedDuration}s
                  </Label>
                  <Textarea
                    value={scene.text}
                    onChange={(e) => {
                      const newScenes = [...form.editedScenes];
                      newScenes[idx].text = e.target.value;
                      update('editedScenes', newScenes);
                    }}
                    rows={2}
                    className="focus-visible:ring-primary bg-muted/30 resize-none rounded-lg border-none p-3 text-sm"
                  />
                </div>
                <div className="flex shrink-0 items-center">
                  <div
                    onClick={() => {
                      setActiveSceneIdx(idx);
                      setModalOpen(true);
                    }}
                    className={cn(
                      'bg-card hover:bg-muted relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed shadow-sm transition-all',
                      selectedImage ? 'border-primary border-solid' : 'hover:border-primary',
                    )}
                  >
                    {selectedImage ? (
                      <img
                        src={selectedImage.url}
                        className="absolute inset-0 h-full w-full scale-101 object-cover"
                        alt="Scene"
                      />
                    ) : (
                      <>
                        <ImageIcon className="text-muted-foreground mb-2 h-6 w-6" />
                        <span className="text-muted-foreground text-[10px] font-bold tracking-tighter uppercase">
                          Elegir Foto
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-300">
          <Card className="bg-background w-full max-w-3xl border-none shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-5">
              <CardTitle className="text-xl font-bold">
                Galería para Escena {activeSceneIdx !== null ? activeSceneIdx + 1 : ''}
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
            <CardContent className="custom-scrollbar grid max-h-[70vh] grid-cols-3 gap-4 overflow-y-auto p-8 sm:grid-cols-4 md:grid-cols-5">
              {form.uploadedImages.map((img: any) => (
                <div
                  key={img.id}
                  className={cn(
                    'relative aspect-square cursor-pointer overflow-hidden rounded-xl border-4 shadow-md transition-all',
                    form.editedScenes[activeSceneIdx!]?.imageId === img.id
                      ? 'border-primary scale-95'
                      : 'hover:border-primary/50 border-transparent',
                  )}
                  onClick={() => {
                    const newScenes = [...form.editedScenes];
                    if (activeSceneIdx !== null) newScenes[activeSceneIdx].imageId = img.id;
                    update('editedScenes', newScenes);
                    setModalOpen(false);
                  }}
                >
                  <img
                    src={img.url}
                    className="absolute inset-0 h-full w-full scale-101 object-cover"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
