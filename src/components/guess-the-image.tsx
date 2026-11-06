
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, RefreshCw } from 'lucide-react';
import { guessTheImage } from '@/ai/flows/image-game-flow';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function GuessTheImage() {
    const [imageData, setImageData] = useState<{imageUrl: string, subject: string, hint: string} | null>(null);
    const [guess, setGuess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const { toast } = useToast();

    const fetchNewImage = useCallback(async () => {
        setIsLoading(true);
        setIsCorrect(null);
        setGuess('');
        setImageData(null);
        try {
            const result = await guessTheImage();
            setImageData(result);
        } catch (error) {
            console.error('Error fetching image:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo generar una nueva imagen. Inténtalo de nuevo.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchNewImage();
    }, [fetchNewImage]);

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guess.trim() || !imageData) return;

        const correct = guess.trim().toLowerCase() === imageData.subject.toLowerCase();
        setIsCorrect(correct);
        
        toast({
            title: correct ? '¡Correcto!' : 'Inténtalo de nuevo',
            description: correct ? `¡Muy bien! La imagen era: ${imageData.subject}` : 'La respuesta no es correcta.',
            variant: correct ? 'default' : 'destructive',
        });
    };

    const showHint = () => {
        if (!imageData) return;
        toast({
            title: 'Pista',
            description: imageData.hint,
        });
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
            {isLoading ? (
                <div className="w-full h-80 flex flex-col items-center justify-center bg-muted rounded-lg">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Generando una imagen...</p>
                </div>
            ) : imageData && (
                <div className="w-full h-80 relative rounded-lg overflow-hidden border">
                    <Image src={imageData.imageUrl} alt="Imagen generada por IA para adivinar" layout="fill" objectFit="cover" />
                </div>
            )}
            
            {isCorrect === null && imageData && !isLoading && (
                 <form onSubmit={handleGuess} className="w-full flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="¿Qué ves en la imagen?"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="flex-grow"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="w-full sm:w-auto">Enviar</Button>
                        <Button type="button" variant="outline" onClick={showHint}>Pista</Button>
                    </div>
                </form>
            )}
            
             {(isCorrect !== null || isLoading) && (
                <Button onClick={fetchNewImage} className="w-full sm:w-auto" disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isLoading ? "Generando..." : "Jugar de Nuevo"}
                </Button>
             )}

        </div>
    );
}
