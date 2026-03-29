'use client';

import { Sparkles, FileText, ImageIcon, Video, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const actions = [
  {
    title: 'Generar Copy con IA',
    description: 'Crea textos persuasivos para tu propiedad',
    icon: Sparkles,
    color: 'bg-primary/20 text-primary',
  },
  {
    title: 'Crear Brief PDF',
    description: 'Documento profesional listo para compartir',
    icon: FileText,
    color: 'bg-accent/20 text-accent',
  },
  {
    title: 'Posts para Redes',
    description: 'Imágenes optimizadas para Instagram y Facebook',
    icon: ImageIcon,
    color: 'bg-green-500/20 text-green-500',
  },
  {
    title: 'Video Promocional',
    description: 'Reels y TikToks con voz en off',
    icon: Video,
    color: 'bg-blue-500/20 text-blue-500',
  },
];

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Wand2 className="text-primary h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="bg-secondary/50 hover:bg-secondary flex h-auto flex-col items-start justify-start gap-2 p-4 text-left"
            >
              <div className={`rounded-lg p-2 ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-foreground font-medium">{action.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
