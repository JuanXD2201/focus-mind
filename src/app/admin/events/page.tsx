
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { AdminEventsTable, type CalendarEvent } from '@/components/admin-events-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { collectionGroup, getDocs, doc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { decrypt } from '@/lib/crypto';
import { Input } from '@/components/ui/input';

interface User {
    id: string;
    name: string;
    email: string;
}

const allowedRoles: (string | null)[] = ['admin'];

export default function AdminEventsPage() {
    const { role, loading: authLoading, encryptionKey } = useAuth();
    const { toast } = useToast();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (authLoading) return;

        const fetchEvents = async () => {
            setLoading(true);
            const eventsQuery = collectionGroup(db, 'calendarEvents');
            getDocs(eventsQuery).then(async (querySnapshot) => {
                const eventsData: CalendarEvent[] = [];

                for (const eventDoc of querySnapshot.docs) {
                    const data = eventDoc.data();
                    const userRef = eventDoc.ref.parent.parent;

                    if (userRef) {
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            let decryptedTitle = "Contenido Encriptado";
                            const originalTitle = data.title;

                             if (encryptionKey && originalTitle && originalTitle.includes(':')) {
                                try {
                                    decryptedTitle = await decrypt(originalTitle, encryptionKey);
                                } catch (e) {
                                    console.error("Decryption failed for event:", eventDoc.id);
                                    decryptedTitle = "## Error de Desencriptación ##";
                                }
                            } else if (!originalTitle.includes(':')) {
                                decryptedTitle = originalTitle; // Not encrypted
                            }

                            eventsData.push({
                                id: eventDoc.id,
                                title: decryptedTitle,
                                encryptedTitle: originalTitle,
                                time: data.time,
                                date: (data.date as Timestamp).toDate(),
                                user: {
                                    id: userRef.id,
                                    name: userData.name,
                                    email: userData.email,
                                }
                            });
                        }
                    }
                }
                eventsData.sort((a, b) => b.date.getTime() - a.date.getTime());
                setEvents(eventsData);
                setLoading(false);
            }).catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'calendarEvents', operation: 'list' }));
                setLoading(false);
            });
        };
        
        if (allowedRoles.includes(role)) {
            fetchEvents();
        } else {
            setLoading(false);
        }
    }, [role, authLoading, encryptionKey]);

    const handleDeleteEvent = async (eventId: string, userId: string) => {
        const eventRef = doc(db, `users/${userId}/calendarEvents`, eventId);
        deleteDoc(eventRef).then(() => {
            toast({
                title: 'Evento Eliminado',
                description: 'El evento ha sido eliminado correctamente.'
            });
            setEvents(prevEvents => prevEvents.filter(event => !(event.id === eventId && event.user.id === userId)));
        }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: eventRef.path,
                operation: 'delete'
            }));
        });
    };
    
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
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
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Eventos</h1>
                <p className="text-muted-foreground">Visualiza y gestiona todos los eventos del calendario.</p>
            </div>
             <div className="mb-4">
                <Input
                    placeholder="Buscar por evento, nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-full sm:max-w-sm"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Todos los Eventos</CardTitle>
                    <CardDescription>
                        Listado de eventos registrados. Pasa el ratón sobre el icono de información para ver el dato encriptado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminEventsTable events={filteredEvents} loading={loading} onDelete={handleDeleteEvent} canDelete={true} />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
