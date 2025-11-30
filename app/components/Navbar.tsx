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
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-[2000] text-white pointer-events-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Left: Menu Button */}
            <button className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300" style={{ fontSize: '12px', fontWeight: 350, lineHeight: '21px' }}>
                Menu
            </button>

            {/* Center: App Name */}
            <div className="absolute left-1/2 -translate-x-1/2 tracking-tight pointer-events-auto mix-blend-difference" style={{ fontSize: '16px', fontWeight: 400, lineHeight: 'normal' }}>
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
                    className="group relative flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full h-10 w-[40px] hover:w-[130px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden"
                >
                    {/* Icon State */}
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>

                    {/* Text State */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-75">
                        <span className="text-xs font-medium whitespace-nowrap">
                            Get in touch
                        </span>
                    </div>
                </a>
            </div>
        </nav>
    );
}
