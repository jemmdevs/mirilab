import type { AnimationConfig, ClipPathDirections } from '@/app/types/animation.types';

// GSAP animation settings - extracted from HoverGrid for easy tuning
export const ANIMATION_SETTINGS: AnimationConfig = {
  entrance: {
    background: {
      duration: 0.7,
      ease: 'sine.out',
    },
    title: {
      duration: 0.95,
      ease: 'expo.out',
      delay: 0.05,
      yOffset: 12,
    },
    descriptions: {
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.1,
      stagger: 0.05,
      yOffset: 20,
    },
    images: {
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.08,
      stagger: 0.08,
    },
    innerImages: {
      duration: 1.45,
      ease: 'expo.out',
      delay: 0.08,
      stagger: 0.08,
      scaleFrom: 1.08,
    },
  },
  fade: {
    duration: 0.6,
    hideDelay: 80, // ms to wait before hiding, allows smooth transition between links
  },
};

// Clip-path polygon values for image reveal animations
export const CLIP_PATH_DIRECTIONS: ClipPathDirections = {
  right: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
  left: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
  top: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
  bottom: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
};

// Clip-path "to" state (fully visible)
export const CLIP_PATH_VISIBLE = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

// Mobile scroll picker settings
export const MOBILE_SETTINGS = {
  selectionThreshold: 25, // px distance for item to be considered active
  titleFadeMaxScroll: 150, // px to fade title completely
  endPhraseRange: 80, // px from bottom to show end phrase
  breakpoint: 768, // Mobile breakpoint
};
