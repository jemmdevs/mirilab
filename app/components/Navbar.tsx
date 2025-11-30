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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    className="group relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 hover:border-white rounded-full h-[26px] w-[26px] hover:w-[115px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden"
                >
                    {/* Text Container */}
                    <div className="absolute inset-0 pr-[26px] pl-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150 group-hover:duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
                        <span className="text-xs font-medium whitespace-nowrap pr-1">
                            Get in touch
                        </span>
                    </div>

                    {/* Icon Container */}
                    <div className="absolute inset-0 flex items-center justify-center group-hover:justify-end group-hover:pr-[7px]">
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
