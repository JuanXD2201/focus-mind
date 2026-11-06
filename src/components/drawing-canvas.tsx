
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Brush, Eraser, Trash2, Palette } from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e", "#64748b", "#000000", "#ffffff"];

export function DrawingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [isErasing, setIsErasing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = isErasing ? '#ffffff' : color;
                context.lineWidth = brushSize;
            }
        }
    }, [color, brushSize, isErasing]);

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            let x, y;
            if ('touches' in event) {
                x = event.touches[0].clientX - canvasRef.current!.offsetLeft;
                y = event.touches[0].clientY - canvasRef.current!.offsetTop;
            } else {
                x = event.nativeEvent.offsetX;
                y = event.nativeEvent.offsetY;
            }
            context.beginPath();
            context.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
             let x, y;
            if ('touches' in event) {
                x = event.touches[0].clientX - canvasRef.current!.offsetLeft;
                y = event.touches[0].clientY - canvasRef.current!.offsetTop;
            } else {
                x = event.nativeEvent.offsetX;
                y = event.nativeEvent.offsetY;
            }
            context.lineTo(x, y);
            context.stroke();
        }
    };

    const stopDrawing = () => {
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.closePath();
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };
    
    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        setIsErasing(false);
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full flex flex-wrap justify-center items-center gap-4 p-2 rounded-lg bg-secondary border mb-4">
                <Button onClick={() => setIsErasing(false)} variant={!isErasing ? 'secondary' : 'ghost'} size="icon" aria-label="Pincel">
                    <Brush />
                </Button>
                <Button onClick={() => setIsErasing(true)} variant={isErasing ? 'secondary' : 'ghost'} size="icon" aria-label="Goma de borrar">
                    <Eraser />
                </Button>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Grosor:</label>
                    <Slider
                        value={[brushSize]}
                        onValueChange={(value) => setBrushSize(value[0])}
                        min={1}
                        max={50}
                        step={1}
                        className="w-32"
                    />
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Paleta de colores">
                           <Palette />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-7 gap-1">
                            {colors.map(c => (
                                <button key={c} style={{ backgroundColor: c}} className="w-6 h-6 rounded-full border" onClick={() => handleColorChange(c)} />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                 <input type="color" value={color} onChange={(e) => handleColorChange(e.target.value)} className="w-10 h-10 bg-transparent border-none cursor-pointer" />
                <Button onClick={clearCanvas} variant="outline" size="icon" aria-label="Limpiar lienzo">
                    <Trash2 />
                </Button>
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border rounded-lg bg-white cursor-crosshair shadow-md"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
}
