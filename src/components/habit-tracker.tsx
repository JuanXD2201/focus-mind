
"use client";

import React, { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';


interface Habit {
    id: string;
    text: string;
    completed: boolean;
    createdAt: any; // Firestore Timestamp
}

export function HabitTracker() {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setHabits([]);
            return;
        }
        
        setIsLoading(true);
        const q = query(collection(db, `users/${user.id}/habits`), orderBy("createdAt", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
            setIsLoading(false);
        }, (error) => {
            setIsLoading(false);
            const permissionError = new FirestorePermissionError({
                path: `users/${user.id}/habits`,
                operation: 'list',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });

        return () => unsubscribe();
    }, [user]);

    const handleToggle = async (id: string, completed: boolean) => {
        if (!user) return;
        const habitRef = doc(db, `users/${user.id}/habits`, id);
        await updateDoc(habitRef, { completed: !completed });
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabit.trim() && user) {
            await addDoc(collection(db, `users/${user.id}/habits`), {
                text: newHabit,
                completed: false,
                createdAt: new Date(),
            });
            setNewHabit('');
        }
    };
    
    const handleDeleteHabit = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.id}/habits`, id));
    }

    return (
        <div className="w-full max-w-md space-y-6">
             <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {isLoading ? (
                             <p className="text-center text-muted-foreground py-4">Cargando hábitos...</p>
                        ) : habits.length > 0 ? (
                            habits.map(habit => (
                                <div key={habit.id} className="flex items-center justify-between p-3 rounded-md bg-secondary transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={`habit-${habit.id}`}
                                            checked={habit.completed}
                                            onCheckedChange={() => handleToggle(habit.id, habit.completed)}
                                            className="h-5 w-5"
                                        />
                                        <Label htmlFor={`habit-${habit.id}`} className={`text-base ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                                            {habit.text}
                                        </Label>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                        <span className="sr-only">Eliminar hábito</span>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No hay hábitos. ¡Añade uno nuevo para empezar!</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleAddHabit} className="flex gap-2">
                <Input
                    placeholder="p. ej. Leer un capítulo"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                />
                <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                </Button>
            </form>
        </div>
    );
}
