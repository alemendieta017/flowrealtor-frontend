'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  X,
  Info,
  Home,
  Image as ImageIcon,
  Video,
  Palette,
} from 'lucide-react';
import { usePropertyForm } from './_hooks/use-property-form';
import { Step1 } from './_components/step-1-details';
import { Step2 } from './_components/step-2-gallery';
import { Step3 } from './_components/step-3-ai-script';
import { Step4 } from './_components/step-4-studio';

const STEPS = [
  { id: 1, label: 'Detalles', icon: Home },
  { id: 2, label: 'Galería', icon: ImageIcon },
  { id: 3, label: 'Guion', icon: Video },
  { id: 4, label: 'Estudio Creativo', icon: Palette },
];

function PropertyPageContent() {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const {
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
    handleGenerateContent,
    handleGenerateListings,
    goNext,
  } = usePropertyForm();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 80) {
        setShowHeader(true);
      } else if (currentScrollY < lastScrollY.current) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setShowHeader(false);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-background min-h-screen">
      <div
        className={cn(
          'bg-card/95 supports-backdrop-filter:bg-card/80 sticky top-0 z-30 transform border-b backdrop-blur-md transition-all duration-300 ease-in-out',
          showHeader
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0',
        )}
      >
        <div className={cn("mx-auto transition-all duration-300", step === 4 ? "max-w-7xl" : "max-w-5xl")}>
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Nueva Propiedad</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Paso {step} de {STEPS.length}: {STEPS[step - 1].label}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="h-8 sm:h-9"
            >
              <X className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Cancelar</span>
            </Button>
          </div>

          <div className="mb-4 px-4 sm:px-6">
            <Progress value={progressPct} className="h-1.5" />
          </div>

          <div className="px-4 pb-4 sm:px-6">
            <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                      step === s.id
                        ? 'bg-primary text-primary-foreground'
                        : step > s.id
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-3 w-3" /> {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("mx-auto px-4 py-6 sm:px-6 sm:py-8 transition-all duration-300", step === 4 ? "max-w-7xl" : "max-w-5xl")}>
        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 flex items-start gap-2 rounded-lg border p-4 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
          </div>
        )}

        {step === 1 && <Step1 form={form} update={update} />}
        {step === 2 && <Step2 propertyId={propertyId} form={form} update={update} />}
        {step === 3 && (
          <Step3
            form={form}
            update={update}
            propertyId={propertyId}
            content={content}
            onGenerate={() => propertyId && handleGenerateContent(propertyId)}
            loading={loading}
          />
        )}
        {step === 4 && (
          <Step4
            form={form}
            updateMultiple={updateMultiple}
            templates={templates}
            content={content}
          />
        )}

        <div className="mt-8 flex justify-between border-t pt-6 pb-10">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
          </Button>
          {step < STEPS.length ? (
            <Button
              onClick={() => {
                if (step === 3 && !content && propertyId) {
                  handleGenerateContent(propertyId);
                } else {
                  goNext();
                }
              }}
              disabled={loading}
              className={step === 3 && !content ? 'bg-primary hover:bg-primary/90' : ''}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
              ) : step === 3 && !content ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generar Contenido
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerateListings}
              disabled={loading}
              className="from-primary to-primary/80 bg-gradient-to-r px-8 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generar Todo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PropertyPageContent />
    </Suspense>
  );
}
