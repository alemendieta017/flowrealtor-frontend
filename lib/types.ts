export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  logoUrl?: string;
  photoUrl?: string;
  brandColors?: { primary: string; secondary: string };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  order: number;
  createdAt: string;
}

export interface Property {
  id: string;
  agentId: string;
  operationType: 'venta' | 'alquiler';
  propertyType: 'casa' | 'departamento' | 'oficina' | 'terreno' | 'local';
  title?: string;
  neighborhood: string;
  city: string;
  country: string;
  address?: string;
  priceAmount: number;
  currency: 'USD' | 'PYG';
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalArea?: number;
  builtArea?: number;
  unbuiltArea?: number;
  levels?: number;
  amenities: string[];
  description?: string;
  status: 'draft' | 'active' | 'sold' | 'rented';
  images?: PropertyImage[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoScene {
  text: string;
  suggestedDuration: number;
}

export interface Template {
  id: string;
  name: string;
  label: string;
  type: 'PDF' | 'SOCIAL' | 'VIDEO_REEL';
  thumbnailUrl: string;
  livePreviewType: 'html_iframe' | 'static_video';
  demoVideoUrl?: string;
}

export interface PropertyContent {
  id: string;
  propertyId: string;
  title: string;
  hook: string;
  body: string;
  caption: string;
  briefTitle?: string;
  briefHook?: string;
  briefDescripcion?: string;
  socialPostTitle?: string;
  socialPostCaption?: string;
  videoTitle?: string;
  hashtags: string[];
  videoScript: { scenes: VideoScene[] };
  emailBody?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
  id: string;
  propertyId: string;
  property?: Property;
  template: 'modern' | 'elegant' | 'corporate';
  colors?: { primary: string; secondary: string };
  coverImageId?: string;
  agentLogoUrl?: string;
  agentPhotoUrl?: string;
  pdfUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface SocialPost {
  id: string;
  propertyId: string;
  property?: Property;
  platform: 'instagram' | 'facebook';
  type: 'carousel' | 'story' | 'single';
  template: 'modern' | 'elegant' | 'vibrant' | 'minimal';
  images: { imageId: string; order: number }[];
  generatedImages?: { url: string; order: number }[];
  caption?: string;
  status: 'draft' | 'processing' | 'completed' | 'published' | 'failed';
  createdAt: string;
}

export interface Video {
  id: string;
  propertyId: string;
  property?: Property;
  format: 'quick' | 'narrated';
  voiceoverEnabled: boolean;
  voiceGender: 'male' | 'female';
  style: 'luxury' | 'professional' | 'energetic' | 'elegant' | 'modern';
  additionalContext?: string;
  sceneOrder: { imageId: string; sceneText: string; duration: number }[];
  videoUrl?: string;
  audioUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface ListingStatus {
  propertyId: string;
  brief: { id: string; status: string; pdfUrl?: string } | null;
  socialPosts: {
    id: string;
    type: string;
    status: string;
    generatedImages?: { url: string; order: number }[];
  }[];
  video: { id: string; status: string; videoUrl?: string } | null;
}

export const AMENITIES = [
  'Piscina',
  'Quincho / Asador',
  'Gimnasio',
  'Seguridad 24hs',
  'Alarma',
  'Camaras de seguridad',
  'Generador',
  'Cisterna',
  'Jardín',
  'Terraza',
  'Balcon',
  'Amoblado',
  'Aire acondicionado',
  'Calefaccion',
  'Gas natural',
  'Ascensor',
  'Portero electrico',
  'Cancha de tenis',
  'Cancha de padel',
  'Salon de usos multiples',
  'Lavadero',
  'Bodega',
  'Cochera cubierta',
  'Acceso discapacitados',
] as const;

export const NEIGHBORHOODS_PY = [
  'Asuncion',
  'Villa Morra',
  'Recoleta',
  'Las Mercedes',
  'Carmelitas',
  'Trinidad',
  'Herrera',
  'San Lorenzo',
  'Lambare',
  'Fernando de la Mora',
  'Luque',
  'Capiata',
  'Aregua',
  'Itaugua',
  'Mariano Roque Alonso',
  'Ypane',
  'Limpio',
  'Encarnacion',
  'Ciudad del Este',
  'Pedro Juan Caballero',
] as const;

export function formatPrice(amount: number, currency: string): string {
  if (currency === 'PYG') {
    return `Gs. ${amount.toLocaleString('es-PY')}`;
  }
  return `USD ${amount.toLocaleString('en-US')}`;
}
