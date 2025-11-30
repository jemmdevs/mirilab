'use client';

import React, { useState, useEffect } from 'react';

const cities = [
    { name: 'NYC', timezone: 'America/New_York' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo' },
    { name: 'Seville', timezone: 'Europe/Madrid' },
];

export default function Navbar() {
    const [currentCityIndex, setCurrentCityIndex] = useState(0);
    const [time, setTime] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Update time every second
        const updateTime = () => {
            const city = cities[currentCityIndex];
            const now = new Date();
            const formattedTime = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: city.timezone,
            }).format(now);
            setTime(`${city.name} ${formattedTime}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [currentCityIndex]);

    useEffect(() => {
        // Rotate city every 3 seconds
        const rotateInterval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentCityIndex((prev) => (prev + 1) % cities.length);
                setIsVisible(true);
            }, 500); // Wait for fade out
        }, 4000);

        return () => clearInterval(rotateInterval);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-[2000] text-white pointer-events-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Left: Menu Button */}
            <button
                className="pointer-events-auto relative w-[64px] h-[26px] rounded-full bg-white/10 border border-white/10 hover:border-white overflow-hidden flex items-center justify-center group transition-colors duration-300"
                style={{ backdropFilter: 'blur(1.4rem)' }}
                aria-label="Open the main navigation menu"
            >
                <span
                    className="absolute flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-[150%]"
                    style={{ fontSize: '12px', fontWeight: 350, lineHeight: '21px' }}
                >
                    Menu
                </span>
                <span
                    className="absolute flex items-center justify-center gap-1 transition-transform duration-300 translate-y-[150%] group-hover:translate-y-0"
                    style={{ fontSize: '12px', fontWeight: 350, lineHeight: '21px' }}
                >
                    <span>Close</span>
                    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                        <path d="M2.625 2.625L9.375 9.375" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2.625 9.375L9.375 2.625" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </span>
            </button>

            {/* Center: App Name */}
            <div className="absolute left-1/2 -translate-x-1/2 tracking-tight pointer-events-auto mix-blend-difference" style={{ fontSize: '24px', fontWeight: 400, lineHeight: 'normal' }}>
                Mirilab
            </div>

            {/* Right: Time & Contact */}
            <div className="flex items-center gap-6 pointer-events-auto">
                {/* Rotating Time */}
                <div
                    className={`text-sm font-medium transition-opacity duration-500 min-w-[100px] text-right ${isVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {time}
                </div>

                {/* Get in Touch Button */}
                <a
                    href="mailto:contact@mirilab.com"
                    className="group relative flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 hover:border-white rounded-full h-[26px] w-[32px] hover:w-[115px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden"
                >
                    <div className="flex items-center justify-center">
                        <span className="text-xs font-medium whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[100px] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
                            Get in touch
                        </span>
                        <div className="w-0 group-hover:w-2 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                        <svg
                            viewBox="0 0 10 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            className="flex-shrink-0"
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
