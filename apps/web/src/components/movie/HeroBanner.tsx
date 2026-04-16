'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeroBannerProps {
  movie: any;
  movies?: any[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

export default function HeroBanner({ movie, movies }: HeroBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!movie) {
    return (
      <div className="h-[85vh] bg-gradient-to-b from-cinema-obsidian to-cinema-void animate-pulse flex items-center justify-center">
        <div className="text-cinema-muted text-sm">Loading cinematic experience...</div>
      </div>
    );
  }

  const genres = movie.genre_ids?.slice(0, 3).map((id: number) => GENRE_MAP[id]).filter(Boolean) || [];
  const matchScore = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const year = movie.release_date?.substring(0, 4);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: imageLoaded ? 1 : 1.1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-cinema-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-void/90 via-cinema-void/40 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-3/5">
        <AnimatePresence>
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Meta badges */}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              {matchScore && (
                <div className="flex items-center gap-1.5 bg-cinema-jade/20 border border-cinema-jade/40 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 text-cinema-jade fill-cinema-jade" />
                  <span className="text-cinema-jade text-xs font-bold">{matchScore}% Match</span>
                </div>
              )}
              {year && (
                <span className="text-white/60 text-xs font-medium border border-white/20 px-2.5 py-1 rounded-full">{year}</span>
              )}
              {genres.map(g => (
                <span key={g} className="text-white/60 text-xs border border-white/15 px-2.5 py-1 rounded-full">{g}</span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tight drop-shadow-2xl">
              {movie.title || movie.name}
            </h1>

            {/* Overview */}
            <p className="text-white/70 text-base md:text-lg max-w-xl mb-8 leading-relaxed line-clamp-3">
              {movie.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link href={`/movie/${movie.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-cinema-gold text-cinema-void px-8 py-3.5 rounded-xl font-black text-base hover:bg-cinema-gold/90 transition-colors shadow-lg shadow-cinema-gold/20"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Trailer
                </motion.button>
              </Link>
              <Link href={`/movie/${movie.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/20 transition-colors"
                >
                  <Info className="w-5 h-5" />
                  More Info
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-cinema-void to-transparent pointer-events-none" />
    </div>
  );
}
