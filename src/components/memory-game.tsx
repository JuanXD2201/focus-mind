
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Brain, Heart, Star, Sun, Moon, Cloud, ThumbsUp, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const icons = [
    { icon: Brain, key: 'Brain' },
    { icon: Heart, key: 'Heart' },
    { icon: Star, key: 'Star' },
    { icon: Sun, key: 'Sun' },
    { icon: Moon, key: 'Moon' },
    { icon: Cloud, key: 'Cloud' },
    { icon: ThumbsUp, key: 'ThumbsUp' },
    { icon: Coffee, key: 'Coffee' },
];

const cardValues = [...icons, ...icons];

const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

interface CardType {
    id: number;
    Icon: React.ElementType;
    key: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const generateCards = (): CardType[] => {
    return shuffleArray(cardValues.map((item, index) => ({
        id: index,
        Icon: item.icon,
        key: item.key,
        isFlipped: false,
        isMatched: false,
    })));
};

export function MemoryGame() {
    const [cards, setCards] = useState<CardType[]>(generateCards());
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (flippedCards.length === 2) {
            setMoves(m => m + 1);
            const [firstCardIndex, secondCardIndex] = flippedCards;
            const firstCard = cards[firstCardIndex];
            const secondCard = cards[secondCardIndex];

            if (firstCard.key === secondCard.key) {
                setCards(prevCards => prevCards.map(card => 
                    card.key === firstCard.key ? { ...card, isMatched: true, isFlipped: true } : card
                ));
                 setFlippedCards([]);
            } else {
                 setTimeout(() => {
                    setCards(prevCards => prevCards.map((card, index) => 
                       (index === firstCardIndex || index === secondCardIndex) ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    }, [flippedCards, cards]);
    
    useEffect(() => {
        const allMatched = cards.every(card => card.isMatched);
        if (allMatched && cards.length > 0 && moves > 0) {
            setGameOver(true);
            toast({
                title: "¡Felicidades!",
                description: `Has completado el juego en ${moves} movimientos.`,
            });
        }
    }, [cards, moves, toast]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length < 2 && !cards[index].isFlipped && !gameOver) {
            setCards(prevCards => prevCards.map((card, i) => 
                i === index ? { ...card, isFlipped: true } : card
            ));
            setFlippedCards(prev => [...prev, index]);
        }
    };
    
    const restartGame = () => {
        setMoves(0);
        setGameOver(false);
        setFlippedCards([]);
        const newCards = generateCards();
        setCards(newCards.map(c => ({ ...c, isFlipped: true }))); // Show all cards briefly
        setTimeout(() => {
             setCards(newCards); // Flip them back
        }, 800)
    }
    
    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-4 gap-4 mb-4">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className="w-16 h-16 md:w-20 md:h-20 [perspective:1000px] cursor-pointer group"
                         onClick={() => handleCardClick(index)}
                    >
                         <div
                            className={cn(
                                "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                                { "[transform:rotateY(180deg)]": card.isFlipped }
                            )}
                        >
                            <div className="absolute w-full h-full [backface-visibility:hidden] bg-secondary rounded-lg flex items-center justify-center shadow-md group-hover:bg-primary/20 transition-colors"/>
                            <div className={cn(
                                "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 rounded-lg flex items-center justify-center shadow-inner",
                                {"bg-green-200/50 dark:bg-green-800/30": card.isMatched}
                                )}>
                                <card.Icon className={cn("text-primary h-8 w-8 md:h-10 md:w-10 transition-opacity", {"opacity-50": card.isMatched})} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="h-16 text-center my-4">
                <p className="font-bold text-lg mb-2">Movimientos: {moves}</p>
                {gameOver && (
                    <div className="text-xl font-bold text-primary animate-bounce">
                        ¡Juego Completado!
                    </div>
                )}
            </div>
            <Button onClick={restartGame}>
                {gameOver ? 'Jugar de Nuevo' : 'Reiniciar Juego'}
            </Button>
        </div>
    );
}

