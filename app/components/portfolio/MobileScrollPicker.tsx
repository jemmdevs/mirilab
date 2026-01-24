'use client';

import { useEffect, useRef } from 'react';
import type { WorkItem } from '@/app/types/portfolio.types';
import { MOBILE_SETTINGS } from '@/app/data/animation.config';

interface MobileScrollPickerProps {
  workItems: WorkItem[];
  activeWorkIndex: number;
  setActiveWorkIndex: (index: number) => void;
  setTitleOpacity: (opacity: number) => void;
}

// Mobile scroll picker component with Apple-style end phrase animation
export function MobileScrollPicker({
  workItems,
  activeWorkIndex,
  setActiveWorkIndex,
  setTitleOpacity,
}: MobileScrollPickerProps) {
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const mobileEndPhraseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileScrollRef.current) return;

    const scrollContainer = mobileScrollRef.current;
    const items = scrollContainer.querySelectorAll('.mobile-work-item');
    if (items.length === 0) return;


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
      if (closestDistance < MOBILE_SETTINGS.selectionThreshold) {
        setActiveWorkIndex(closestIndex);
      } else {
        setActiveWorkIndex(-1);
      }

      // Calculate title opacity based on scroll position
      // The more we scroll, the more the title fades
      const scrollTop = scrollContainer.scrollTop;
      const opacity = Math.max(0, 1 - (scrollTop / MOBILE_SETTINGS.titleFadeMaxScroll));
      setTitleOpacity(opacity);

      // End phrase scroll-linked animation - Apple-style
      if (mobileEndPhraseRef.current) {
        // We want it to appear when we are near the bottom
        // The "bottom" is defined by scrollHeight - clientHeight
        const maxScrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const distToBottom = maxScrollHeight - scrollTop;

        // Show over the last 80px for smoother Apple-like reveal
        const fadeRange = MOBILE_SETTINGS.endPhraseRange;
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
    };
  }, [setActiveWorkIndex, setTitleOpacity]);

  return (
    <>
      <div ref={mobileScrollRef} className="mobile-scroll-picker">
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
      <div ref={mobileEndPhraseRef} className="mobile-end-phrase">
        Since 2024, I´ve been making good shit.
      </div>
    </>
  );
}
