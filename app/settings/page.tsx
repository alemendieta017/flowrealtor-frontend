"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/lib/types";
import {
  Loader2,
  Save,
  Upload,
  User,
  Palette,
  Link,
  Phone,
} from "lucide-react";

const AGENT_ID = "demo-agent"; // TODO: replace with auth

export default function SettingsPage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    primaryColor: "#1e40af",
    secondaryColor: "#f59e0b",
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadAgent();
  }, []);

  async function loadAgent() {
    setLoading(true);
    try {
      const a = await agentsApi.get(AGENT_ID);
      setAgent(a);
      setForm({
        name: a.name ?? "",
        email: a.email ?? "",
        phone: a.phone ?? "",
        companyName: a.companyName ?? "",
        primaryColor: a.brandColors?.primary ?? "#1e40af",
        secondaryColor: a.brandColors?.secondary ?? "#f59e0b",
        instagram: a.socialLinks?.instagram ?? "",
        facebook: a.socialLinks?.facebook ?? "",
        tiktok: a.socialLinks?.tiktok ?? "",
        whatsapp: a.socialLinks?.whatsapp ?? "",
      });
    } catch {
      // Agent doesn't exist yet
    } finally {
      setLoading(false);
    }
  }

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        brandColors: {
          primary: form.primaryColor,
          secondary: form.secondaryColor,
        },
        socialLinks: {
          instagram: form.instagram || undefined,
          facebook: form.facebook || undefined,
          tiktok: form.tiktok || undefined,
          whatsapp: form.whatsapp || undefined,
        },
      };

      let updated: Agent;
      if (agent) {
        updated = await agentsApi.update(AGENT_ID, payload);
      } else {
        updated = await agentsApi.create(payload);
      }
      setAgent(updated);

      if (logoFile) {
        updated = await agentsApi.uploadLogo(updated.id, logoFile);
        setAgent(updated);
        setLogoFile(null);
      }
      if (photoFile) {
        updated = await agentsApi.uploadPhoto(updated.id, photoFile);
        setAgent(updated);
        setPhotoFile(null);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Agente</h1>
        <p className="text-muted-foreground mt-1">
          Esta información se usa para personalizar el brief PDF y las
          publicaciones.
        </p>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Inmobiliaria</Label>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono / WhatsApp</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+595 9xx xxx xxx"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Logo y Foto
          </CardTitle>
          <CardDescription>
            Aparecerán en el brief PDF y materiales de marketing
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Logo de la Inmobiliaria</Label>
            <div className="flex items-center gap-3">
              {agent?.logoUrl || logoFile ? (
                <img
                  src={
                    logoFile ? URL.createObjectURL(logoFile) : agent!.logoUrl!
                  }
                  alt="Logo"
                  className="h-16 w-16 rounded-lg object-contain border bg-white p-1"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Cambiar logo</span>
                </Button>
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Foto del Agente</Label>
            <div className="flex items-center gap-3">
              {agent?.photoUrl || photoFile ? (
                <img
                  src={
                    photoFile
                      ? URL.createObjectURL(photoFile)
                      : agent!.photoUrl!
                  }
                  alt="Photo"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Cambiar foto</span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Colores de Marca
          </CardTitle>
          <CardDescription>
            Se aplican automáticamente en el brief PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Color Primario</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color Secundario / Acento</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border"
              />
              <Input
                value={form.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div
              className="rounded-lg p-4"
              style={{ background: form.primaryColor }}
            >
              <span className="text-white font-semibold">
                Vista previa del color primario
              </span>
              <span
                className="ml-3 px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: form.secondaryColor, color: "#fff" }}
              >
                Acento
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link className="h-4 w-4" />
            Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            {
              key: "instagram",
              label: "Instagram",
              placeholder: "@tuinmobiliaria",
            },
            {
              key: "facebook",
              label: "Facebook",
              placeholder: "facebook.com/tuinmobiliaria",
            },
            { key: "tiktok", label: "TikTok", placeholder: "@tuinmobiliaria" },
            {
              key: "whatsapp",
              label: "WhatsApp",
              placeholder: "+595 9xx xxx xxx",
            },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                value={(form as Record<string, string>)[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Guardar configuración
      </Button>
    </div>
  );
}
