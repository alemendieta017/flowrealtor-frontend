'use client';

import React from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const googleLoginUrl = `${API_URL}/api/auth/google`;

  const benefits = [
    'Generación de Briefs PDF profesionales',
    'Posteos para Redes Sociales con IA',
    'Videos automáticos con locución',
    'Gestión centralizada de tus propiedades',
  ];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Lado Izquierdo: Formulario */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo size="lg" className="mb-6" />
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Bienvenido a <span className="text-primary">flowRealtor</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              La plataforma inteligente para potenciar el marketing de tus propiedades en segundos.
            </p>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
              <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
              <CardDescription>
                Accedé de forma segura con tu cuenta de Google para comenzar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="h-12 w-full gap-3 text-base font-semibold" size="lg">
                <a href={googleLoginUrl}>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar con Google
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              ¿Por qué elegir flowRealtor?
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckCircle2 className="text-primary h-4 w-4" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Hero Image (Solo Desktop) */}
      <div className="bg-muted relative hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Real Estate AI Marketing"
            className="h-full w-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-start justify-end p-12 text-white">
          <div className="bg-primary/20 mb-6 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 backdrop-blur-md">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              Potenciado con Inteligencia Artificial
            </span>
          </div>
          <h2 className="font-display text-4xl leading-tight font-bold xl:text-5xl">
            Transformá tus propiedades en experiencias digitales memorables.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-gray-200">
            Optimizamos tu tiempo automatizando la creación de contenido de alta calidad,
            permitiéndote enfocarte en lo que mejor hacés: vender.
          </p>
        </div>
      </div>
    </div>
  );
}
