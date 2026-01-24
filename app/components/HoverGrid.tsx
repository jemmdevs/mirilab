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

// Work items data for mobile scroll picker
const workItems = [
    { id: 'content-1', name: 'Alawal' },
    { id: 'content-2', name: 'Tousys' },
    { id: 'content-3', name: 'Aisac' },
    { id: 'content-4', name: 'Ikra' },
    { id: 'content-5', name: 'Doka' },
    { id: 'content-6', name: 'CasesST' },
    { id: 'content-7', name: 'NewFake' },
    { id: 'content-8', name: 'Makora' },
    { id: 'content-9', name: 'Josen' },
    { id: 'content-10', name: 'All Projects' },
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
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const mobileTitleRef = useRef<HTMLHeadingElement>(null);
    const mobileEndPhraseRef = useRef<HTMLDivElement>(null);
    const [activeContent, setActiveContent] = useState<string | null>(null);
    const [preloadedSections, setPreloadedSections] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);
    const [activeWorkIndex, setActiveWorkIndex] = useState(0);
    const [titleOpacity, setTitleOpacity] = useState(1);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Mobile scroll picker logic
    useEffect(() => {
        if (!isMobile || !mobileScrollRef.current) return;

        const scrollContainer = mobileScrollRef.current;
        const items = scrollContainer.querySelectorAll('.mobile-work-item');
        if (items.length === 0) return;

        let snapTimeout: NodeJS.Timeout | null = null;
        let currentActiveIndex = 0;

        const updateActiveItem = () => {
            // Use the actual screen center (50% of viewport height)
            const screenCenter = window.innerHeight / 2;

            let closestIndex = 0;
            let closestDistance = Infinity;

            items.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.top + itemRect.height / 2;
                const distance = Math.abs(screenCenter - itemCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            // Only act if closest distance is within a threshold
            // This allows the initial state to have no selection if the list is offset
            const selectionThreshold = 25;

            if (closestDistance < selectionThreshold) {
                currentActiveIndex = closestIndex;
                setActiveWorkIndex(closestIndex);
            } else {
                currentActiveIndex = -1;
                setActiveWorkIndex(-1);
            }

            // Calculate title opacity based on scroll position
            // The more we scroll, the more the title fades
            const scrollTop = scrollContainer.scrollTop;
            const maxScroll = 150; // Fade completely after 150px of scroll
            const opacity = Math.max(0, 1 - (scrollTop / maxScroll));
            setTitleOpacity(opacity);

            // End phrase scroll-linked animation - Apple-style
            if (mobileEndPhraseRef.current) {
                // We want it to appear when we are near the bottom
                // The "bottom" is defined by scrollHeight - clientHeight
                const maxScrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                const distToBottom = maxScrollHeight - scrollTop;

                // Show over the last 80px for smoother Apple-like reveal
                const fadeRange = 80;
                // Calculate progress: 0 when far, 1 when at bottom
                const progress = Math.max(0, Math.min(1, 1 - (distToBottom / fadeRange)));

                // Apple-style easing: ease-out cubic for smoother deceleration
                const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
                const easedProgress = easeOutCubic(progress);

                // Apple-style animation values
                const opacity = easedProgress;
                const translateY = 12 * (1 - easedProgress); // Subtle 12px movement
                const scale = 0.97 + (0.03 * easedProgress); // Scale from 0.97 to 1
                const blur = 8 * (1 - easedProgress); // Blur from 8px to 0

                mobileEndPhraseRef.current.style.opacity = opacity.toString();
                mobileEndPhraseRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
                mobileEndPhraseRef.current.style.filter = `blur(${blur}px)`;
            }
        };

        // Use native scroll - much smoother on mobile
        const handleScroll = () => {
            updateActiveItem();
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

        // Initial update
        updateActiveItem();

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            if (snapTimeout) {
                clearTimeout(snapTimeout);
            }
        };
    }, [isMobile]);

    // Preload first section after mount for better UX
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreloadedSections(new Set(['content-1']));
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Desktop hover effects only - skip on mobile
        if (!containerRef.current || isMobile) return;

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
                        duration: 0.7,
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
        let videoFadeTimer: NodeJS.Timeout | null = null;
        const HIDE_DELAY = 80; // ms to wait before hiding, allows smooth transition between links

        // Fade video/title/intro - called when hovering links, not the container
        const fadeOutVideoTitleIntro = () => {
            if (videoFadeTimer) {
                clearTimeout(videoFadeTimer);
                videoFadeTimer = null;
            }
            gsap.killTweensOf([video, title, intro]);
            gsap.to([video, title, intro], {
                duration: 0.6,
                ease: 'power4',
                opacity: 0
            });
        };

        const fadeInVideoTitleIntro = () => {
            // Delay the fade in to allow smooth transition between links
            videoFadeTimer = setTimeout(() => {
                gsap.killTweensOf([video, title, intro]);
                gsap.to([video, title, intro], {
                    duration: 0.6,
                    ease: 'sine.in',
                    opacity: 1
                });
                videoFadeTimer = null;
            }, HIDE_DELAY);
        };

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

                // Show the new content and fade out video/title/intro
                activeLink = target;
                showWork(event as MouseEvent);
                fadeOutVideoTitleIntro();
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

                    // Also fade in video/title/intro with delay
                    fadeInVideoTitleIntro();
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

        return () => {
            // Cleanup
            workLinks.forEach(link => {
                if ((link as any)._cleanup) (link as any)._cleanup();
            });
            if (videoFadeTimer) {
                clearTimeout(videoFadeTimer);
            }
        };
    }, [isMobile]);

    const isContentActive = (contentId: string) =>
        activeContent === contentId || preloadedSections.has(contentId);

    return (
        <div className="hover-grid-container" ref={containerRef}>
            <main>
                <div className="frame">
                    {/* Desktop navigation */}
                    {!isMobile && (
                        <nav className="frame__works">
                            <span>Recent works</span>
                            <a href="#content-1">Alawal</a>
                            <a href="#content-2">Tousys</a>
                            <a href="#content-3">Aisac</a>
                            <a href="#content-4">Ikra</a>
                            <a href="#content-5">Doka</a>
                            <a href="#content-6">CasesST</a>
                            <a href="#content-7">NewFake</a>
                            <a href="#content-8">Makora</a>
                            <a href="#content-9">Josen</a>
                            <a href="#content-10">All Projects</a>
                        </nav>
                    )}

                    {/* Mobile scroll picker */}
                    {isMobile && (
                        <>
                            <div
                                ref={mobileScrollRef}
                                className="mobile-scroll-picker"
                            >
                                <div className="mobile-scroll-spacer" />
                                {workItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`mobile-work-item ${index === activeWorkIndex ? 'active' : 'inactive'}`}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                                <div className="mobile-scroll-spacer" />
                            </div>
                            <div
                                ref={mobileEndPhraseRef}
                                className="mobile-end-phrase"
                            >
                                Since 2024, I´ve been making good shit.
                            </div>
                        </>
                    )}

                    <div className="frame__intro">
                        <p>Since 2024, I´ve been doing good shit.</p>
                    </div>

                    <h2
                        ref={isMobile ? mobileTitleRef : null}
                        className="frame__title-main"
                        style={isMobile ? { opacity: titleOpacity, transition: 'opacity 0.15s ease-out' } : undefined}
                    >
                        <span>I make</span> <span>Interfaces</span>
                    </h2>
                    <div className="frame__content">
                        <div className="content text-pos-1" id="content-1" data-bg="bg-1">
                            <h2 className="content__title TitlePos-left">Alawal</h2>
                            <p className="content__desc1 desc1Pos-top">Democratizing the music creation process with a prompt-to-song platform.</p>
                            <p className="content__desc2 desc2Pos-right">Product design, Brand, Engineering.</p>
                            <LazyContentImage src="/media/1.jpg" className="pos-right" dataDir="top" isActive={isContentActive('content-1')} />
                        </div>
                        <div className="content text-pos-2" id="content-2" data-bg="bg-2">
                            <h2 className="content__title TitlePos-bottom">Tousys</h2>
                            <p className="content__desc1 desc1Pos-right">A long term partnership spanning  across virtually every product experience.</p>
                            <p className="content__desc2 desc2Pos-top">Product design, Engineering.</p>
                            <LazyContentImage src="/media/4.jpg" className="pos-top" dataDir="left" isActive={isContentActive('content-2')} />
                        </div>
                        <div className="content text-pos-2" id="content-3" data-bg="bg-3">
                            <h2 className="content__title TitlePos-right">Aisac</h2>
                            <p className="content__desc1 desc1Pos-left">Building a goals-based healthcare offering that feels deeply personal.</p>
                            <p className="content__desc2 desc2Pos-bottom">Product design, Engineering, Brand.</p>
                            <LazyContentImage src="/media/7.jpg" className="pos-left" dataDir="top" isActive={isContentActive('content-3')} />
                        </div>
                        <div className="content text-pos-1" id="content-4" data-bg="bg-4">
                            <h2 className="content__title TitlePos-left">Ikra</h2>
                            <p className="content__desc1 desc1Pos-top">Nature photography capturing the unseen beauty of the wild.</p>
                            <p className="content__desc2 desc2Pos-right">Art direction for leading fashion brands, defining the trends of tomorrow.</p>
                            <LazyContentImage src="/media/10.jpg" className="pos-right" dataDir="right" isActive={isContentActive('content-4')} />
                        </div>
                        <div className="content text-pos-1" id="content-5" data-bg="bg-5">
                            <h2 className="content__title TitlePos-bottom">Doka</h2>
                            <p className="content__desc1 desc1Pos-right">Refracting user attention into meaningful engagement.</p>
                            <p className="content__desc2 desc2Pos-top">A spectrum of possibilities in every digital interaction.</p>
                            <LazyContentImage src="/media/13.jpg" className="pos-top" dataDir="left" isActive={isContentActive('content-5')} />
                        </div>
                        <div className="content text-pos-2" id="content-6" data-bg="bg-3">
                            <h2 className="content__title TitlePos-right">CasesST</h2>
                            <p className="content__desc1 desc1Pos-left">Building a goals-based healthcare offering that feels deeply personal.</p>
                            <p className="content__desc2 desc2Pos-bottom">Product design, Engineering, Brand.</p>
                            <LazyContentImage src="/media/7.jpg" className="pos-left" dataDir="top" isActive={isContentActive('content-6')} />
                        </div>
                        <div className="content text-pos-1" id="content-7" data-bg="bg-4">
                            <h2 className="content__title TitlePos-left">NewFake</h2>
                            <p className="content__desc1 desc1Pos-top">Nature photography capturing the unseen beauty of the wild.</p>
                            <p className="content__desc2 desc2Pos-right">Art direction for leading fashion brands, defining the trends of tomorrow.</p>
                            <LazyContentImage src="/media/10.jpg" className="pos-right" dataDir="right" isActive={isContentActive('content-7')} />
                        </div>
                        <div className="content text-pos-1" id="content-8" data-bg="bg-5">
                            <h2 className="content__title TitlePos-bottom">Makora</h2>
                            <p className="content__desc1 desc1Pos-right">Refracting user attention into meaningful engagement.</p>
                            <p className="content__desc2 desc2Pos-top">A spectrum of possibilities in every digital interaction.</p>
                            <LazyContentImage src="/media/13.jpg" className="pos-top" dataDir="left" isActive={isContentActive('content-8')} />
                        </div>
                        <div className="content text-pos-2" id="content-9" data-bg="bg-3">
                            <h2 className="content__title TitlePos-right">Josen</h2>
                            <p className="content__desc1 desc1Pos-left">Building a goals-based healthcare offering that feels deeply personal.</p>
                            <p className="content__desc2 desc2Pos-bottom">Product design, Engineering, Brand.</p>
                            <LazyContentImage src="/media/7.jpg" className="pos-left" dataDir="top" isActive={isContentActive('content-9')} />
                        </div>
                        <div className="content text-pos-1" id="content-10" data-bg="bg-4">
                            <h2 className="content__title TitlePos-left">All Projects</h2>
                            <p className="content__desc1 desc1Pos-top">Nature photography capturing the unseen beauty of the wild.</p>
                            <p className="content__desc2 desc2Pos-right">Art direction for leading fashion brands, defining the trends of tomorrow.</p>
                            <LazyContentImage src="/media/10.jpg" className="pos-right" dataDir="right" isActive={isContentActive('content-10')} />
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
