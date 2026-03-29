import { useCallback, useMemo } from 'react';
import { CreativeStudio } from '@/components/creative-studio';
import { formatPrice } from '@/lib/types';
import type { PropertyFormData } from '@/lib/schemas/property.schema';
import type { PropertyContent, Template } from '@/lib/types';

export function Step4({
  form,
  updateMultiple,
  templates,
  content,
  isGenerating,
}: {
  form: PropertyFormData;
  updateMultiple: (updates: Partial<PropertyFormData>) => void;
  templates: Template[];
  content: PropertyContent | null;
  isGenerating?: boolean;
}) {
  const handleSave = useCallback(
    async (studioData: any) => {
      // Perform a single update with all fields to avoid multiple re-renders
      // This is safer and prevents "Cannot update a component while rendering another" error
      updateMultiple(studioData);
    },
    [updateMultiple],
  );

  const initialData = useMemo(
    () => ({
      selectedPdfTemplateId: form.selectedPdfTemplateId,
      selectedSocialTemplateId: form.selectedSocialTemplateId,
      selectedVideoTemplateId: form.selectedVideoTemplateId,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      uploadedImages: form.uploadedImages,
      operationType: form.operationType,
      priceFormatted: formatPrice(Number(form.priceAmount) || 0, form.currency),
      neighborhood: form.neighborhood,
      city: form.city,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      parkingSpaces: form.parkingSpaces,
      totalArea: form.totalArea,
      amenities: form.amenities,
      agentName: form.agentName,
      agentPhone: form.agentPhone,
      agentEmail: form.agentEmail,
      agentCompany: form.agentCompany,
    }),
    [
      form.selectedPdfTemplateId,
      form.selectedSocialTemplateId,
      form.selectedVideoTemplateId,
      form.primaryColor,
      form.secondaryColor,
      form.uploadedImages,
      form.operationType,
      form.priceAmount,
      form.currency,
      form.neighborhood,
      form.city,
      form.bedrooms,
      form.bathrooms,
      form.parkingSpaces,
      form.totalArea,
      form.amenities,
      form.agentName,
      form.agentPhone,
      form.agentEmail,
      form.agentCompany,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight uppercase">Estudio Creativo</h2>
        <p className="text-muted-foreground mt-2">
          Personaliza cada producto de marketing de manera independiente.
        </p>
      </div>

      <CreativeStudio
        propertyId="new"
        initialData={initialData}
        content={content as any} // Relaxing type here if needed
        templates={templates}
        onSave={handleSave}
        isGenerating={isGenerating}
        mode="create"
      />
    </div>
  );
}
