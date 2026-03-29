import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { propertiesApi, contentApi, listingsApi, templatesApi } from '@/lib/api';
import { type PropertyContent, type Property, type Template } from '@/lib/types';
import { initialForm, type PropertyFormData } from '@/lib/schemas/property.schema';

const AGENT_ID = '7bc227f4-4251-4ced-873c-29df8bd7229b'; // TODO: replace with auth context

export const STEPS = [
  { id: 1, label: 'Detalles' },
  { id: 2, label: 'Galería' },
  { id: 3, label: 'Guion' },
  { id: 4, label: 'Estudio Creativo' },
];

export function usePropertyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlStep = Number(searchParams.get('step')) || 1;
  const urlId = searchParams.get('id');

  const [step, setStep] = useState(urlStep);
  const [form, setForm] = useState<PropertyFormData>(initialForm);
  const [propertyId, setPropertyId] = useState<string | null>(urlId);
  const [content, setContent] = useState<PropertyContent | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync step state with URL (browser back/forward)
  useEffect(() => {
    const s = Number(searchParams.get('step')) || 1;
    if (s !== step) {
      setStep(s);
    }
  }, [searchParams]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (params.get('step') !== String(step)) {
      params.set('step', String(step));
      changed = true;
    }
    if (propertyId && params.get('id') !== propertyId) {
      params.set('id', propertyId);
      changed = true;
    }
    if (changed) {
      const method = params.get('step') !== searchParams.get('step') ? 'push' : 'replace';
      router[method](`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [step, propertyId, pathname, router, searchParams]);

  // Restore state from API if ID is in URL
  useEffect(() => {
    if (urlId && !propertyId) {
      setPropertyId(urlId);
    }

    const loadPropertyData = async (id: string) => {
      setLoading(true);
      try {
        const [property, images, propertyContent] = await Promise.all([
          propertiesApi.get(id),
          propertiesApi.getImages(id),
          contentApi.get(id).catch(() => null),
        ]);

        setForm((f) => ({
          ...f,
          operationType: property.operationType,
          propertyType: property.propertyType,
          neighborhood: property.neighborhood,
          city: property.city,
          address: property.address || '',
          priceAmount: String(property.priceAmount),
          currency: property.currency,
          bedrooms: String(property.bedrooms || ''),
          bathrooms: String(property.bathrooms || ''),
          parkingSpaces: String(property.parkingSpaces || ''),
          totalArea: String(property.totalArea || ''),
          builtArea: String(property.builtArea || ''),
          unbuiltArea: String(property.unbuiltArea || ''),
          levels: String(property.levels || ''),
          amenities: property.amenities,
          description: property.description || '',
          uploadedImages: images,
          title: propertyContent?.title || '',
          hook: propertyContent?.hook || '',
          body: propertyContent?.body || '',
          caption: propertyContent?.caption || '',
          editedScenes:
            propertyContent?.videoScript?.scenes.map((s: any, i: number) => ({
              text: s.text,
              suggestedDuration: s.suggestedDuration,
              imageId: images[i % images.length]?.id || null,
            })) || [],
        }));

        if (propertyContent) {
          setContent(propertyContent);
        }
      } catch (e) {
        console.error('Error loading property data', e);
      } finally {
        setLoading(false);
      }
    };

    if (urlId && propertyId === urlId && form.uploadedImages.length === 0 && !loading) {
      loadPropertyData(urlId);
    }
  }, [urlId, propertyId]);

  useEffect(() => {
    let mounted = true;
    const loadTemplates = async () => {
      try {
        const data = await templatesApi.getAll();
        if (mounted && data.length > 0) {
          setTemplates(data);
          setForm((f) => ({
            ...f,
            selectedPdfTemplateId: data.find((t) => t.type === 'PDF')?.id || '',
            selectedSocialTemplateId: data.find((t) => t.type.startsWith('SOCIAL'))?.id || '',
            selectedVideoTemplateId: data.find((t) => t.type === 'VIDEO_REEL')?.id || '',
          }));
        }
      } catch (e) {
        console.error('Error loading templates', e);
      }
    };
    loadTemplates();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(
    (key: keyof PropertyFormData, value: unknown) => setForm((f) => ({ ...f, [key]: value })),
    [],
  );

  const updateMultiple = useCallback(
    (updates: Partial<PropertyFormData>) => setForm((f) => ({ ...f, ...updates })),
    [],
  );

  const handleCreateProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = {
        agentId: AGENT_ID,
        operationType: form.operationType as Property['operationType'],
        propertyType: form.propertyType as Property['propertyType'],
        country: form.country,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        priceAmount: Number(form.priceAmount) || 0,
        currency: form.currency as 'USD' | 'PYG',
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        parkingSpaces: form.parkingSpaces ? Number(form.parkingSpaces) : undefined,
        totalArea: form.totalArea ? Number(form.totalArea) : undefined,
        builtArea: form.builtArea ? Number(form.builtArea) : undefined,
        unbuiltArea: form.unbuiltArea ? Number(form.unbuiltArea) : undefined,
        levels: form.levels ? Number(form.levels) : undefined,
        amenities: form.amenities,
        description: form.description,
      };

      if (propertyId) {
        await propertiesApi.update(propertyId, data);
      } else {
        const property = await propertiesApi.create(data);
        setPropertyId(property.id);
      }
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const generated = await contentApi.generate({
        propertyId: pid,
        videoFormat: form.videoFormat,
        voiceGender: form.voiceGender,
      });
      setContent(generated);
      setForm((f) => ({
        ...f,
        title: generated.title,
        hook: generated.hook,
        body: generated.body,
        caption: generated.caption,
        editedScenes: generated.videoScript.scenes.map((s, i) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
          imageId: f.uploadedImages[i % f.uploadedImages.length]?.id || null,
        })),
      }));
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScript = async () => {
    if (!propertyId || !content) return;
    await contentApi.update(propertyId, {
      title: form.title,
      hook: form.hook,
      body: form.body,
      caption: form.caption,
      videoScript: {
        scenes: form.editedScenes.map((s) => ({
          text: s.text,
          suggestedDuration: s.suggestedDuration,
        })),
      },
    });
  };

  const handleGenerateListings = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      await handleSaveScript();
      await listingsApi.generate({
        propertyId,
        briefConfig: {
          templateId: form.selectedPdfTemplateId || undefined,
          colors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
          },
        },
        socialConfig: {
          templateId: form.selectedSocialTemplateId || undefined,
          images: form.uploadedImages.map((img, idx) => ({
            imageId: img.id,
            order: idx,
          })),
          colors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
          },
        },
        videoConfig: {
          templateId: form.selectedVideoTemplateId || undefined,
          format: form.videoFormat,
          voiceoverEnabled: form.voiceoverEnabled,
          voiceGender: form.voiceGender,
          sceneOrder: form.editedScenes.map((s) => ({
            imageId: s.imageId || '',
            sceneText: s.text,
            duration: s.suggestedDuration,
          })),
        },
      });
      router.push(`/properties/${propertyId}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const goNext = async () => {
    try {
      if (step === 1) await handleCreateProperty();
      if (step === 2) {
        if (form.uploadedImages.length === 0) {
          setError('Por favor subí al menos una imagen antes de continuar.');
          return;
        }
      }
      if (step === 3 && propertyId) {
        if (!content) {
          setError(
            "Haz clic en 'Generar Contenido IA' para que el asistente redacte el título y descripciones.",
          );
          return;
        }
        await handleSaveScript();
      }

      setStep((s) => Math.min(s + 1, STEPS.length));
      setError(null);
    } catch {}
  };

  return {
    form,
    step,
    setStep,
    propertyId,
    content,
    templates,
    loading,
    error,
    update,
    updateMultiple,
    handleCreateProperty,
    handleGenerateContent,
    handleSaveScript,
    handleGenerateListings,
    goNext,
    setError,
  };
}
