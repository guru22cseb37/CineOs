'use client';

import { useEffect } from 'react';

const GENRE_THEMES: Record<number, { primary: string; glow: string; bg: string }> = {
  27: { primary: '#dc2626', glow: '#dc262640', bg: '#0a0000' },       // Horror - Crimson
  878: { primary: '#06b6d4', glow: '#06b6d440', bg: '#000a0f' },      // Sci-Fi - Cyan
  35: { primary: '#f59e0b', glow: '#f59e0b40', bg: '#0a0800' },       // Comedy - Amber
  10749: { primary: '#ec4899', glow: '#ec489940', bg: '#0a0006' },    // Romance - Pink
  28: { primary: '#f97316', glow: '#f9731640', bg: '#0a0500' },       // Action - Orange
  18: { primary: '#8b5cf6', glow: '#8b5cf640', bg: '#04000a' },       // Drama - Purple
  53: { primary: '#10b981', glow: '#10b98140', bg: '#000a05' },       // Thriller - Emerald
};

const DEFAULT_THEME = { primary: '#d4af37', glow: '#d4af3740', bg: '#080808' };

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
      document.documentElement.style.setProperty('--cineos-bg', theme.bg);
    } catch {}
  }, []);

  return null; // This is a pure side-effect component
}
