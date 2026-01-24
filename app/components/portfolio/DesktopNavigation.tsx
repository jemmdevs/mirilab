'use client';

import type { WorkItem } from '@/app/types/portfolio.types';

interface DesktopNavigationProps {
  workItems: WorkItem[];
}

// Desktop sidebar navigation - renders work items as links
export function DesktopNavigation({ workItems }: DesktopNavigationProps) {
  return (
    <nav className="frame__works">
      <span>Recent works</span>
      {workItems.map((item) => (
        <a key={item.id} href={`#${item.id}`}>
          {item.name}
        </a>
      ))}
    </nav>
  );
}
