'use client';

import { useEffect, useState } from 'react';
import { MOBILE_SETTINGS } from '@/app/data/animation.config';

// Hook for mobile/desktop detection with configurable breakpoint
export function useMobileDetection(breakpoint: number = MOBILE_SETTINGS.breakpoint): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
