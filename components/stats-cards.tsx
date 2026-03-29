'use client';

import { Building2, FileText, ImageIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Propiedades',
    value: '24',
    change: '+3 este mes',
    icon: Building2,
    trend: 'up',
  },
  {
    title: 'Briefs Generados',
    value: '86',
    change: '+12 esta semana',
    icon: FileText,
    trend: 'up',
  },
  {
    title: 'Posts Creados',
    value: '142',
    change: '+28 esta semana',
    icon: ImageIcon,
    trend: 'up',
  },
  {
    title: 'Engagement',
    value: '4.2K',
    change: '+18% vs mes anterior',
    icon: TrendingUp,
    trend: 'up',
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              <span className="text-green-500">{stat.change}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
