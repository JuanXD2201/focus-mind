
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';
import { AdminStats } from '@/components/admin-stats';
import { UserTable } from '@/components/user-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { collection, onSnapshot, Timestamp, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserData } from '@/components/user-table';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const allowedRoles: (string | null)[] = ['admin'];

export default function AdminPage() {
  const { role, loading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (loading) return; 

    if (role !== 'admin') {
      setUsersLoading(false);
      return;
    }
    
    setUsersLoading(true);
    const q = query(collection(db, "users"), orderBy("joined", "desc"), limit(5));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => {
            const data = doc.data();
            const joinedDate = data.joined instanceof Timestamp ? data.joined.toDate() : new Date();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                role: data.role,
                joined: joinedDate.toISOString()
            } as UserData;
        });
        setUsers(usersData);
        setUsersLoading(false);
    }, (error) => {
        setUsersLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
    });
    
    return () => unsubscribe();
    
  }, [role, loading]);

  if (loading || usersLoading) {
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
            <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Administración</h1>
            <p className="text-muted-foreground">Resumen de la plataforma y gestión de usuarios.</p>
        </div>
        <div className="space-y-8">
            <AdminStats />
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="font-headline">Usuarios Recientes</CardTitle>
                        <CardDescription>Un resumen de los últimos 5 usuarios registrados.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <Link href="/admin/users">
                            Gestionar Todos los Usuarios
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <UserTable users={users} onEdit={() => {}} onDelete={() => {}} canMutate={false} />
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}
