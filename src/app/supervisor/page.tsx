
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { AdminEventsTable, type CalendarEvent } from '@/components/admin-events-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collectionGroup, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { decrypt } from '@/lib/crypto';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Input } from '@/components/ui/input';

const allowedRoles: (string | null)[] = ['supervisor', 'admin'];

export default function SupervisorPage() {
    const { role, loading: authLoading, encryptionKey } = useAuth();
    const { toast } = useToast();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const eventsQuery = collectionGroup(db, 'calendarEvents');
                const querySnapshot = await getDocs(eventsQuery);
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

                            // Only admins can decrypt the content
                            if (role === 'admin' && encryptionKey && originalTitle && originalTitle.includes(':')) {
                                try {
                                    decryptedTitle = await decrypt(originalTitle, encryptionKey);
                                } catch (e) {
                                    console.error("Decryption failed for event:", eventDoc.id);
                                    decryptedTitle = "## Error de Desencriptación ##";
                                }
                            } else if (role !== 'admin' && originalTitle && !originalTitle.includes(':')) {
                                // If user is not admin, but content is not encrypted, show it.
                                decryptedTitle = originalTitle;
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
            } catch (error) {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'calendarEvents', operation: 'list' }));
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && allowedRoles.includes(role)) {
            fetchEvents();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [role, authLoading, toast, encryptionKey]);

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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Supervisor</h1>
                <p className="text-muted-foreground">Visualiza todos los eventos del calendario de los usuarios (solo lectura).</p>
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
                        Listado de eventos registrados. El contenido solo se desencripta para administradores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminEventsTable events={filteredEvents} loading={loading} onDelete={() => {}} canDelete={false} />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
