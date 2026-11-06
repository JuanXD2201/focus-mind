
"use client";

import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { encrypt } from '@/lib/crypto';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';

export function GratitudeJournal() {
    const { user, encryptionKey } = useAuth();
    const { toast } = useToast();
    const [entry, setEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!entry.trim() || !user) {
             toast({
                variant: 'destructive',
                title: 'Entrada Vacía',
                description: 'Por favor, escribe algo por lo que estés agradecido.',
            });
            return;
        }

        if (!encryptionKey) {
             toast({
                variant: 'destructive',
                title: 'Error de Seguridad',
                description: 'No se pudo encontrar la clave de encriptación. Por favor, inicia sesión de nuevo.',
            });
            return;
        }
        
        setIsLoading(true);
        try {
            const encryptedEntry = await encrypt(entry, encryptionKey);
            const data = {
                text: encryptedEntry,
                createdAt: serverTimestamp()
            };

            addDoc(collection(db, 'users', user.id, 'gratitudeEntries'), data)
                .then(() => {
                    toast({
                        title: 'Entrada Guardada',
                        description: '¡Gracias por tomarte el tiempo de reflexionar!',
                    });
                    setEntry('');
                })
                .catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: `users/${user.id}/gratitudeEntries`,
                        operation: 'create',
                        requestResourceData: data,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });

        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error de Encriptación',
                description: 'No se pudo encriptar la entrada.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-md">
            <Textarea
                placeholder="Escribe aquí tres cosas por las que te sientas agradecido/a hoy... (Tus datos están encriptados)"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                rows={5}
                disabled={!user || isLoading || !encryptionKey}
            />
            <Button onClick={handleSubmit} disabled={!user || isLoading || !encryptionKey}>
                {isLoading ? 'Guardando...' : 'Guardar Entrada'}
            </Button>
             {!encryptionKey && !isLoading && (
                 <p className="text-xs text-destructive text-center">No se puede guardar la entrada. Por favor, vuelve a iniciar sesión.</p>
            )}
        </div>
    );
}
