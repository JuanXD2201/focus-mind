
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { ContentTable } from '@/components/content-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Activity } from '@/components/content-table';

const allowedRoles: (string | null)[] = ['content_manager', 'admin'];

export default function ContentManagerPage() {
    const { role, loading } = useAuth();
    
    const activities: Activity[] = [
        {
          title: "Espacio de Dibujo",
          description: "Libera tu creatividad y relájate con un lienzo digital.",
          type: "Creatividad",
          status: "Activo",
        },
        {
          title: "Mándala Relajante",
          description: "Colorea un mándala y encuentra un momento de paz creativa.",
          type: "Creatividad",
          status: "Activo",
        },
        {
          title: "Meditación Guiada",
          description: "Sigue nuestras meditaciones guiadas para encontrar la calma y la claridad.",
          type: "Relajación",
          status: "Activo",
        },
        {
          title: "Juego de Memoria",
          description: "Desafía tu mente y mejora tu concentración con este juego.",
          type: "Juego",
          status: "Activo",
        },
        {
          title: "Ejercicios de Respiración",
          description: "Aprende a controlar tu respiración para reducir el estrés.",
          type: "Relajación",
          status: "Activo",
        },
        {
          title: "Sonidos Relajantes",
          description: "Escucha sonidos de la naturaleza para calmar tu mente.",
          type: "Relajación",
          status: "Activo",
        },
        {
          title: "Generador de Cuentos",
          description: "Crea un cuento corto y relajante a partir de una idea.",
          type: "Creatividad",
          status: "Activo",
        },
        {
          title: "Adivina la Imagen",
          description: "La IA crea una imagen y tú adivinas qué es. ¡Pon a prueba tu intuición!",
          type: "Juego",
          status: "Activo",
        },
        {
          title: "Diario de Gratitud",
          description: "Reflexiona sobre lo bueno de tu día y cultiva la gratitud.",
          type: "Reflexión",
          status: "Activo",
        },
        {
          title: "Técnica Pomodoro",
          description: "Usa este temporizador para trabajar en ráfagas de concentración.",
          type: "Productividad",
          status: "Activo",
        },
        {
          title: "Afirmaciones Positivas",
          description: "Recibe una dosis de inspiración y motivación para tu día.",
          type: "Reflexión",
          status: "Activo",
        },
        {
          title: "Rastreador de Hábitos",
          description: "Define y sigue tus hábitos para alcanzar tus metas personales.",
          type: "Productividad",
          status: "Activo",
        },
        {
          title: "Conecta Palabras",
          description: "Un juego de asociación libre para despertar tu lado más creativo.",
          type: "Juego",
          status: "Activo",
        },
        {
          title: "Puzzle Deslizante",
          description: "Ordena las piezas para revelar la imagen. ¡Un reto para tu enfoque!",
          type: "Juego",
          status: "Activo",
        },
        {
          title: "Lista de Enfoque",
          description: "Organiza tus tareas diarias y mantén la claridad en tus objetivos.",
          type: "Productividad",
          status: "Activo",
        },
    ];

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Contenido</h1>
                    <p className="text-muted-foreground">Visualiza y gestiona las actividades de la plataforma.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Lista de Actividades</CardTitle>
                    <CardDescription>
                        Listado de todas las actividades y juegos disponibles en la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContentTable activities={activities} />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
