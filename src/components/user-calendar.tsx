
"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { PlusCircle, Trash2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { encrypt, decrypt } from '@/lib/crypto';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export interface CalendarEvent {
  id: string;
  date: Date;
  time: string;
  title: string; // This will be the encrypted title
  decryptedTitle?: string;
}

interface UserCalendarProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function UserCalendar({ selectedDate, onDateChange }: UserCalendarProps) {
  const { user, encryptionKey } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');

  
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.id}/calendarEvents`), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: (data.date as Timestamp).toDate(),
          time: data.time,
          title: data.title,
        }
      });
      
      const decryptedEvents = await Promise.all(userEvents.map(async (event) => {
          if (!encryptionKey || !event.title || !event.title.includes(':')) {
            return { ...event, decryptedTitle: event.title || '' };
          }
          try {
              const decryptedTitle = await decrypt(event.title, encryptionKey);
              return { ...event, decryptedTitle };
          } catch(e) {
              console.error("Failed to decrypt event:", e);
              return { ...event, decryptedTitle: "## Error de Desencriptación ##"};
          }
      }));
      
      setEvents(decryptedEvents);
    },
    (error) => {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.id}/calendarEvents`,
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [user, encryptionKey]);

  const selectedDayEvents = events
    .filter(
      (event) => selectedDate && format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate || !user) {
        toast({
            variant: "destructive",
            title: "Datos incompletos",
            description: "Por favor, añade un título para el evento."
        });
        return;
    }
    if (!encryptionKey) {
        toast({ variant: "destructive", title: "Error de Seguridad", description: "Clave de encriptación no disponible." });
        return;
    }

    try {
      const encryptedTitle = await encrypt(newEventTitle, encryptionKey);
      const data = {
        date: Timestamp.fromDate(selectedDate),
        time: newEventTime,
        title: encryptedTitle,
      };

      addDoc(collection(db, `users/${user.id}/calendarEvents`), data)
        .then(() => {
            toast({
              title: "Evento añadido",
              description: `El evento ha sido añadido a tu calendario.`,
            });
            setNewEventTitle('');
            setNewEventTime('12:00');
            setIsDialogOpen(false);
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `users/${user.id}/calendarEvents`,
                operation: 'create',
                requestResourceData: data,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch(error) {
       toast({
          variant: "destructive",
          title: "Error de Encriptación",
          description: "No se pudo añadir el evento.",
      });
    }
  }

  const handleDeleteEvent = (eventId: string) => {
     if (!user) return;
     const eventRef = doc(db, `users/${user.id}/calendarEvents`, eventId);
     deleteDoc(eventRef)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: eventRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="font-headline">Calendario Personal</CardTitle>
            <CardDescription>Gestiona tus actividades. Tus eventos están encriptados.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className='w-full sm:w-auto' disabled={!encryptionKey}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Evento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Evento para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : ''}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="p. ej. Cita con el médico" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Hora</Label>
                        <Input id="time" type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleAddEvent}>Guardar evento</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateChange(date || new Date())}
            className="rounded-md border self-center"
            locale={es}
            modifiers={{
              hasEvent: events.map(e => e.date)
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))'
              }
            }}
          />
        <Separator className="my-0 lg:hidden" />
        <div className="space-y-4 w-full">
            <h3 className="font-semibold text-center sm:text-left">
              Eventos para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : '...'}
            </h3>
            {selectedDayEvents.length > 0 ? (
                 <TooltipProvider>
                    <ul className="space-y-2">
                        {selectedDayEvents.map((event) => (
                            <li key={event.id} className="group flex items-center justify-between p-3 rounded-md bg-secondary text-sm">
                               <div className="flex items-center gap-2">
                                 <span className="font-bold">{event.time}</span> - {event.decryptedTitle || "Cargando..."}
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs break-all">
                                        <p className="text-xs text-muted-foreground">Dato Encriptado:</p>
                                        <p>{event.title}</p>
                                    </TooltipContent>
                                </Tooltip>
                               </div>
                               <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                               >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Eliminar evento</span>
                               </Button>
                            </li>
                        ))}
                    </ul>
                </TooltipProvider>
            ) : (
                <p className="text-sm text-muted-foreground text-center sm:text-left pt-2">No hay eventos programados para este día.</p>
            )}
            {!encryptionKey && <p className="text-xs text-destructive text-center mt-2">La clave de encriptación no está disponible. Por favor, vuelve a iniciar sesión.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
