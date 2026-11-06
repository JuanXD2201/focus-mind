
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const TILE_COUNT = 9;
const GRID_SIZE = 3;
const IMAGE_URL = "https://picsum.photos/seed/puzzle/300/300";
const pieceSize = 100;

// Function to check if the puzzle is solvable
const isSolvable = (tiles: number[]) => {
    let inversions = 0;
    const flatTiles = tiles.filter(t => t !== TILE_COUNT -1);

    for (let i = 0; i < flatTiles.length - 1; i++) {
        for (let j = i + 1; j < flatTiles.length; j++) {
             if (flatTiles[i] > flatTiles[j]) {
                inversions++;
            }
        }
    }
     if (GRID_SIZE % 2 === 1) { // Odd grid
        return inversions % 2 === 0;
    } else { // Even grid
        const emptyRow = Math.floor(tiles.indexOf(TILE_COUNT - 1) / GRID_SIZE);
        return (inversions + emptyRow) % 2 === 1;
    }
};

// Function to shuffle the tiles until a solvable state is reached
const shuffleTiles = (): number[] => {
    let shuffledTiles: number[];
    do {
        shuffledTiles = [...Array(TILE_COUNT).keys()].sort(() => Math.random() - 0.5);
    } while (!isSolvable(shuffledTiles));
    return shuffledTiles;
};


export function SlidingPuzzle() {
    const [tiles, setTiles] = useState<number[]>([]);
    const [isStarted, setIsStarted] = useState(false);
    const [moveCount, setMoveCount] = useState(0);
    const [isSolved, setIsSolved] = useState(false);

    const startGame = () => {
        setTiles(shuffleTiles());
        setMoveCount(0);
        setIsStarted(true);
        setIsSolved(false);
    }
    
    // Use useEffect to prevent hydration mismatch errors by shuffling on the client side only
    useEffect(() => {
        startGame();
    }, []);

    const checkSolved = (currentTiles: number[]) => {
        for (let i = 0; i < TILE_COUNT; i++) {
            if (currentTiles[i] !== i) return false;
        }
        return true;
    }
    
    const moveTile = (tileIndex: number) => {
        if (!isStarted || isSolved) return;
        
        const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
        const tileRow = Math.floor(tileIndex / GRID_SIZE);
        const tileCol = tileIndex % GRID_SIZE;
        const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
        const emptyCol = emptyIndex % GRID_SIZE;

        const isAdjacent = (Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol)) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[tileIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[tileIndex]];
            setTiles(newTiles);
            setMoveCount(prev => prev + 1);
            if(checkSolved(newTiles)) {
                setIsSolved(true);
            }
        }
    };
    
    if (!isStarted) {
      return <div>Cargando puzzle...</div>
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative grid bg-muted rounded-lg overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${pieceSize}px)`,
                    width: `${GRID_SIZE * pieceSize}px`,
                    height: `${GRID_SIZE * pieceSize}px`
                }}
            >
                {tiles.map((tile, index) => {
                    const isEmpty = tile === TILE_COUNT - 1;
                    const originalRow = Math.floor(tile / GRID_SIZE);
                    const originalCol = tile % GRID_SIZE;
                    
                    return (
                        <div
                            key={index}
                            onClick={() => moveTile(index)}
                            className={cn(
                                "flex items-center justify-center transition-all duration-300 ease-in-out",
                                !isEmpty && "cursor-pointer hover:opacity-80 border border-background",
                                isSolved && !isEmpty && "border-2 border-primary"
                            )}
                            style={{
                                width: `${pieceSize}px`,
                                height: `${pieceSize}px`,
                                backgroundSize: `${GRID_SIZE * pieceSize}px ${GRID_SIZE * pieceSize}px`,
                                backgroundImage: isEmpty ? 'none' : `url(${IMAGE_URL})`,
                                backgroundPosition: `-${originalCol * pieceSize}px -${originalRow * pieceSize}px`,
                            }}
                            data-ai-hint="abstract pattern"
                        >
                        </div>
                    );
                })}
            </div>
             <div className="h-16 text-center">
                <p className="font-bold text-lg mb-2">Movimientos: {moveCount}</p>
                {isSolved && (
                    <p className="text-xl font-bold text-primary animate-pulse">¡Puzzle Resuelto!</p>
                )}
            </div>
            <Button onClick={startGame}>
                {isSolved ? 'Jugar de Nuevo' : 'Reiniciar'}
            </Button>
        </div>
    );
}
