
"use client";

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paintbrush, Headphones, Gamepad2, Wind, Waves, BookHeart, Timer, Sparkles, CheckCircle2, PenSquare, Puzzle, Image, Link2, ListTodo, Target, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { MemoryGame } from '@/components/memory-game';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { GuidedMeditation } from '@/components/guided-meditation';
import { BreathingExercise } from '@/components/breathing-exercise';
import { RelaxingSounds } from '@/components/relaxing-sounds';
import { GratitudeJournal } from '@/components/gratitude-journal';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { PositiveAffirmations } from '@/components/positive-affirmations';
import { HabitTracker } from '@/components/habit-tracker';
import { StoryGenerator } from '@/components/story-generator';
import { SlidingPuzzle } from '@/components/sliding-puzzle';
import { GuessTheImage } from '@/components/guess-the-image';
import { WordConnect } from '@/components/word-connect';
import { FocusList } from '@/components/focus-list';
import { RelaxingMandala } from '@/components/relaxing-mandala';


const ActivityDialog = ({ trigger, title, children, description, className }: { trigger: React.ReactNode, title: string, children: React.ReactNode, description?: string, className?: string }) => (
    <Dialog>
        <DialogTrigger asChild>
            {trigger}
        </DialogTrigger>
        <DialogContent className={className || "max-w-fit"}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && (
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                )}
            </DialogHeader>
            <div className="py-4">
                {children}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button>Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);


export default function ActivitiesPage() {
  // Fecha estable para la Lista de Enfoque dentro del dialogo de actividades.
  const today = useMemo(() => new Date(), []);
  const activities = [
    {
      title: "Espacio de Dibujo",
      description: "Libera tu creatividad y relájate con un lienzo digital.",
      icon: Paintbrush,
      buttonText: "Comenzar",
      component: <DrawingCanvas />,
      dialogClassName: "max-w-3xl",
    },
    {
      title: "Mándala Relajante",
      description: "Colorea un mándala y encuentra un momento de paz creativa.",
      icon: Palette,
      buttonText: "Colorear",
      component: <RelaxingMandala />,
      dialogClassName: "max-w-fit",
    },
    {
      title: "Meditación Guiada",
      description: "Sigue nuestras meditaciones guiadas para encontrar la calma y la claridad.",
      icon: Headphones,
      buttonText: "Explorar",
      component: <GuidedMeditation />,
      dialogDescription: "Escribe un tema y la IA creará una meditación para ti.",
      dialogClassName: "max-w-md",
    },
    {
      title: "Juego de Memoria",
      description: "Desafía tu mente y mejora tu concentración con este juego.",
      icon: Gamepad2,
      buttonText: "Jugar Ahora",
      component: <MemoryGame />,
      dialogDescription: "Encuentra las parejas de iconos.",
    },
    {
      title: "Ejercicios de Respiración",
      description: "Aprende a controlar tu respiración para reducir el estrés.",
      icon: Wind,
      buttonText: "Iniciar",
      component: <BreathingExercise />,
      dialogDescription: "Sigue la guía visual para respirar.",
    },
    {
      title: "Sonidos Relajantes",
      description: "Escucha sonidos de la naturaleza para calmar tu mente.",
      icon: Waves,
      buttonText: "Escuchar",
      component: <RelaxingSounds />,
      dialogDescription: "Selecciona un sonido y relájate.",
    },
     {
      title: "Generador de Cuentos",
      description: "Crea un cuento corto y relajante a partir de una idea.",
      icon: PenSquare,
      buttonText: "Crear",
      component: <StoryGenerator />,
      dialogDescription: "Escribe una idea y la IA creará un cuento para ti.",
      dialogClassName: "max-w-xl",
    },
    {
      title: "Adivina la Imagen",
      description: "La IA crea una imagen y tú adivinas qué es. ¡Pon a prueba tu intuición!",
      icon: Image,
      buttonText: "Adivinar",
      component: <GuessTheImage />,
      dialogDescription: "¿Qué crees que es?",
      dialogClassName: "max-w-xl",
    },
    {
      title: "Diario de Gratitud",
      description: "Reflexiona sobre lo bueno de tu día y cultiva la gratitud.",
      icon: BookHeart,
      buttonText: "Escribir",
      component: <GratitudeJournal />,
      dialogDescription: "¿Qué agradeces hoy?",
    },
    {
      title: "Técnica Pomodoro",
      description: "Usa este temporizador para trabajar en ráfagas de concentración.",
      icon: Timer,
      buttonText: "Empezar",
      component: <PomodoroTimer />,
      dialogDescription: "Concéntrate en bloques de 25 minutos.",
    },
    {
      title: "Afirmaciones Positivas",
      description: "Recibe una dosis de inspiración y motivación para tu día.",
      icon: Sparkles,
      buttonText: "Ver",
      component: <PositiveAffirmations />,
      dialogDescription: "Un pensamiento positivo para ti.",
    },
    {
      title: "Rastreador de Hábitos",
      description: "Define y sigue tus hábitos para alcanzar tus metas personales.",
      icon: CheckCircle2,
      buttonText: "Seguir",
      component: <HabitTracker />,
      dialogDescription: "Marca los hábitos que completaste hoy.",
    },
    {
      title: "Conecta Palabras",
      description: "Un juego de asociación libre para despertar tu lado más creativo.",
      icon: Link2,
      buttonText: "Conectar",
      component: <WordConnect />,
      dialogDescription: "La IA te dará una palabra. Escribe lo primero que te venga a la mente.",
      dialogClassName: "max-w-md",
    },
    {
      title: "Puzzle Deslizante",
      description: "Ordena las piezas para revelar la imagen. ¡Un reto para tu enfoque!",
      icon: Puzzle,
      buttonText: "Jugar",
      component: <SlidingPuzzle />,
      dialogDescription: "Haz clic en una pieza junto al espacio vacío para moverla.",
    },
     {
      title: "Lista de Enfoque",
      description: "Organiza tus tareas diarias y mantén la claridad en tus objetivos.",
      icon: Target,
      buttonText: "Organizar",
      component: <FocusList selectedDate={today} />,
      dialogClassName: "max-w-2xl",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-2 mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Actividades y Juegos</h1>
        <p className="text-muted-foreground">Encuentra herramientas y juegos para calmar tu mente, mejorar tu enfoque y despertar tu creatividad.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        {activities.map((activity, index) => (
          <Card 
            key={activity.title} 
            className="hover:shadow-primary/20 transition-all duration-300 flex flex-col group border-transparent hover:border-primary/30 bg-card/50 hover:bg-card animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
              <CardHeader className="flex-grow">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <activity.icon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="font-headline text-center">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground mb-4">{activity.description}</p>
                 <ActivityDialog 
                  trigger={<Button>{activity.buttonText}</Button>}
                  title={activity.title}
                  description={activity.dialogDescription}
                  className={activity.dialogClassName}
                 >
                     {activity.component}
                 </ActivityDialog>
              </CardContent>
          </Card>
        ))}

      </div>
    </DashboardLayout>
  );
}
