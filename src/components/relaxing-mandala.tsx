
"use client";

import React, { useState } from 'react';

const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e", "#64748b", "#ffffff", "#000000"];

const MandalaSVG = ({ onFill }: { onFill: (color: string) => void }) => (
    <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <path id="petal" d="M 100 0 C 110 25, 110 75, 100 100 C 90 75, 90 25, 100 0 Z" />
        </defs>
        <g id="mandala-group" className="mandala-paths">
            {Array.from({ length: 12 }).map((_, i) => (
                <use key={`petal-outer-${i}`} href="#petal" transform={`rotate(${i * 30} 100 100) scale(0.9)`} onClick={() => onFill} className="fill-background stroke-foreground stroke-1 cursor-pointer hover:stroke-primary transition-all" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
                <use key={`petal-inner-${i}`} href="#petal" transform={`rotate(${i * 30 + 15} 100 100) scale(0.6)`} onClick={() => onFill} className="fill-background stroke-foreground stroke-1 cursor-pointer hover:stroke-primary transition-all" />
            ))}
            <circle cx="100" cy="100" r="40" onClick={() => onFill} className="fill-background stroke-foreground stroke-1 cursor-pointer hover:stroke-primary transition-all" />
            <circle cx="100" cy="100" r="20" onClick={() => onFill} className="fill-background stroke-foreground stroke-1 cursor-pointer hover:stroke-primary transition-all" />
        </g>
    </svg>
);


export function RelaxingMandala() {
    const [selectedColor, setSelectedColor] = useState('#3b82f6');
    const [history, setHistory] = useState<any[]>([]);

    const handlePathClick = (e: React.MouseEvent<SVGElement>) => {
        const path = e.target as SVGElement;
        if (path.classList.contains('fill-background')) {
            const prevState = path.getAttribute('fill');
            setHistory([...history, {element: path, color: prevState}]);
            path.style.fill = selectedColor;
            path.classList.remove('fill-background')
        }
    };
    
    const handleUndo = () => {
        if(history.length === 0) return;

        const lastAction = history[history.length-1];
        const {element, color} = lastAction;
        
        if (color) {
            element.style.fill = color;
        } else {
             element.style.fill = '';
             element.classList.add('fill-background');
        }

        setHistory(history.slice(0, -1));
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2 p-2 rounded-lg bg-secondary border mb-4">
                {colors.map(c => (
                    <button
                        key={c}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                        onClick={() => setSelectedColor(c)}
                        aria-label={`Select color ${c}`}
                    />
                ))}
                 <button onClick={handleUndo} className="px-4 py-1 rounded-md bg-secondary-foreground text-secondary">Deshacer</button>
            </div>
            <div onClick={(e: any) => handlePathClick(e)}>
                <MandalaSVG onFill={() => {}} />
            </div>
        </div>
    );
}
