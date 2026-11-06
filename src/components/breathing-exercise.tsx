
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function BreathingExercise() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [text, setText] = useState("Comenzar");
    const cycleDuration = 12000; // 4s in, 4s hold, 4s out

    useEffect(() => {
        let textTimer: NodeJS.Timeout;
        if (isAnimating) {
            const sequence = () => {
                setText("Inhala...");
                textTimer = setTimeout(() => setText("Sostén..."), 4000);
                textTimer = setTimeout(() => setText("Exhala..."), 8000);
            };
            sequence(); // Initial run
            const interval = setInterval(sequence, cycleDuration);
            return () => {
                clearTimeout(textTimer);
                clearInterval(interval);
            };
        } else {
            setText("Comenzar");
        }
    }, [isAnimating]);


    return (
        <div className="flex flex-col items-center justify-center gap-8 p-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                    className={cn(
                        "absolute w-full h-full bg-primary/20 rounded-full transition-transform ease-in-out",
                        isAnimating ? "scale-125 duration-[4000ms]" : "scale-75 duration-1000"
                    )}
                />
                <div className={cn(
                    "absolute w-full h-full bg-primary/30 rounded-full transition-transform ease-in-out",
                     isAnimating ? "scale-100 duration-[4000ms]" : "scale-50 duration-1000",
                     "animation-delay-100"
                )}
                />
                <div className="z-10 text-xl font-semibold text-primary-foreground bg-primary p-6 rounded-full shadow-lg min-w-[100px] text-center">
                    {text}
                </div>
            </div>
            <Button onClick={() => setIsAnimating(!isAnimating)} className="w-32">
                {isAnimating ? "Detener" : "Iniciar"}
            </Button>
        </div>
    );
}
