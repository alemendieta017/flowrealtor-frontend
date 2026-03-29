import { z } from 'zod';
import type { PropertyImage } from '@/lib/types';

// Zod doesn't have a great way to handle complex object types natively
// if we don't redefine them perfectly, so for `uploadedImages` we can use z.custom
export const PropertyImageSchema = z.custom<PropertyImage>();

export const PropertyFormSchema = z.object({
  // Step 1
  operationType: z.string(),
  propertyType: z.string(),
  country: z.string(),
  city: z.string(),
  neighborhood: z.string(),
  address: z.string(),
  priceAmount: z.string(),
  currency: z.string(),
  bedrooms: z.string(),
  bathrooms: z.string(),
  parkingSpaces: z.string(),
  totalArea: z.string(),
  builtArea: z.string(),
  unbuiltArea: z.string(),
  levels: z.string(),
  amenities: z.array(z.string()),
  description: z.string(),

  // Step 2
  uploadedImages: z.array(PropertyImageSchema),

  // Step 3
  videoFormat: z.string(),
  voiceoverEnabled: z.boolean(),
  voiceGender: z.string(),
  editedScenes: z.array(
    z.object({
      text: z.string(),
      suggestedDuration: z.number(),
      imageId: z.string().nullable(),
    }),
  ),

  // Step 4
  selectedPdfTemplateId: z.string(),
  selectedSocialTemplateId: z.string(),
  selectedVideoTemplateId: z.string(),
  agentName: z.string(),
  agentPhone: z.string(),
  agentEmail: z.string(),
  agentCompany: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),

  // AI Editable Text
  title: z.string(),
  hook: z.string(),
  body: z.string(),
  caption: z.string(),
});

export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

export const initialForm: PropertyFormData = {
  operationType: 'venta',
  propertyType: 'casa',
  country: 'Paraguay',
  city: 'Asuncion',
  neighborhood: '',
  address: '',
  priceAmount: '',
  currency: 'USD',
  bedrooms: '',
  bathrooms: '',
  parkingSpaces: '',
  totalArea: '',
  builtArea: '',
  unbuiltArea: '',
  levels: '',
  amenities: [],
  description: '',
  uploadedImages: [],
  videoFormat: 'quick',
  voiceoverEnabled: true,
  voiceGender: 'female',
  editedScenes: [],
  selectedPdfTemplateId: '',
  selectedSocialTemplateId: '',
  selectedVideoTemplateId: '',
  agentName: 'Juan Pérez',
  agentPhone: '+595 999 123456',
  agentEmail: 'juan@flowrealtor.com',
  agentCompany: 'FlowRealtor',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  title: '',
  hook: '',
  body: '',
  caption: '',
};
