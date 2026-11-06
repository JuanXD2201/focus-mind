
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Trash2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from './ui/progress';
import { encrypt, decrypt } from '@/lib/crypto';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface FocusItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Timestamp;
    decryptedText?: string;
}

interface FocusListProps {
    selectedDate: Date;
}

export function FocusList({ selectedDate }: FocusListProps) {
    const { user, encryptionKey } = useAuth();
    const [items, setItems] = useState<FocusItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user || !selectedDate) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const dayStart = new Date(new Date(selectedDate).setHours(0, 0, 0, 0));
        const dayEnd = new Date(new Date(selectedDate).setHours(23, 59, 59, 999));

        const q = query(
            collection(db, `users/${user.id}/focusItems`),
            where('createdAt', '>=', Timestamp.fromDate(dayStart)),
            where('createdAt', '<=', Timestamp.fromDate(dayEnd)),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FocusItem));
            
            const decryptedItems = await Promise.all(fetchedItems.map(async (item) => {
                if (!encryptionKey || !item.text || !item.text.includes(':')) {
                    return { ...item, decryptedText: item.text || '' };
                }
                try {
                    const decryptedText = await decrypt(item.text, encryptionKey);
                    return { ...item, decryptedText };
                } catch (e) {
                    console.error("Failed to decrypt item:", e);
                    return { ...item, decryptedText: "## Error de desencriptación ##" };
                }
            }));
            
            setItems(decryptedItems);
            setIsLoading(false);
        }, (error) => {
            setIsLoading(false);
            const permissionError = new FirestorePermissionError({
                path: `users/${user.id}/focusItems`,
                operation: 'list',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });

        return () => unsubscribe();
    }, [user, encryptionKey, selectedDate]);


    useEffect(() => {
       endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [items]);

    const handleToggle = (id: string, completed: boolean) => {
        if (!user) return;
        const itemRef = doc(db, `users/${user.id}/focusItems`, id);
        const updateData = { completed: !completed };
        updateDoc(itemRef, updateData).catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({
                path: itemRef.path,
                operation: 'update',
                requestResourceData: updateData
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim() && user && encryptionKey) {
            const creationDate = new Date(selectedDate);
            creationDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

            const encryptedText = await encrypt(newItem, encryptionKey);
            const data = {
                text: encryptedText,
                completed: false,
                createdAt: Timestamp.fromDate(creationDate),
            };
            
            addDoc(collection(db, `users/${user.id}/focusItems`), data)
             .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: `users/${user.id}/focusItems`,
                    operation: 'create',
                    requestResourceData: data,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });

            setNewItem('');
        }
    };

    const handleDeleteItem = (id: string) => {
        if (!user) return;
        const itemRef = doc(db, `users/${user.id}/focusItems`, id);
        deleteDoc(itemRef).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: itemRef.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const progress = items.length > 0 ? (items.filter(item => item.completed).length / items.length) * 100 : 0;
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
        <Card className="w-full relative overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline">Lista de Enfoque</CardTitle>
                <CardDescription>Tareas para el {format(selectedDate, 'PPP', { locale: es })}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="mb-4 space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">{Math.round(progress)}% completado</p>
                 </div>
                <div className="space-y-4">
                    {isLoading ? (
                         <p className="text-center text-muted-foreground py-4">Cargando...</p>
                    ) : items.length > 0 ? (
                         <TooltipProvider>
                            <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-md bg-secondary group transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            id={`item-${item.id}`}
                                            checked={item.completed}
                                            onCheckedChange={() => handleToggle(item.id, item.completed)}
                                            className="h-6 w-6 rounded-full"
                                        />
                                        <label
                                            htmlFor={`item-${item.id}`}
                                            className={`text-lg transition-all ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                                        >
                                            {item.decryptedText || '...'}
                                        </label>
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs break-all">
                                                <p className="text-xs text-muted-foreground">Dato Encriptado:</p>
                                                <p>{item.text}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                </div>
                            ))}
                            <div ref={endOfListRef} />
                            </div>
                        </TooltipProvider>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">{isToday ? "¡Añade tu primera tarea para hoy!" : "No hay tareas para este día."}</p>
                    )}
                </div>
                 <form onSubmit={handleAddItem} className="flex gap-2 mt-6">
                    <Input
                        placeholder="Añadir nueva tarea..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        className="bg-background/70"
                        disabled={!encryptionKey || isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!encryptionKey || isLoading}>
                        <Plus />
                    </Button>
                </form>
                {!encryptionKey && !isLoading && <p className="text-xs text-destructive text-center mt-2">La clave de encriptación no está disponible. Por favor, vuelve a iniciar sesión.</p>}
            </CardContent>
        </Card>
    );
}

