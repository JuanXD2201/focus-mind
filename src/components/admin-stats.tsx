
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, CalendarPlus, ListTodo, BookHeart, CheckSquare } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import { getCountFromServer, collection, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const allowedRoles = ['admin', 'data_analyst'];

export function AdminStats() {
    const { role, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalTasks: 0,
        totalGratitude: 0,
        totalHabits: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const usersCollection = collection(db, 'users');
                const eventsQuery = collectionGroup(db, 'calendarEvents');
                const tasksQuery = collectionGroup(db, 'focusItems');
                const gratitudeQuery = collectionGroup(db, 'gratitudeEntries');
                const habitsQuery = collectionGroup(db, 'habits');

                const [
                    userSnapshot,
                    eventSnapshot,
                    taskSnapshot,
                    gratitudeSnapshot,
                    habitSnapshot
                ] = await Promise.all([
                    getCountFromServer(usersCollection).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
                        return null;
                    }),
                    getCountFromServer(eventsQuery).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'calendarEvents', operation: 'list' }));
                        return null;
                    }),
                    getCountFromServer(tasksQuery).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'focusItems', operation: 'list' }));
                        return null;
                    }),
                    getCountFromServer(gratitudeQuery).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'gratitudeEntries', operation: 'list' }));
                        return null;
                    }),
                     getCountFromServer(habitsQuery).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'habits', operation: 'list' }));
                        return null;
                    })
                ]);

                setStats({
                    totalUsers: userSnapshot?.data().count ?? 0,
                    totalEvents: eventSnapshot?.data().count ?? 0,
                    totalTasks: taskSnapshot?.data().count ?? 0,
                    totalGratitude: gratitudeSnapshot?.data().count ?? 0,
                    totalHabits: habitSnapshot?.data().count ?? 0,
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && role && allowedRoles.includes(role)) {
          fetchStats();
        } else if (!authLoading) {
          setLoading(false);
        }
    }, [role, authLoading]);

    const statCards = [
        { title: 'Usuarios Totales', value: stats.totalUsers, icon: Users, description: 'Usuarios registrados en la plataforma.' },
        { title: 'Eventos Creados', value: stats.totalEvents, icon: CalendarPlus, description: 'Total de eventos en calendarios.' },
        { title: 'Tareas de Enfoque', value: stats.totalTasks, icon: ListTodo, description: 'Total de tareas en listas de enfoque.' },
        { title: 'Entradas de Gratitud', value: stats.totalGratitude, icon: BookHeart, description: 'Total de entradas en diarios de gratitud.' },
        { title: 'Hábitos Registrados', value: stats.totalHabits, icon: CheckSquare, description: 'Total de hábitos siendo rastreados.' },
    ];
    
    const showStats = !authLoading && role && allowedRoles.includes(role);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map(card => (
             <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-8 w-1/2" />
                    ) : (
                        <div className="text-2xl font-bold">{showStats ? card.value : '-'}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {showStats ? card.description : 'No tienes permisos para ver estos datos.'}
                    </p>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
