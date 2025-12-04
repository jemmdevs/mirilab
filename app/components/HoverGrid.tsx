'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './hover-grid.css';


export default function HoverGrid() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Selecting DOM elements within the component
        const workNav = container.querySelector('.frame__works');
        const workLinks = Array.from(workNav?.querySelectorAll('a') || []);
        const title = container.querySelector('.frame__title-main');
        const bgBase = container.querySelector('.background__base');

        if (!workNav || workLinks.length === 0) return;

        // Function to calculate clip-path values based on the direction attribute
        const getClipPath = (imageElement: HTMLElement) => {
            // Maps direction to corresponding polygon values for clip-path animation
            const clipPathDirections: Record<string, string> = {
                right: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                left: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
                top: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                bottom: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
            };

            // Direction to where to animate the content image (using clip-path)
            const imageDirection = imageElement.dataset.dir || 'right';

            // Use the direction to get the corresponding clip-path values, defaulting to full visibility if direction is unknown
            const clipPath = {
                from: clipPathDirections[imageDirection] || 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
            };

            return clipPath;
        };

        // Utility function to toggle the display of works based on mouse events
        const toggleWork = (event: MouseEvent, isShowing: boolean) => {
            const target = event.target as HTMLAnchorElement;
            const href = target.getAttribute('href');
            if (!href) return;

            // Find content within the container
            const contentElement = container.querySelector(href) as HTMLElement;
            if (!contentElement) return;

            // Using the data-bg attribute to find the corresponding background element
            const bgId = contentElement.dataset.bg;
            const bgElement = container.querySelector(`#${bgId}`) as HTMLElement;

            // Selecting title and images within the content element
            const contentTitle = contentElement.querySelector('.content__title');
            const contentImages = Array.from(contentElement.querySelectorAll('.content__img')) as HTMLElement[];
            const contentInnerImages = Array.from(contentElement.querySelectorAll('.content__img-inner'));

            // Store timelines on the element to kill them later
            const targetWithTl = target as any;

            // Cancel any ongoing animations to avoid conflicts
            if (targetWithTl.tlEnter) {
                targetWithTl.tlEnter.kill();
            }
            if (targetWithTl.tlLeave) {
                targetWithTl.tlLeave.kill();
            }

            // Check if we are showing or hiding the content
            if (isShowing) {
                // Make the content element visible and position it above others
                gsap.set(contentElement, { zIndex: 1, opacity: 1 });
                contentElement.classList.add('content--current');

                // Create and play the animation for showing content - ultra smooth entrance
                targetWithTl.tlEnter = gsap.timeline({
                    defaults: {
                        duration: 1.25,
                        ease: 'expo.out' // More organic, cinematic ease
                    }
                })
                    // Soft background fade
                    .to(bgElement, { opacity: 1, duration: 0.7, ease: 'sine.out' }, 0)
                    // Title with subtle entrance
                    .fromTo(contentTitle,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.95, ease: 'expo.out' },
                        0.05)
                    // Images: separate clip-path animation for smoothness
                    .fromTo(contentImages, {
                        clipPath: (index, target) => getClipPath(target)['from'],
                        opacity: 0
                    }, {
                        clipPath: (index, target) => getClipPath(target)['to'],
                        opacity: 1,
                        stagger: {
                            each: 0.08,
                            ease: 'power1.in'
                        },
                        duration: 1.0,
                        ease: 'power3.out' // Smooth deceleration for clip reveal
                    }, 0.08)
                    // Inner images: subtle zoom that follows the clip reveal
                    .fromTo(contentInnerImages,
                        { scale: 1.08 },
                        {
                            scale: 1,
                            stagger: {
                                each: 0.08,
                                ease: 'power1.in'
                            },
                            duration: 1.45,
                            ease: 'expo.out' // Long smooth deceleration
                        },
                        0.08);
            } else {
                // Instant hide - no animation to prevent flash/flicker when switching between items
                gsap.set(contentElement, { zIndex: 0, opacity: 0 });
                gsap.set(bgElement, { opacity: 0 });
                gsap.set(contentTitle, { opacity: 0 });
                gsap.set(contentImages, { clipPath: (index, target) => getClipPath(target)['from'] });
                contentElement.classList.remove('content--current');
            }
        };


        const showWork = (event: MouseEvent) => toggleWork(event, true);
        const hideWork = (event: MouseEvent) => toggleWork(event, false);

        // Shared state for coordinating hover transitions between links
        let activeLink: HTMLAnchorElement | null = null;
        let hideTimer: NodeJS.Timeout | null = null;
        const HIDE_DELAY = 80; // ms to wait before hiding, allows smooth transition between links

        // Initialize hover effects
        workLinks.forEach(workLink => {
            const handleMouseEnter = (event: Event) => {
                const target = event.target as HTMLAnchorElement;

                // Cancel any pending hide operation
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    hideTimer = null;
                }

                // If there's a different active link, hide it immediately
                if (activeLink && activeLink !== target) {
                    hideWork({ target: activeLink } as unknown as MouseEvent);
                }

                // Show the new content
                activeLink = target;
                showWork(event as MouseEvent);
            };

            const handleMouseLeave = (event: Event) => {
                const target = event.target as HTMLAnchorElement;

                // Only set up hide timer if this is the active link
                if (activeLink === target) {
                    // Delay hiding to allow mouse to move to adjacent link
                    hideTimer = setTimeout(() => {
                        // Only hide if no new link became active
                        if (activeLink === target) {
                            hideWork(event as MouseEvent);
                            activeLink = null;
                        }
                        hideTimer = null;
                    }, HIDE_DELAY);
                }
            };

            workLink.addEventListener('mouseenter', handleMouseEnter);
            workLink.addEventListener('mouseleave', handleMouseLeave);

            // Cleanup listeners
            (workLink as any)._cleanup = () => {
                workLink.removeEventListener('mouseenter', handleMouseEnter);
                workLink.removeEventListener('mouseleave', handleMouseLeave);
            };
        });

        // Fades out the video/title when hovering over the navigation
        const handleNavMouseEnter = () => {
            gsap.killTweensOf([bgBase, title]);
            gsap.to([bgBase, title], {
                duration: 0.6,
                ease: 'power4',
                opacity: 0
            });
        };

        const handleNavMouseLeave = () => {
            gsap.killTweensOf([bgBase, title]);
            gsap.to([bgBase, title], {
                duration: 0.6,
                ease: 'sine.in',
                opacity: 1
            });
        };

        workNav.addEventListener('mouseenter', handleNavMouseEnter);
        workNav.addEventListener('mouseleave', handleNavMouseLeave);

        return () => {
            // Cleanup
            workLinks.forEach(link => {
                if ((link as any)._cleanup) (link as any)._cleanup();
            });
            workNav.removeEventListener('mouseenter', handleNavMouseEnter);
            workNav.removeEventListener('mouseleave', handleNavMouseLeave);
        };
    }, []);

    return (
        <div className="hover-grid-container" ref={containerRef}>
            <main>
                <div className="frame">

                    <nav className="frame__works">
                        <span>Recent works</span>
                        <a href="#content-1">Herex Aether</a>
                        <a href="#content-2">Cosmics</a>
                        <a href="#content-3">Mystic Trails</a>
                        <a href="#content-4">Metamorph</a>
                        <a href="#content-5">Prismatics</a>
                    </nav>

                    <h2 className="frame__title-main"><span>I make</span> <span>Interfaces</span></h2>
                    <div className="frame__content">
                        <div className="content" id="content-1" data-bg="bg-1">
                            <h2 className="content__title">Herex Aether</h2>
                            <div className="content__img pos-1" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/1.jpg)' }}></div></div>
                            <div className="content__img pos-2" data-dir="left"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/2.jpg)' }}></div></div>
                            <div className="content__img pos-3" data-dir="top"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/3.jpg)' }}></div></div>
                        </div>
                        <div className="content" id="content-2" data-bg="bg-2">
                            <h2 className="content__title">Cosmics</h2>
                            <div className="content__img pos-4" data-dir="bottom"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/4.jpg)' }}></div></div>
                            <div className="content__img pos-5" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/5.jpg)' }}></div></div>
                            <div className="content__img pos-6" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/6.jpg)' }}></div></div>
                        </div>
                        <div className="content" id="content-3" data-bg="bg-3">
                            <h2 className="content__title">Mystic Trails</h2>
                            <div className="content__img pos-7" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/7.jpg)' }}></div></div>
                            <div className="content__img pos-8" data-dir="bottom"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/8.jpg)' }}></div></div>
                            <div className="content__img pos-9" data-dir="left"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/9.jpg)' }}></div></div>
                        </div>
                        <div className="content" id="content-4" data-bg="bg-4">
                            <h2 className="content__title">Metamorph</h2>
                            <div className="content__img pos-10" data-dir="left"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/10.jpg)' }}></div></div>
                            <div className="content__img pos-11" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/11.jpg)' }}></div></div>
                            <div className="content__img pos-12" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/12.jpg)' }}></div></div>
                        </div>
                        <div className="content" id="content-5" data-bg="bg-5">
                            <h2 className="content__title">Prismatics</h2>
                            <div className="content__img pos-13" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/13.jpg)' }}></div></div>
                            <div className="content__img pos-14" data-dir="bottom"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/14.jpg)' }}></div></div>
                            <div className="content__img pos-15" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/15.jpg)' }}></div></div>
                        </div>
                    </div>
                </div>
            </main>
            <div className="background">
                <div id="bg-1" className="background__image" style={{ backgroundImage: 'url(/media/beige1.jpg)' }}></div>
                <div id="bg-2" className="background__image" style={{ backgroundImage: 'url(/media/red1.jpg)' }}></div>
                <div id="bg-3" className="background__image" style={{ backgroundImage: 'url(/media/pink.jpg)' }}></div>
                <div id="bg-4" className="background__image" style={{ backgroundImage: 'url(/media/beige2.jpg)' }}></div>
                <div id="bg-5" className="background__image" style={{ backgroundImage: 'url(/media/red2.jpg)' }}></div>
                <img
                    className="background__base"
                    src="/imgbg.jpeg"
                    alt="Background"
                    style={{ zIndex: -1 }}
                />
            </div>
        </div>
    );
}
