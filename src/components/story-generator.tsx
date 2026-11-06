
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { generateStory } from '@/ai/flows/story-flow';

export function StoryGenerator() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setStory('');
        try {
            const result = await generateStory(prompt);
            setStory(result);
        } catch (error) {
            console.error(error);
            setStory('Lo sentimos, ha ocurrido un error al generar el cuento.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
            <Textarea
                placeholder="Ej: Un gato que soñaba con ser astronauta..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Generando...' : 'Generar Cuento'}
            </Button>

            {(isLoading || story) && (
                 <Card className="mt-4">
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">La IA está escribiendo tu cuento...</p>
                            </div>
                        ) : (
                             <p className="text-sm whitespace-pre-wrap leading-relaxed">{story}</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
