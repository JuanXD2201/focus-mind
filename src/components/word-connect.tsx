
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { connectWords } from '@/ai/flows/word-connect-flow';

export function WordConnect() {
    const [promptWord, setPromptWord] = useState('');
    const [userWords, setUserWords] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fetchNewWord = async () => {
        setIsLoading(true);
        setAnalysis('');
        setUserWords('');
        try {
            const { word } = await connectWords({ action: 'getWord' });
            setPromptWord(word ?? 'Creatividad');
        } catch (error) {
            console.error('Error fetching word:', error);
            setPromptWord('Creatividad');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewWord();
    }, []);

    const handleAnalyze = async () => {
        if (!userWords.trim()) return;
        setIsAnalyzing(true);
        setAnalysis('');
        try {
            const { interpretation } = await connectWords({
                action: 'interpret',
                promptWord,
                userWords,
            });
            setAnalysis(interpretation ?? '');
        } catch (error) {
            console.error('Error analyzing words:', error);
            setAnalysis('No se pudo analizar la conexión. Inténtalo de nuevo.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
            <Card className="text-center bg-secondary">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">{promptWord}</CardTitle>
                </CardHeader>
            </Card>

            <Textarea
                placeholder="Escribe palabras, ideas o sentimientos que esta palabra te inspira..."
                value={userWords}
                onChange={(e) => setUserWords(e.target.value)}
                rows={4}
                disabled={isLoading || !!analysis}
            />

            {!analysis ? (
                <Button onClick={handleAnalyze} disabled={isLoading || isAnalyzing || !userWords.trim()}>
                    {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analizar Conexión
                </Button>
            ) : (
                <Button onClick={fetchNewWord} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Nueva Palabra
                </Button>
            )}

            {(isAnalyzing || analysis) && (
                <Card>
                    <CardContent className="p-6">
                         {isAnalyzing ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Analizando tus ideas...</p>
                            </div>
                        ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{analysis}</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
