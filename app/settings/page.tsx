'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { agentsApi } from '@/lib/api';
import type { Agent } from '@/lib/types';
import { Loader2, Save, Upload, User, Palette, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AGENT_ID = '7bc227f4-4251-4ced-873c-29df8bd7229b'; // TODO: auth

export default function SettingsPage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    primaryColor: '#1e40af',
    secondaryColor: '#f59e0b',
    instagram: '',
    facebook: '',
    tiktok: '',
    whatsapp: '',
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
        name: a.name ?? '',
        email: a.email ?? '',
        phone: a.phone ?? '',
        companyName: a.companyName ?? '',
        primaryColor: a.brandColors?.primary ?? '#1e40af',
        secondaryColor: a.brandColors?.secondary ?? '#f59e0b',
        instagram: a.socialLinks?.instagram ?? '',
        facebook: a.socialLinks?.facebook ?? '',
        tiktok: a.socialLinks?.tiktok ?? '',
        whatsapp: a.socialLinks?.whatsapp ?? '',
      });
    } catch {
      // Agent doesn't exist yet
    } finally {
      setLoading(false);
    }
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

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
        updated = await agentsApi.create({ ...payload, id: AGENT_ID });
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
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="bg-muted/10 flex-1 overflow-auto">
          {/* Top Bar for Consistency */}
          <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg font-bold sm:text-xl">Configuración</h1>
                <p className="text-muted-foreground hidden text-sm sm:block">
                  FlowRealtor — Perfil de Agente
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">Guardar Cambios</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
          </div>

          <div className="p-4 pb-12 sm:p-6">
            <div className="mx-auto max-w-4xl space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium">Información Personal</h3>
                      <p className="text-muted-foreground text-sm">
                        Tus datos de contacto principales.
                      </p>
                    </div>
                    <Card className="lg:col-span-2">
                      <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
                        <div className="space-y-2">
                          <Label className="text-sm">Nombre completo</Label>
                          <Input
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Inmobiliaria</Label>
                          <Input
                            value={form.companyName}
                            onChange={(e) => update('companyName', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Email</Label>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Teléfono / WhatsApp</Label>
                          <Input
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            placeholder="+595 9xx xxx xxx"
                            className="text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <hr className="border-border" />

                  {/* Brand Assets */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium">Logo y Foto</h3>
                      <p className="text-muted-foreground text-sm">
                        Tu imagen profesional en los materiales generados.
                      </p>
                    </div>
                    <Card className="lg:col-span-2">
                      <CardContent className="grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 sm:p-6">
                        <div className="space-y-3">
                          <Label className="text-sm">Logo de la Inmobiliaria</Label>
                          <div className="flex items-center gap-4">
                            <div className="bg-card relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                              {agent?.logoUrl || logoFile ? (
                                <img
                                  src={logoFile ? URL.createObjectURL(logoFile) : agent!.logoUrl!}
                                  alt="Logo"
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <Upload className="text-muted-foreground h-6 w-6" />
                              )}
                            </div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                              />
                              <Button variant="outline" size="sm" className="text-xs">
                                Cambiar
                              </Button>
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm">Foto de Perfil</Label>
                          <div className="flex items-center gap-4">
                            <div className="bg-card flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                              {agent?.photoUrl || photoFile ? (
                                <img
                                  src={
                                    photoFile ? URL.createObjectURL(photoFile) : agent!.photoUrl!
                                  }
                                  alt="Photo"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User className="text-muted-foreground h-6 w-6" />
                              )}
                            </div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                              />
                              <Button variant="outline" size="sm" className="text-xs">
                                Cambiar
                              </Button>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <hr className="border-border" />

                  {/* Colors */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium">Colores de Marca</h3>
                      <p className="text-muted-foreground text-sm">
                        Definí la identidad visual de tus PDFs y videos.
                      </p>
                    </div>
                    <Card className="lg:col-span-2">
                      <CardContent className="space-y-6 p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm">Color Primario</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={form.primaryColor}
                                onChange={(e) => update('primaryColor', e.target.value)}
                                className="h-10 w-16 cursor-pointer rounded border shadow-sm"
                              />
                              <Input
                                value={form.primaryColor}
                                onChange={(e) => update('primaryColor', e.target.value)}
                                className="font-mono text-xs sm:text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Color de Acento</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={form.secondaryColor}
                                onChange={(e) => update('secondaryColor', e.target.value)}
                                className="h-10 w-16 cursor-pointer rounded border shadow-sm"
                              />
                              <Input
                                value={form.secondaryColor}
                                onChange={(e) => update('secondaryColor', e.target.value)}
                                className="font-mono text-xs sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background overflow-hidden rounded-xl border p-4">
                          <div
                            className="flex flex-col items-center justify-between gap-4 rounded-lg border p-4 shadow-sm sm:flex-row sm:p-6"
                            style={{
                              background: `linear-gradient(135deg, ${form.primaryColor}10, ${form.primaryColor}20)`,
                              borderColor: `${form.primaryColor}30`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                style={{ background: form.primaryColor }}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <div
                                className="truncate text-sm font-semibold sm:text-base"
                                style={{ color: form.primaryColor }}
                              >
                                {form.companyName || 'Tu Inmobiliaria'}
                              </div>
                            </div>
                            <div
                              className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-md sm:text-xs"
                              style={{ background: form.secondaryColor }}
                            >
                              ACCIÓN
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <hr className="border-border" />

                  {/* Social */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium">Redes Sociales</h3>
                      <p className="text-muted-foreground text-sm">
                        Enlaces que se incluirán en tus materiales.
                      </p>
                    </div>
                    <Card className="lg:col-span-2">
                      <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
                        {[
                          {
                            key: 'instagram',
                            label: 'Instagram',
                            placeholder: '@tuinmobiliaria',
                          },
                          {
                            key: 'facebook',
                            label: 'Facebook',
                            placeholder: 'facebook.com/tuinmobiliaria',
                          },
                          {
                            key: 'tiktok',
                            label: 'TikTok',
                            placeholder: '@tuinmobiliaria',
                          },
                          {
                            key: 'whatsapp',
                            label: 'WhatsApp',
                            placeholder: '+595 9xx xxx xxx',
                          },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-sm">{label}</Label>
                            <Input
                              value={(form as Record<string, string>)[key]}
                              onChange={(e) => update(key, e.target.value)}
                              placeholder={placeholder}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
