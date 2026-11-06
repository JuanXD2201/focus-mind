
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';
import type { UserRole } from '@/contexts/auth-context';

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    joined: string | any; // ISO string or Firestore Timestamp
}

interface UserTableProps {
    users: UserData[];
    onEdit: (user: UserData) => void;
    onDelete: (user: UserData) => void;
    canMutate: boolean;
}

export const roleLabels: Record<UserRole, string> = {
    user: 'Usuario',
    admin: 'Admin',
    supervisor: 'Supervisor',
    content_manager: 'Gestor de Contenido',
    data_analyst: 'Analista de Datos',
};


export function UserTable({ users, onEdit, onDelete, canMutate }: UserTableProps) {
    const usersToDisplay = users;

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden md:table-cell">Correo Electrónico</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="hidden lg:table-cell">Se unió</TableHead>
                        {canMutate && (
                             <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {usersToDisplay.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {roleLabels[user.role] || 'Usuario'}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                {format(new Date(user.joined), 'PPP', { locale: es })}
                            </TableCell>
                            {canMutate && onEdit && onDelete && (
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => onEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onDelete(user)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                             )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
