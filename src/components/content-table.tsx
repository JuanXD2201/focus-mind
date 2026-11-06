
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React from 'react';

export interface Activity {
    title: string;
    description: string;
    type: string;
    status: "Activo" | "Inactivo";
}

interface ContentTableProps {
    activities: Activity[];
}

export function ContentTable({ activities }: ContentTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead className="hidden md:table-cell">Descripción</TableHead>
                        <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.map((activity) => (
                        <TableRow key={activity.title}>
                            <TableCell className="font-medium">{activity.title}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{activity.description}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant="outline">{activity.type}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={activity.status === 'Activo' ? 'default' : 'destructive'} className={activity.status === 'Activo' ? 'bg-green-600' : ''}>
                                    {activity.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
