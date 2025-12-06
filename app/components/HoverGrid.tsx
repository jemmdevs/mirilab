'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './hover-grid.css';
import './intro-text.css';

// Content data for lazy loading management
const contentData = [
    { id: 'content-1', bg: 'bg-1', images: ['/media/1.jpg', '/media/2.jpg', '/media/3.jpg'] },
    { id: 'content-2', bg: 'bg-2', images: ['/media/4.jpg', '/media/5.jpg', '/media/6.jpg'] },
    { id: 'content-3', bg: 'bg-3', images: ['/media/7.jpg', '/media/8.jpg', '/media/9.jpg'] },
    { id: 'content-4', bg: 'bg-4', images: ['/media/10.jpg', '/media/11.jpg', '/media/12.jpg'] },
    { id: 'content-5', bg: 'bg-5', images: ['/media/13.jpg', '/media/14.jpg', '/media/15.jpg'] },
];

const bgData = [
    { id: 'bg-1', src: '/media/beige1.jpg' },
    { id: 'bg-2', src: '/media/red1.jpg' },
    { id: 'bg-3', src: '/media/pink.jpg' },
    { id: 'bg-4', src: '/media/beige2.jpg' },
    { id: 'bg-5', src: '/media/red2.jpg' },
];

// Lazy image component that only loads when activated
function LazyBgImage({
    id,
    src,
    isActive
}: {
    id: string;
    src: string;
    isActive: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (isActive && !shouldLoad) {
            setShouldLoad(true);
        }
    }, [isActive, shouldLoad]);

    useEffect(() => {
        if (shouldLoad && !loaded) {
            const img = new Image();
            img.onload = () => setLoaded(true);
            img.src = src;
        }
    }, [shouldLoad, src, loaded]);

    return (
        <div
            id={id}
            className="background__image"
            style={{
                backgroundImage: loaded ? `url(${src})` : 'none',
            }}
        />
    );
}

// Lazy content image
function LazyContentImage({
    src,
    className,
    dataDir,
    isActive
}: {
    src: string;
    className: string;
    dataDir: string;
    isActive: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (isActive && !shouldLoad) {
            setShouldLoad(true);
        }
    }, [isActive, shouldLoad]);

    useEffect(() => {
        if (shouldLoad && !loaded) {
            const img = new Image();
            img.onload = () => setLoaded(true);
            img.src = src;
        }
    }, [shouldLoad, src, loaded]);

    return (
        <div className={`content__img ${className}`} data-dir={dataDir}>
            <div
                className="content__img-inner"
                style={{ backgroundImage: loaded ? `url(${src})` : 'none' }}
            />
        </div>
    );
}

