'use client';

import { useEffect, useState } from 'react';

interface LazyBackgroundImageProps {
  id: string;
  src: string;
  isActive: boolean;
}

// Lazy image component that only loads when activated
export function LazyBackgroundImage({ id, src, isActive }: LazyBackgroundImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isActive && !loaded) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.src = src;
    }
  }, [isActive, src, loaded]);

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
