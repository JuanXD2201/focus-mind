
"use client";

import React, { useState } from 'react';
import { generateMeditation } from '@/ai/flows/meditation-flow';
import { Button } from './ui/button';
import { Loader2, Mic, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

export function GuidedMeditation() {
    const [audio, setAudio] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const { toast } = useToast();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast({
                variant: 'destructive',
                title: 'Tema vacío',
                description: 'Por favor, introduce un tema para tu meditación.',
            });
            return;
        }

        setIsLoading(true);
        setAudio(null);
        try {
            const response = await generateMeditation(`una meditación guiada de 2 minutos sobre: "${topic}"`);
            if (response.audioDataUri) {
                setAudio(response.audioDataUri);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudo generar el audio de la meditación.',
                });
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Ocurrió un error al generar la meditación. Inténtalo de nuevo.',
            });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 w-full max-w-md">
            {!audio && (
                 <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-center gap-2">
                           <Sparkles className="w-6 h-6 text-primary" />
                           Meditación a tu Medida
                        </CardTitle>
                        <CardDescription>
                            Escribe un tema y la IA creará una sesión de meditación solo para ti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                            <Input 
                                placeholder="Ej: Superar la ansiedad..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                     <>
                                        <Mic className="mr-2 h-4 w-4" />
                                        Crear Meditación
                                     </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                 </Card>
            )}
           
            {isLoading && !audio && (
                <div className="mt-6 flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">La IA está creando tu sesión...</p>
                </div>
            )}
            
            {audio && (
                <div className="w-full flex flex-col items-center gap-4">
                    <h3 className="text-lg font-semibold">Tu meditación sobre &ldquo;{topic}&rdquo; está lista.</h3>
                    <audio controls autoPlay src={audio} className="w-full max-w-md">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                    <Button onClick={() => { setAudio(null); setTopic(''); }} variant="outline">
                        Crear otra meditación
                    </Button>
                </div>
            )}
        </div>
    );
}

