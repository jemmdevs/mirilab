// GSAP animation configuration
export interface AnimationConfig {
  entrance: {
    background: {
      duration: number;
      ease: string;
    };
    title: {
      duration: number;
      ease: string;
      delay: number;
      yOffset: number;
    };
    descriptions: {
      duration: number;
      ease: string;
      delay: number;
      stagger: number;
      yOffset: number;
    };
    images: {
      duration: number;
      ease: string;
      delay: number;
      stagger: number;
    };
    innerImages: {
      duration: number;
      ease: string;
      delay: number;
      stagger: number;
      scaleFrom: number;
    };
  };
  fade: {
    duration: number;
    hideDelay: number;
  };
}

// Clip-path directions for image reveal
export interface ClipPathDirections {
  right: string;
  left: string;
  top: string;
  bottom: string;
}
