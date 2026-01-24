'use client';

import type { PortfolioProject } from '@/app/types/portfolio.types';
import { LazyContentImage } from './LazyContentImage';

interface PortfolioContentProps {
  project: PortfolioProject;
  isActive: boolean;
}

// Reusable portfolio content component - replaces duplicated HTML
export function PortfolioContent({ project, isActive }: PortfolioContentProps) {
  const { id, title, desc1, desc2, imageSrc, bgId, layout } = project;

  return (
    <div className={`content ${layout.textPos}`} id={id} data-bg={bgId}>
      <h2 className={`content__title ${layout.titlePos}`}>{title}</h2>
      <p className={`content__desc1 ${layout.desc1Pos}`}>{desc1}</p>
      <p className={`content__desc2 ${layout.desc2Pos}`}>{desc2}</p>
      <LazyContentImage
        src={imageSrc}
        className={layout.imagePos}
        dataDir={layout.imageDir}
        isActive={isActive}
      />
    </div>
  );
}
