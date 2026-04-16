'use client';

import { useEffect } from 'react';

interface DynamicAtmosphereProps {
  imagePath: string;
}

export default function DynamicAtmosphere({ imagePath }: DynamicAtmosphereProps) {
  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `https://image.tmdb.org/t/p/w200${imagePath}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: Record<string, number> = {};
      const step = 10; // Sample every 10th pixel for performance

      for (let i = 0; i < imageData.length; i += 4 * step) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // Skip transparent

        // Quantize colors to reduce noise
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }


      const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      const primary = sortedColors[0]?.[0] || '#d4af37';

      // Apply to root
      document.documentElement.style.setProperty('--cineos-primary', primary);
      document.documentElement.style.setProperty('--cineos-glow', `${primary}15`); // Very subtle glow

      
      // Cleanup
      canvas.remove();
    };

    return () => {
      // Revert to default on unmount if needed
      // document.documentElement.style.setProperty('--cineos-primary', '#d4af37');
    };
  }, [imagePath]);

  return null;
}
