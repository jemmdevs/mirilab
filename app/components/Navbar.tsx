'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const cities = [
    { name: 'NYC', timezone: 'America/New_York' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo' },
    { name: 'Seville', timezone: 'Europe/Madrid' },
];

export default function Navbar() {
    const [currentCityIndex, setCurrentCityIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Update time every second
    useEffect(() => {
        const updateTime = () => {
            const city = cities[currentCityIndex];
            const now = new Date();
            const formattedTime = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: city.timezone,
            }).format(now);
            setCurrentTime(formattedTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [currentCityIndex]);

    // Rotate city every 4 seconds
    useEffect(() => {
        const rotateInterval = setInterval(() => {
            setCurrentCityIndex((prev) => (prev + 1) % cities.length);
        }, 4000);

        return () => clearInterval(rotateInterval);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 z-[2000] text-white pointer-events-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Left: Menu Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="pointer-events-auto relative w-[64px] h-[26px] rounded-full bg-white/10 border border-white/10 hover:border-white overflow-hidden flex items-center justify-center transition-colors duration-300"
                style={{ backdropFilter: 'blur(1.4rem)' }}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
                <span
                    className={`absolute flex items-center justify-center transition-transform duration-300 ${isMenuOpen ? '-translate-y-[150%]' : 'translate-y-0'}`}
                    style={{ fontSize: '12px', fontWeight: 350, lineHeight: '21px' }}
                >
                    Menu
                </span>
                <span
                    className={`absolute flex items-center justify-center gap-1 transition-transform duration-300 ${isMenuOpen ? 'translate-y-0' : 'translate-y-[150%]'}`}
                    style={{ fontSize: '12px', fontWeight: 350, lineHeight: '21px' }}
                >
                    <span>Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </span>
            </button>

            {/* Center: App Name */}
            <div className="absolute left-1/2 -translate-x-1/2 tracking-tight pointer-events-auto mix-blend-difference" style={{ fontSize: '24px', fontWeight: 400, lineHeight: 'normal' }}>
                Mirilab
            </div>

            {/* Right: Time & Contact */}
            <div className="flex items-center gap-6 pointer-events-auto">
                {/* Rotating City & Time */}
                <div
                    className="flex items-center gap-1.5 min-w-[115px] justify-end"
                    style={{ fontSize: '12px', fontWeight: 350, lineHeight: '14px' }}
                >
                    {/* City */}
                    <div className="relative overflow-hidden h-[14px]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={cities[currentCityIndex].name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                                className="block"
                            >
                                {cities[currentCityIndex].name}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Time */}
                    <div className="relative overflow-hidden h-[14px]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={`${currentCityIndex}-${currentTime}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                                className="block"
                            >
                                {currentTime}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Get in Touch Button */}
                <a
                    href="mailto:contact@mirilab.com"
                    className="group relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 hover:border-white rounded-full h-[26px] w-[26px] hover:w-[115px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden"
                >
                    {/* Text Container */}
                    <div className="absolute inset-0 pr-[26px] pl-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
                        <span className="text-xs font-medium whitespace-nowrap pr-1">
                            Get in touch
                        </span>
                    </div>

                    {/* Icon Container */}
                    <div className="absolute inset-y-0 right-0 w-[24px] flex items-center justify-center">
                        <svg
                            viewBox="0 0 10 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 flex-shrink-0"
                        >
                            <rect x="0.5" y="1" width="9" height="6" rx="0.5" stroke="currentColor" />
                            <path d="M0.5 1.5L4.4453 4.1302C4.7812 4.35413 5.2188 4.35413 5.5547 4.1302L9.5 1.5" stroke="currentColor" />
                        </svg>
                    </div>
                </a>
            </div>
        </nav>
    );
}
