import type {
  Agent,
  Property,
  PropertyImage,
  PropertyContent,
  Brief,
  SocialPost,
  Video,
  ListingStatus,
  Template,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msgStr: any = "";
    try {
      const error = text ? (JSON.parse(text) as any) : { message: res.statusText };
      msgStr = error.message;
      if (msgStr && typeof msgStr === "object" && !Array.isArray(msgStr)) {
        msgStr = msgStr.message || JSON.stringify(msgStr);
      }
    } catch {
      msgStr = text || res.statusText;
    }
    const finalMsg = Array.isArray(msgStr)
      ? msgStr.join(", ")
      : msgStr || `HTTP ${res.status}`;
    throw new Error(finalMsg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

function toQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}

// ---- AGENTS ----
export const agentsApi = {
  get: (id: string) => request<Agent>(`/agents/${id}`),
  create: (data: Partial<Agent>) =>
    request<Agent>("/agents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Agent>) =>
    request<Agent>(`/agents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE_URL}/api/agents/${id}/logo`, {
      method: "POST",
      body: form,
    }).then((r) => r.json() as Promise<Agent>);
  },
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE_URL}/api/agents/${id}/photo`, {
      method: "POST",
      body: form,
    }).then((r) => r.json() as Promise<Agent>);
  },
};

// ---- PROPERTIES ----
export const propertiesApi = {
  list: (agentId: string, params?: PaginationParams) =>
    request<PaginatedResponse<Property>>(
      `/properties${toQueryString({ agentId, ...params })}`,
    ),
  get: (id: string) => request<Property>(`/properties/${id}`),
  create: (data: Partial<Property>) =>
    request<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Property>) =>
    request<Property>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/properties/${id}`, { method: "DELETE" }),
  getImages: (id: string) =>
    request<PropertyImage[]>(`/properties/${id}/images`),
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return fetch(`${BASE_URL}/api/properties/${id}/images`, {
      method: "POST",
      body: form,
    }).then((r) => r.json() as Promise<PropertyImage[]>);
  },
  deleteImage: (id: string, imageId: string) =>
    request<void>(`/properties/${id}/images/${imageId}`, {
      method: "DELETE",
    }),
    reorderImages: (id: string, images: { id: string; order: number }[]) =>
    request<void>(`/properties/${id}/images/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ images }),
    }),
};

// ---- TEMPLATES ----
export const templatesApi = {
  getAll: () => request<Template[]>("/templates"),
  getRaw: (id: string) => request<string>(`/templates/${id}/raw`, {
    headers: {
      Accept: 'text/plain'
    }
  }).catch(e => {
    // If request tries to parse JSON and fails, we might need a custom fetch for raw text
    return fetch(`${BASE_URL}/api/templates/${id}/raw`).then(r => r.text());
  }),
};

// ---- CONTENT ----
export const contentApi = {
  generate: (data: {
    propertyId: string;
    videoFormat?: string;
    videoStyle?: string;
    voiceGender?: string;
    additionalContext?: string;
  }) =>
    request<PropertyContent>("/content/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (propertyId: string) =>
    request<PropertyContent>(`/content/${propertyId}`),
  update: (propertyId: string, data: Partial<PropertyContent>) =>
    request<PropertyContent>(`/content/${propertyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  regenerate: (propertyId: string) =>
    request<PropertyContent>(`/content/${propertyId}/regenerate`, {
      method: "POST",
    }),
};

// ---- LISTINGS ----
export const listingsApi = {
  generate: (data: {
    propertyId: string;
    briefConfig?: Record<string, unknown>;
    socialConfig?: Record<string, unknown>;
    videoConfig?: Record<string, unknown>;
  }) =>
    request<{ status: string; propertyId: string }>("/listings/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStatus: (propertyId: string) =>
    request<ListingStatus>(`/listings/${propertyId}/status`),
};

// ---- BRIEFS ----
export const briefsApi = {
  list: (agentId: string, params?: PaginationParams) =>
    request<PaginatedResponse<Brief>>(
      `/briefs${toQueryString({ agentId, ...params })}`,
    ),
  generate: (
    propertyId: string,
    config?: {
      template?: string;
      colors?: { primary: string; secondary: string };
      coverImageId?: string;
      agentLogoUrl?: string;
      agentPhotoUrl?: string;
    },
  ) =>
    request<Brief>(`/briefs/${propertyId}/generate`, {
      method: "POST",
      body: JSON.stringify(config ?? {}),
    }),
  get: (propertyId: string) => request<Brief>(`/briefs/${propertyId}`),
};

// ---- SOCIAL ----
export const socialApi = {
  list: (agentId: string, params?: PaginationParams) =>
    request<PaginatedResponse<SocialPost>>(
      `/social${toQueryString({ agentId, ...params })}`,
    ),
  generate: (
    propertyId: string,
    config?: {
      platform?: string;
      template?: string;
      images?: { imageId: string; order: number }[];
    },
  ) =>
    request<SocialPost[]>(`/social/${propertyId}/generate`, {
      method: "POST",
      body: JSON.stringify(config ?? {}),
    }),
  getPosts: (propertyId: string) =>
    request<SocialPost[]>(`/social/${propertyId}/posts`),
};

// ---- VIDEO ----
export const videosApi = {
  list: (agentId: string, params?: PaginationParams) =>
    request<PaginatedResponse<Video>>(
      `/videos${toQueryString({ agentId, ...params })}`,
    ),
  generate: (
    propertyId: string,
    config?: {
      format?: string;
      voiceoverEnabled?: boolean;
      voiceGender?: string;
      style?: string;
      sceneOrder?: { imageId: string; sceneText: string; duration: number }[];
    },
  ) =>
    request<Video>(`/videos/${propertyId}/generate`, {
      method: "POST",
      body: JSON.stringify(config ?? {}),
    }),
  get: (propertyId: string) => request<Video>(`/videos/${propertyId}`),
};
