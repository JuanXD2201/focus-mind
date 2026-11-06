
"use client";

import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Waves, Wind, Bird } from 'lucide-react';

const sounds = [
    { name: 'Olas', icon: <Waves />, url: 'https://cdn.pixabay.com/audio/2023/09/21/audio_586a5518b5.mp3' },
    { name: 'Viento', icon: <Wind />, url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_51c62e6727.mp3' },
    { name: 'Pájaros', icon: <Bird />, url: 'https://cdn.pixabay.com/audio/2022/05/23/audio_8233f52482.mp3' }
];

export function RelaxingSounds() {
    const [currentSound, setCurrentSound] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = (url: string) => {
        if (currentSound === url) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentSound(url);
            setIsPlaying(true);
        }
    };
    
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
                {sounds.map(sound => (
                    <Button
                        key={sound.name}
                        variant={currentSound === sound.url ? 'secondary' : 'outline'}
                        size="lg"
                        className="flex flex-col h-24 w-24 gap-2"
                        onClick={() => togglePlay(sound.url)}
                    >
                        <div className="w-8 h-8">{sound.icon}</div>
                        <span>{sound.name}</span>
                    </Button>
                ))}
            </div>
            {currentSound && (
                <audio
                    ref={audioRef}
                    src={currentSound}
                    autoPlay
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            )}
        </div>
    );
}

