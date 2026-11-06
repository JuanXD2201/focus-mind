
"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, Timestamp, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { roleLabels } from './user-table';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useAuth } from '@/contexts/auth-context';

export function ExportButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { role } = useAuth();

    const handleExport = async () => {
        if (role !== 'admin' && role !== 'data_analyst') {
            toast({
                variant: 'destructive',
                title: 'Permiso Denegado',
                description: 'No tienes permiso para exportar datos.',
            });
            return;
        }

        setIsLoading(true);
        
        try {
            const usersQuery = query(collection(db, 'users'));
            const querySnapshot = await getDocs(usersQuery);

            const usersData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const joinedDate = data.joined instanceof Timestamp ? data.joined.toDate() : new Date();

                return {
                    "Nombre": data.name,
                    "Correo Electrónico": data.email,
                    "Rol": roleLabels[data.role as keyof typeof roleLabels] || data.role,
                    "Fecha de Registro": format(joinedDate, 'yyyy-MM-dd HH:mm:ss'),
                };
            });

            if (usersData.length === 0) {
                toast({
                    title: 'No hay datos',
                    description: 'No hay usuarios para exportar.',
                });
                setIsLoading(false);
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(usersData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

            worksheet['!cols'] = [
                { wch: 25 },
                { wch: 30 },
                { wch: 20 },
                { wch: 20 },
            ];

            XLSX.writeFile(workbook, `Reporte_Usuarios_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

            toast({
                title: 'Exportación Exitosa',
                description: `${usersData.length} usuarios han sido exportados a Excel.`,
            });

        } catch (err) {
             if (err instanceof Error && err.message.includes("permission-denied")) {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' }));
             }
             toast({
                variant: 'destructive',
                title: 'Error de Exportación',
                description: 'No se pudieron obtener los datos. Verifica tus permisos.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Exportando...' : 'Exportar a Excel'}
        </Button>
    );
}
