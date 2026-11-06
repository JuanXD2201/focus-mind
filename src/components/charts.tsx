
"use client";

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { roleLabels } from './user-table';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { UserData } from './user-table';
import { useAuth } from '@/contexts/auth-context';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';

const ChartSkeleton = () => (
    <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
    </div>
);

export function UsersByRoleChart() {
    const { role } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (role !== 'admin') {
                setLoading(false);
                return;
            }
            setLoading(true);
            const usersCollection = collection(db, 'users');
            getDocs(usersCollection).then(userSnapshot => {
                const roleCounts = userSnapshot.docs.reduce((acc: any, doc) => {
                    const userRole = doc.data().role;
                    if (userRole) {
                        acc[userRole] = (acc[userRole] || 0) + 1;
                    }
                    return acc;
                }, {});

                const chartData = Object.entries(roleCounts).map(([roleKey, count]) => ({
                    name: roleLabels[roleKey as keyof typeof roleLabels] || roleKey,
                    usuarios: count,
                }));
                setData(chartData);
                setLoading(false);
            }).catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
                setLoading(false);
            });
        };

        fetchData();
    }, [role]);

    if (loading) return <ChartSkeleton />;

    if (role !== 'admin') {
         return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Distribución de Usuarios por Rol</CardTitle>
                    <CardDescription>Estadística solo disponible para Administradores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-10">No tienes permisos para ver estos datos.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Distribución de Usuarios por Rol</CardTitle>
                <CardDescription>Cantidad de usuarios en cada rol de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="usuarios" fill="hsl(var(--primary))" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}


export function UsersOverTimeChart() {
    const { role } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (role !== 'admin') {
                setLoading(false);
                return;
            }
            setLoading(true);

            const usersCollection = collection(db, 'users');
            getDocs(usersCollection).then(userSnapshot => {
                const users = userSnapshot.docs.map(doc => doc.data() as UserData);

                const signupsByMonth: { [key: string]: number } = users.reduce((acc: any, user: UserData) => {
                    if (user.joined) {
                        const date = user.joined instanceof Timestamp ? user.joined.toDate() : new Date(user.joined);
                        const month = format(date, 'yyyy-MM');
                        acc[month] = (acc[month] || 0) + 1;
                    }
                    return acc;
                }, {});

                const chartData = Object.keys(signupsByMonth).sort().map(month => ({
                    name: format(new Date(month + '-02'), 'MMM yy', {locale: es}),
                    nuevos_usuarios: signupsByMonth[month],
                }));
                
                setData(chartData);
                setLoading(false);
            }).catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
                setLoading(false);
            });
        };

        fetchData();
    }, [role]);

    if (loading) return <ChartSkeleton />;

    if (role !== 'admin') {
         return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Crecimiento de Usuarios</CardTitle>
                    <CardDescription>Estadística solo disponible para Administradores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-10">No tienes permisos para ver estos datos.</p>
                </CardContent>
            </Card>
        );
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Crecimiento de Usuarios</CardTitle>
                <CardDescription>Nuevos usuarios registrados a lo largo del tiempo.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="nuevos_usuarios" stroke="hsl(var(--primary))" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
