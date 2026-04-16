'use client';

import { useEffect } from 'react';

const GENRE_THEMES: Record<number, { primary: string; glow: string }> = {
  27: { primary: '#dc2626', glow: '#dc262640' },       // Horror - Crimson
  878: { primary: '#06b6d4', glow: '#06b6d440' },      // Sci-Fi - Cyan
  35: { primary: '#f59e0b', glow: '#f59e0b40' },       // Comedy - Amber
  10749: { primary: '#ec4899', glow: '#ec489940' },    // Romance - Pink
  28: { primary: '#f97316', glow: '#f9731640' },       // Action - Orange
  18: { primary: '#8b5cf6', glow: '#8b5cf640' },       // Drama - Purple
  53: { primary: '#10b981', glow: '#10b98140' },       // Thriller - Emerald
};

const DEFAULT_THEME = { primary: '#d4af37', glow: '#d4af3740' };

export default function DynamicThemeApplier() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cineos_calibration');
      if (!raw) return;

      const { likedGenres } = JSON.parse(raw);
      if (!likedGenres?.length) return;

      // Find the most-liked genre
      const counts: Record<number, number> = {};
      for (const g of likedGenres) counts[g] = (counts[g] || 0) + 1;
      const topGenre = parseInt(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0');
      
      const theme = GENRE_THEMES[topGenre] || DEFAULT_THEME;

      // Apply CSS variables to root
      document.documentElement.style.setProperty('--cineos-primary', theme.primary);
      document.documentElement.style.setProperty('--cineos-glow', theme.glow);
    } catch {}
  }, []);

  return null; // This is a pure side-effect component
}
