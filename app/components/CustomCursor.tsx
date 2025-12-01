'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Center the cursor initially
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });

        const moveCursor = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: 'power2.out',
            });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check for interactive elements
            const isInteractive =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('pointer-events-auto');

            setIsHovering(!!isInteractive);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
            style={{
                width: '40px',
                height: '40px',
            }}
        >
            <svg
                className="absolute top-0 left-0 w-full h-full overflow-visible"
                viewBox="0 0 40 40"
            >
                {/* Ring (Blue, visible on hover) */}
                <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="#4F46E5" // Indigo-600, looks like a nice dark blue/purple
                    strokeWidth="1.5"
                    className={`transition-all duration-300 ease-out origin-center ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                />

                {/* Dot (White, shrinks on hover, mix-blend-difference) */}
                <circle
                    cx="20"
                    cy="20"
                    r={isHovering ? 3 : 5}
                    fill="white"
                    className="transition-all duration-300 ease-out origin-center"
                    style={{ mixBlendMode: 'difference' }}
                />
            </svg>
        </div>
    );
}
