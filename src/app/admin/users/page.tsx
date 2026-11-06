
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { UserTable, roleLabels } from '@/components/user-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { collection, onSnapshot, Timestamp, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/contexts/auth-context';
import type { UserData } from '@/components/user-table';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const allowedRoles: (string | null)[] = ['admin'];

export default function AdminUsersPage() {
    const { role, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [users, setUsers] = useState<UserData[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait until auth is resolved

        if (role === 'admin') {
            setLoading(true);
            const q = query(collection(db, "users"), orderBy("joined", "desc"));
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
                setLoading(false);
            }, (error) => {
                setLoading(false);
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
            });

            return () => unsubscribe();
        } else {
             setLoading(false);
        }
    }, [role, authLoading]);
    
    const handleOpenEditModal = (user: UserData) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteAlert = (user: UserData) => {
        setSelectedUser(user);
        setIsDeleteAlertOpen(true);
    }
    
    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        const userRef = doc(db, 'users', selectedUser.id);
        updateDoc(userRef, {
            name: selectedUser.name,
            role: selectedUser.role
        }).then(() => {
            toast({
                title: "Usuario Actualizado",
                description: `Los datos de ${selectedUser.name} han sido actualizados.`,
            });
            setIsEditModalOpen(false);
            setSelectedUser(null);
        }).catch(err => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: { name: selectedUser.name, role: selectedUser.role }
            }));
        });
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        const userRef = doc(db, "users", selectedUser.id);
        deleteDoc(userRef).then(() => {
            toast({
                title: "Usuario Eliminado",
                description: `El documento de ${selectedUser.name} ha sido eliminado de Firestore.`,
            });
        }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userRef.path,
                operation: 'delete'
            }));
        })
        .finally(() => {
            setIsDeleteAlertOpen(false);
            setSelectedUser(null);
        });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Edita o elimina usuarios de la plataforma.</p>
            </div>
            <div className="mb-4">
                <Input
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-full sm:max-w-sm"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Lista de Usuarios</CardTitle>
                    <CardDescription>
                        Un listado de todos los usuarios registrados en la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTable users={filteredUsers} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteAlert} canMutate={role === 'admin'} />
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario. El correo electrónico no se puede cambiar.
                    </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                <Input
                                    id="name"
                                    value={selectedUser.name}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Correo</Label>
                                <Input id="email" value={selectedUser.email} disabled className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Rol</Label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(value: UserRole) => setSelectedUser({ ...selectedUser, role: value })}
                                >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                        {Object.entries(roleLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <Button onClick={handleUpdateUser}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete User Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del usuario de la base de datos de Firestore, pero no eliminará su cuenta de autenticación de Firebase.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                        Sí, eliminar usuario
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
