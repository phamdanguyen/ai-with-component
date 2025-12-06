
'use client';

import { useEffect, useState, useRef } from 'react';

interface SmoothTextProps {
    text: string;
    speed?: number; // ms per char
}

/**
 * SmoothText
 * 
 * Renders text with a typewriter effect to smooth out
 * high-speed network streaming chunks.
 */
export function SmoothText({ text, speed = 10 }: SmoothTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        // If text was reset (e.g. new chat), reset immediately
        if (text.length === 0) {
            setDisplayedText('');
            indexRef.current = 0;
            return;
        }

        // If we already displayed everything, do nothing
        if (indexRef.current === text.length) {
            return;
        }

        const animate = () => {
            // If we are behind the target text
            if (indexRef.current < text.length) {
                // Calculate how many chars to add to catch up
                // For very fast streams, we might want to add more than 1 char per frame
                // to prevent falling too far behind.
                const distance = text.length - indexRef.current;
                const step = Math.max(1, Math.ceil(distance / 5)); // Catch up faster if far behind

                indexRef.current = Math.min(text.length, indexRef.current + step);
                setDisplayedText(text.slice(0, indexRef.current));

                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [text, speed]);

    return <>{displayedText}</>;
}
