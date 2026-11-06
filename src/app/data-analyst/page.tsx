
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { AdminStats } from '@/components/admin-stats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { UsersByRoleChart, UsersOverTimeChart } from '@/components/charts';
import { ExportButton } from '@/components/export-button';

const allowedRoles: (string | null)[] = ['admin', 'data_analyst'];

export default function DataAnalystPage() {
  const { role, loading } = useAuth();

  if (loading) {
    return <DashboardLayout><div>Cargando...</div></DashboardLayout>;
  }
  
  if (!allowedRoles.includes(role)) {
      return (
        <DashboardLayout>
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>
                    No tienes permiso para ver esta página.
                </AlertDescription>
            </Alert>
        </DashboardLayout>
      );
  }

  return (
    <DashboardLayout>
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Análisis de Datos</h1>
                <p className="text-muted-foreground">Resumen del uso de la plataforma y actividad de los usuarios.</p>
            </div>
             <ExportButton />
        </div>
        <div className="space-y-8">
            <AdminStats />
            <div className="grid gap-8 md:grid-cols-2">
              <UsersByRoleChart />
              <UsersOverTimeChart />
            </div>
        </div>
    </DashboardLayout>
  );
}
