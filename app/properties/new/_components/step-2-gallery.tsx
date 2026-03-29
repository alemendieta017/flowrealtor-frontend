import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';
import { propertiesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { PropertyFormData } from '@/lib/schemas/property.schema';

export function Step2({
  propertyId,
  form,
  update,
}: {
  propertyId: string | null;
  form: PropertyFormData;
  update: (k: keyof PropertyFormData, v: any) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!propertyId || !e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const uploaded = await propertiesApi.uploadImages(propertyId, files);
      update('uploadedImages', [...form.uploadedImages, ...uploaded]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !propertyId) return;
    const items = Array.from(form.uploadedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    update('uploadedImages', items);

    // Persist reorder to backend
    try {
      await propertiesApi.reorderImages(
        propertyId,
        items.map((img, idx) => ({ id: img.id, order: idx })),
      );
    } catch (e) {
      console.error('Error reordering images', e);
    }
  };

  const removeImage = async (imageId: string) => {
    if (!propertyId) return;
    try {
      await propertiesApi.deleteImage(propertyId, imageId);
      update(
        'uploadedImages',
        form.uploadedImages.filter((img) => img.id !== imageId),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-pretty sm:text-3xl">
          Galería de imágenes
        </h2>
        <p className="text-muted-foreground">
          Sube tus fotos y ordénalas arrastrando. La primera será la{' '}
          <span className="text-foreground font-bold">portada</span>.
        </p>
      </div>

      <label className="hover:border-primary hover:bg-primary/5 group bg-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 shadow-sm transition-all">
        <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110">
          <Upload className="text-primary h-8 w-8" />
        </div>
        <span className="text-lg font-bold">Haz clic o arrastra fotos</span>
        <span className="text-muted-foreground mt-1 text-sm">
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
        <div className="text-primary flex animate-pulse items-center justify-center gap-2 py-4 text-center text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin" /> Subiendo y optimizando imágenes...
        </div>
      )}

      {form.uploadedImages.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="gallery" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative mt-8 flex flex-wrap gap-4"
                style={{ minHeight: '150px' }}
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
                          opacity: snapshot.isDragging ? 0.9 : 1,
                        }}
                        className={cn(
                          'group bg-card relative h-36 w-36 overflow-hidden rounded-xl border-2 shadow-lg',
                          snapshot.isDragging ? 'border-primary' : 'hover:border-primary/50',
                        )}
                      >
                        <img
                          src={img.url}
                          alt="Thumbnail"
                          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <GripVertical className="h-8 w-8 text-white" />
                        </div>
                        {index === 0 && (
                          <Badge className="bg-primary absolute top-2 left-2 border-none px-2 py-0.5 text-[10px] font-bold uppercase shadow-md">
                            Portada
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                          className="bg-destructive/90 hover:bg-destructive absolute top-2 right-2 z-30 flex items-center justify-center rounded-full p-1.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
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
  );
}
