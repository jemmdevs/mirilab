'use client';

import { useEffect, useState } from 'react';

interface LazyContentImageProps {
  src: string;
  className: string;
  dataDir: string;
  isActive: boolean;
}

// Lazy content image component
export function LazyContentImage({ src, className, dataDir, isActive }: LazyContentImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isActive && !loaded) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.src = src;
    }
  }, [isActive, src, loaded]);

  return (
    <div className={`content__img ${className}`} data-dir={dataDir}>
      <div
        className="content__img-inner"
        style={{ backgroundImage: loaded ? `url(${src})` : 'none' }}
      />
    </div>
  );
}