export default function HoverGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeContent, setActiveContent] = useState<string | null>(null);
    const [preloadedSections, setPreloadedSections] = useState<Set<string>>(new Set());

    // Preload first section after mount for better UX
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreloadedSections(new Set(['content-1']));
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Selecting DOM elements within the component
        const workNav = container.querySelector('.frame__works');
        const workLinks = Array.from(workNav?.querySelectorAll('a') || []);
        const title = container.querySelector('.frame__title-main');
        const intro = container.querySelector('.frame__intro');
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

        // Utility function to toggle the display of works based on mouse events
        const toggleWork = (event: MouseEvent, isShowing: boolean) => {
            const target = event.target as HTMLAnchorElement;
            const href = target.getAttribute('href');
            if (!href) return;

            const contentId = href.replace('#', '');

            // Update active content for lazy loading
            if (isShowing) {
                setActiveContent(contentId);
                setPreloadedSections(prev => new Set([...prev, contentId]));
            } else {
                setActiveContent(null);
            }

            // Find content within the container
            const contentElement = container.querySelector(href) as HTMLElement;
            if (!contentElement) return;

            // Using the data-bg attribute to find the corresponding background element
            const bgId = contentElement.dataset.bg;
            const bgElement = container.querySelector(`#${bgId}`) as HTMLElement;

            // Selecting title and images within the content element
            const contentTitle = contentElement.querySelector('.content__title');
            const contentDesc1 = contentElement.querySelector('.content__desc1');
            const contentDesc2 = contentElement.querySelector('.content__desc2');
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
                    // Description paragraphs
                    .fromTo([contentDesc1, contentDesc2],
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power2.out' },
                        0.1)
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
                gsap.set([contentDesc1, contentDesc2], { opacity: 0 });
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

        // Fades out the video/title/intro when hovering over the navigation
        const handleNavMouseEnter = () => {
            gsap.killTweensOf([video, title, intro]);
            gsap.to([video, title, intro], {
                duration: 0.6,
                ease: 'power4',
                opacity: 0
            });
        };

        const handleNavMouseLeave = () => {
            gsap.killTweensOf([video, title, intro]);
            gsap.to([video, title, intro], {
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

    const isContentActive = (contentId: string) =>
        activeContent === contentId || preloadedSections.has(contentId);

    return (
        <div className="hover-grid-container" ref={containerRef}>
            <main>
                <div className="frame">
                    <nav className="frame__works">
                        <span>Recent works</span>
                        <a href="#content-1">Suno</a>
                        <a href="#content-2">Uber</a>
                        <a href="#content-3">Mystic Trails</a>
                        <a href="#content-4">Metamorph</a>
                        <a href="#content-5">Prismatics</a>
                    </nav>

                    <div className="frame__intro">
                        <p>Since 2024, I´ve been doing good shit.</p>
                    </div>

                    <h2 className="frame__title-main"><span>I make</span> <span>Interfaces</span></h2>
                    <div className="frame__content">
                        <div className="content text-pos-1" id="content-1" data-bg="bg-1">
                            <h2 className="content__title TitlePos-left">Suno</h2>
                            <p className="content__desc1 desc1Pos-top">Democratizing the music creation process with a prompt-to-song platform.</p>
                            <p className="content__desc2 desc2Pos-right">Product design, Brand, Engineering.</p>
                            <LazyContentImage src="/media/1.jpg" className="pos-right" dataDir="right" isActive={isContentActive('content-1')} />
                        </div>
                        <div className="content text-pos-2" id="content-2" data-bg="bg-2">
                            <h2 className="content__title TitlePos-bottom">Uber</h2>
                            <p className="content__desc1 desc1Pos-right">A long term partnership spanning  across virtually every product experience.</p>
                            <p className="content__desc2 desc2Pos-top">Product design, Engineering.</p>
                            <LazyContentImage src="/media/4.jpg" className="pos-top" dataDir="left" isActive={isContentActive('content-2')} />
                        </div>
                        <div className="content text-pos-1" id="content-3" data-bg="bg-3">
                            <h2 className="content__title TitlePos-bottom">Mystic Trails</h2>
                            <p className="content__desc1 desc1Pos-top">Nature photography capturing the unseen beauty of the wild.</p>
                            <p className="content__desc2 desc2Pos-top">Art direction for leading fashion brands, defining the trends of tomorrow.</p>
                            <LazyContentImage src="/media/7.jpg" className="pos-top" dataDir="right" isActive={isContentActive('content-3')} />
                        </div>
                        <div className="content text-pos-2" id="content-4" data-bg="bg-4">
                            <h2 className="content__title TitlePos-left">Metamorph</h2>
                            <p className="content__desc1 desc1Pos-right">Transforming ideas into digital reality through code.</p>
                            <p className="content__desc2 desc2Pos-bottom">Evolution of design systems and interactive components.</p>
                            <LazyContentImage src="/media/10.jpg" className="pos-right" dataDir="right" isActive={isContentActive('content-4')} />
                        </div>
                        <div className="content text-pos-1" id="content-5" data-bg="bg-5">
                            <h2 className="content__title TitlePos-right">Prismatics</h2>
                            <p className="content__desc1 desc1Pos-top">Refracting user attention into meaningful engagement.</p>
                            <p className="content__desc2 desc2Pos-top">A spectrum of possibilities in every digital interaction.</p>
                            <LazyContentImage src="/media/13.jpg" className="pos-left" dataDir="left" isActive={isContentActive('content-5')} />
                        </div>
                    </div>
                </div>
            </main>
            <div className="background">
                {bgData.map((bg, index) => (
                    <LazyBgImage
                        key={bg.id}
                        id={bg.id}
                        src={bg.src}
                        isActive={isContentActive(`content-${index + 1}`)}
                    />
                ))}
                <div
                    className="background__video"
                    style={{
                        zIndex: -1,
                        backgroundImage: 'url(/v1img.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </div>
        </div>
    );
}
