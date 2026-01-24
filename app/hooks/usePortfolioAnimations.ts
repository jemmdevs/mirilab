'use client';

import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ANIMATION_SETTINGS, CLIP_PATH_DIRECTIONS, CLIP_PATH_VISIBLE } from '@/app/data/animation.config';

interface UsePortfolioAnimationsProps {
  containerRef: RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  setActiveContent: (id: string | null) => void;
  setPreloadedSections: (updater: (prev: Set<string>) => Set<string>) => void;
}

// Hook that handles all GSAP animation logic for desktop hover effects
export function usePortfolioAnimations({
  containerRef,
  isMobile,
  setActiveContent,
  setPreloadedSections,
}: UsePortfolioAnimationsProps) {
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
      // Direction to where to animate the content image (using clip-path)
      const imageDirection = imageElement.dataset.dir || 'right';

      // Use the direction to get the corresponding clip-path values, defaulting to full visibility if direction is unknown
      const clipPath = {
        from: CLIP_PATH_DIRECTIONS[imageDirection as keyof typeof CLIP_PATH_DIRECTIONS] || CLIP_PATH_VISIBLE,
        to: CLIP_PATH_VISIBLE,
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
        setPreloadedSections((prev) => new Set([...prev, contentId]));
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
      const targetWithTl = target as HTMLAnchorElement & {
        tlEnter?: gsap.core.Timeline;
        tlLeave?: gsap.core.Timeline;
      };

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
        targetWithTl.tlEnter = gsap
          .timeline({
            defaults: {
              duration: 1.25,
              ease: 'expo.out', // More organic, cinematic ease
            },
          })
          // Soft background fade
          .to(
            bgElement,
            {
              opacity: 1,
              duration: ANIMATION_SETTINGS.entrance.background.duration,
              ease: ANIMATION_SETTINGS.entrance.background.ease,
            },
            0
          )
          // Title with subtle entrance
          .fromTo(
            contentTitle,
            { opacity: 0, y: ANIMATION_SETTINGS.entrance.title.yOffset },
            {
              opacity: 1,
              y: 0,
              duration: ANIMATION_SETTINGS.entrance.title.duration,
              ease: ANIMATION_SETTINGS.entrance.title.ease,
            },
            ANIMATION_SETTINGS.entrance.title.delay
          )
          // Description paragraphs
          .fromTo(
            [contentDesc1, contentDesc2],
            { opacity: 0, y: ANIMATION_SETTINGS.entrance.descriptions.yOffset },
            {
              opacity: 1,
              y: 0,
              duration: ANIMATION_SETTINGS.entrance.descriptions.duration,
              stagger: ANIMATION_SETTINGS.entrance.descriptions.stagger,
              ease: ANIMATION_SETTINGS.entrance.descriptions.ease,
            },
            ANIMATION_SETTINGS.entrance.descriptions.delay
          )
          // Images: separate clip-path animation for smoothness
          .fromTo(
            contentImages,
            {
              clipPath: (index, target) => getClipPath(target)['from'],
              opacity: 0,
            },
            {
              clipPath: (index, target) => getClipPath(target)['to'],
              opacity: 1,
              stagger: {
                each: ANIMATION_SETTINGS.entrance.images.stagger,
                ease: 'power1.in',
              },
              duration: ANIMATION_SETTINGS.entrance.images.duration,
              ease: ANIMATION_SETTINGS.entrance.images.ease,
            },
            ANIMATION_SETTINGS.entrance.images.delay
          )
          // Inner images: subtle zoom that follows the clip reveal
          .fromTo(
            contentInnerImages,
            { scale: ANIMATION_SETTINGS.entrance.innerImages.scaleFrom },
            {
              scale: 1,
              stagger: {
                each: ANIMATION_SETTINGS.entrance.innerImages.stagger,
                ease: 'power1.in',
              },
              duration: ANIMATION_SETTINGS.entrance.innerImages.duration,
              ease: ANIMATION_SETTINGS.entrance.innerImages.ease,
            },
            ANIMATION_SETTINGS.entrance.innerImages.delay
          );
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
    const HIDE_DELAY = ANIMATION_SETTINGS.fade.hideDelay;

    // Fade video/title/intro - called when hovering links, not the container
    const fadeOutVideoTitleIntro = () => {
      if (videoFadeTimer) {
        clearTimeout(videoFadeTimer);
        videoFadeTimer = null;
      }
      gsap.killTweensOf([video, title, intro]);
      gsap.to([video, title, intro], {
        duration: ANIMATION_SETTINGS.fade.duration,
        ease: 'power4',
        opacity: 0,
      });
    };

    const fadeInVideoTitleIntro = () => {
      // Delay the fade in to allow smooth transition between links
      videoFadeTimer = setTimeout(() => {
        gsap.killTweensOf([video, title, intro]);
        gsap.to([video, title, intro], {
          duration: ANIMATION_SETTINGS.fade.duration,
          ease: 'sine.in',
          opacity: 1,
        });
        videoFadeTimer = null;
      }, HIDE_DELAY);
    };

    // Initialize hover effects
    workLinks.forEach((workLink) => {
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
      (workLink as HTMLAnchorElement & { _cleanup?: () => void })._cleanup = () => {
        workLink.removeEventListener('mouseenter', handleMouseEnter);
        workLink.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => {
      // Cleanup
      workLinks.forEach((link) => {
        const linkWithCleanup = link as Element & { _cleanup?: () => void };
        if (linkWithCleanup._cleanup) linkWithCleanup._cleanup();
      });
      if (videoFadeTimer) {
        clearTimeout(videoFadeTimer);
      }
    };
  }, [isMobile, containerRef, setActiveContent, setPreloadedSections]);
}
