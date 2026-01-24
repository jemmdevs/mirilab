'use client';

import React, { useEffect, useRef, useState } from 'react';
import './hover-grid.css';
import './intro-text.css';

// Import centralized data
import { portfolioProjects, workItems, backgroundImages } from '@/app/data/portfolio.data';

// Import components
import { LazyBackgroundImage } from './portfolio/LazyBackgroundImage';
import { PortfolioContent } from './portfolio/PortfolioContent';
import { DesktopNavigation } from './portfolio/DesktopNavigation';
import { MobileScrollPicker } from './portfolio/MobileScrollPicker';

// Import hooks
import { useMobileDetection } from '@/app/hooks/useMobileDetection';
import { usePortfolioAnimations } from '@/app/hooks/usePortfolioAnimations';

export default function HoverGrid() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileTitleRef = useRef<HTMLHeadingElement>(null);

  // State
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [preloadedSections, setPreloadedSections] = useState<Set<string>>(new Set());
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(1);

  // Custom hooks
  const isMobile = useMobileDetection(768);

  // Animation hook handles all GSAP logic for desktop
  usePortfolioAnimations({
    containerRef,
    isMobile,
    setActiveContent,
    setPreloadedSections,
  });

  // Preload first section after mount for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloadedSections(new Set(['content-1']));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to check if content should be loaded
  const isContentActive = (contentId: string) =>
    activeContent === contentId || preloadedSections.has(contentId);

  return (
    <div className="hover-grid-container" ref={containerRef}>
      <main>
        <div className="frame">
          {/* Desktop navigation */}
          {!isMobile && <DesktopNavigation workItems={workItems} />}

          {/* Mobile scroll picker */}
          {isMobile && (
            <MobileScrollPicker
              workItems={workItems}
              activeWorkIndex={activeWorkIndex}
              setActiveWorkIndex={setActiveWorkIndex}
              setTitleOpacity={setTitleOpacity}
            />
          )}

          <div className="frame__intro">
            <p>Since 2024, I´ve been doing good shit.</p>
          </div>

          <h2
            ref={isMobile ? mobileTitleRef : null}
            className="frame__title-main"
            style={
              isMobile
                ? { opacity: titleOpacity, transition: 'opacity 0.15s ease-out' }
                : undefined
            }
          >
            <span>I make</span> <span>Interfaces</span>
          </h2>

          {/* Portfolio content - replaced 10 duplicated divs with a single map */}
          <div className="frame__content">
            {portfolioProjects.map((project) => (
              <PortfolioContent
                key={project.id}
                project={project}
                isActive={isContentActive(project.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Background images */}
      <div className="background">
        {backgroundImages.map((bg, index) => (
          <LazyBackgroundImage
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
