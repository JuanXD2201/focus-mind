
"use client"

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { Trash2, Info } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useAuth } from '@/contexts/auth-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface User {
    id: string;
    name: string;
    email: string;
}

export interface CalendarEvent {
  id: string;
  title: string; // Decrypted title
  encryptedTitle: string; // Original encrypted title
  time: string;
  date: Date;
  user: User;
}

interface AdminEventsTableProps {
  events: CalendarEvent[];
  loading: boolean;
  onDelete: (eventId: string, userId: string) => void;
  canDelete?: boolean;
}

export function AdminEventsTable({ events, loading, onDelete, canDelete = false }: AdminEventsTableProps) {
    const { role } = useAuth();
    const canPerformActions = role === 'admin';

    if (loading) {
        return <p>Cargando eventos...</p>;
    }

    return (
        <TooltipProvider>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead className="hidden sm:table-cell">Correo</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead className="hidden md:table-cell">Fecha</TableHead>
                            <TableHead className="hidden lg:table-cell">Hora</TableHead>
                            {canPerformActions && canDelete && (
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={`${event.user.id}-${event.id}`}>
                                <TableCell className="font-medium">{event.user.name}</TableCell>
                                <TableCell className="text-muted-foreground hidden sm:table-cell">{event.user.email}</TableCell>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <span>{event.title}</span>
                                        {role === 'admin' && event.encryptedTitle && event.encryptedTitle.includes(':') && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs break-all">
                                                    <p className="text-xs text-muted-foreground">Dato Encriptado:</p>
                                                    <p>{event.encryptedTitle}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                    {format(event.date, 'PPP', { locale: es })}
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden lg:table-cell">{event.time}</TableCell>
                                {canPerformActions && canDelete && (
                                    <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Esto eliminará permanentemente el evento del calendario del usuario.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(event.id, event.user.id)} className="bg-destructive hover:bg-destructive/90">
                                                Sí, eliminar evento
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
