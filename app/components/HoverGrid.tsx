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
        const video = container.querySelector('.background__video');

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

        // Utility function to toggle the display of work based on mouse events
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

                // Create and play the animation for showing content
                targetWithTl.tlEnter = gsap.timeline({
                    defaults: {
                        duration: 0.95,
                        ease: 'power4'
                    }
                })
                    .set(bgElement, { opacity: 1 })
                    .fromTo(contentTitle, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, 0)
                    .fromTo(contentImages, {
                        xPercent: () => gsap.utils.random(-10, 10),
                        yPercent: () => gsap.utils.random(-10, 10),
                        filter: 'brightness(300%)',
                        clipPath: (index, target) => getClipPath(target)['from']
                    }, {
                        xPercent: 0,
                        yPercent: 0,
                        filter: 'brightness(100%)',
                        clipPath: (index, target) => getClipPath(target)['to']
                    }, 0)
                    .fromTo(contentInnerImages, { scale: 1.5 }, { scale: 1 }, 0);
            } else {
                // Reset the z-index and prepare the content element for hiding
                gsap.set(contentElement, { zIndex: 0 });

                // Create and play the animation for hiding content
                targetWithTl.tlLeave = gsap.timeline({
                    defaults: {
                        duration: 0.7,
                        ease: 'power4'
                    },
                    onComplete: () => {
                        // Remove the visibility class once the animation completes
                        contentElement.classList.remove('content--current');
                    }
                })
                    .set(bgElement, { opacity: 0 }, 0.05)
                    .to(contentElement, { opacity: 0, duration: 0.35 }, 0.35)
                    .to(contentTitle, { opacity: 0 }, 0)
                    .to(contentImages, { clipPath: (index, target) => getClipPath(target)['from'] }, 0)
                    .to(contentInnerImages, { scale: 1.5 }, 0);
            }
        };

        const showWork = (event: MouseEvent) => toggleWork(event, true);
        const hideWork = (event: MouseEvent) => toggleWork(event, false);

        // Initialize hover effects
        workLinks.forEach(workLink => {
            let hoverTimer: NodeJS.Timeout;

            const handleMouseEnter = (event: Event) => {
                hoverTimer = setTimeout(() => showWork(event as MouseEvent), 30);
            };

            const handleMouseLeave = (event: Event) => {
                clearTimeout(hoverTimer);
                hideWork(event as MouseEvent);
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
            gsap.killTweensOf([video, title]);
            gsap.to([video, title], {
                duration: 0.6,
                ease: 'power4',
                opacity: 0
            });
        };

        const handleNavMouseLeave = () => {
            gsap.killTweensOf([video, title]);
            gsap.to([video, title], {
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
                        <a href="#content-2">Cosmic Silence</a>
                        <a href="#content-3">Mystic Trails</a>
                        <a href="#content-4">Metamorph</a>
                        <a href="#content-5">Prismatica</a>
                    </nav>

                    <h2 className="frame__title-main"><span>Studio</span> <span>Grafixo</span></h2>
                    <div className="frame__content">
                        <div className="content" id="content-1" data-bg="bg-1">
                            <h2 className="content__title">Herex Aether</h2>
                            <div className="content__img pos-1" data-dir="right"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/1.jpg)' }}></div></div>
                            <div className="content__img pos-2" data-dir="left"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/2.jpg)' }}></div></div>
                            <div className="content__img pos-3" data-dir="top"><div className="content__img-inner" style={{ backgroundImage: 'url(/media/3.jpg)' }}></div></div>
                        </div>
                        <div className="content" id="content-2" data-bg="bg-2">
                            <h2 className="content__title">Cosmic Silence</h2>
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
                            <h2 className="content__title">Prismatica</h2>
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
                <video autoPlay muted loop className="background__video">
                    <source src="/media/bg-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}
