
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';

const CircleProgress = ({ progress }: { progress: number }) => {
    const strokeWidth = 10;
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg className="w-full h-full" viewBox="0 0 200 200">
            <circle
                className="text-secondary"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                cx="100"
                cy="100"
                r={radius}
            />
            <circle
                className="text-primary"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                cx="100"
                cy="100"
                r={radius}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
                transform="rotate(-90 100 100)"
            />
        </svg>
    );
};


export function PomodoroTimer() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [key, setKey] = useState(0); // Used to force re-render of progress

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(s => s - 1);
                } else if (minutes > 0) {
                    setMinutes(m => m - 1);
                    setSeconds(59);
                } else {
                     if (intervalRef.current) clearInterval(intervalRef.current);
                    // Timer finished
                    try {
                       new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3').play();
                   } catch(e) {
                       console.log("Failed to play sound");
                   }
                    if (isBreak) {
                        // Break finished, start new work session
                        resetTimer(25, false);
                    } else {
                        // Work session finished, start break
                        resetTimer(5, true);
                    }
                   
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
             if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, seconds, minutes, isBreak]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = (newMinutes: number, breakStatus: boolean) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsActive(false);
        setIsBreak(breakStatus);
        setMinutes(newMinutes);
        setSeconds(0);
        setKey(prevKey => prevKey + 1);
    };
    
    const fullTime = isBreak ? 5 * 60 : 25 * 60;
    const timePassed = fullTime - (minutes * 60 + seconds);
    const progress = (timePassed / fullTime) * 100;

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-xs text-center">
             <h3 className="text-xl font-semibold">{isBreak ? "¡Tiempo de Descanso!" : "¡A Concentrarse!"}</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
                 <CircleProgress key={key} progress={progress} />
                 <div className="absolute text-5xl font-bold font-mono text-primary z-10">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                 </div>
            </div>
            <div className="flex gap-4">
                <Button onClick={toggleTimer} size="lg" className="w-24">
                    {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    <span className="sr-only">{isActive ? 'Pausar' : 'Iniciar'}</span>
                </Button>
                <Button onClick={() => resetTimer(isBreak ? 5 : 25, isBreak)} variant="outline" size="lg" className="w-24">
                    <RefreshCw className="w-6 h-6" />
                    <span className="sr-only">Reiniciar</span>
                </Button>
            </div>
        </div>
    );
}
