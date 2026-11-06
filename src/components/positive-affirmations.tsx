
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

const affirmations = [
    "Creo en mi capacidad para tener éxito.",
    "Soy digno/a de amor, felicidad y éxito.",
    "Cada día me acerco más a mis metas.",
    "Tengo el poder de crear la vida que deseo.",
    "Acepto y amo quien soy.",
    "Mi mente está llena de pensamientos positivos y energía.",
    "Estoy abierto/a a nuevas y maravillosas oportunidades.",
    "Supero los desafíos con fuerza y resiliencia.",
    "Hoy elijo ser feliz y agradecido/a.",
    "Confío en mi intuición y tomo decisiones sabias."
];

const getRandomAffirmation = () => affirmations[Math.floor(Math.random() * affirmations.length)];

export function PositiveAffirmations() {
    const [affirmation, setAffirmation] = useState('');

    useEffect(() => {
        setAffirmation(getRandomAffirmation());
    }, []);

    const getNewAffirmation = () => {
        setAffirmation(getRandomAffirmation());
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md text-center">
            <Card className="w-full bg-secondary">
                <CardContent className="p-6">
                    <p className="text-xl font-semibold">{affirmation}</p>
                </CardContent>
            </Card>
            <Button onClick={getNewAffirmation}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Nueva Afirmación
            </Button>
        </div>
    );
}

    