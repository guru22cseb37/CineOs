'use client';

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Play, Info, Star, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import TrailerModal from './TrailerModal';

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

export default function HeroBanner({ movie }: HeroBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  
  // Parallax Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end feel
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  
  const backdropX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const backdropY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const backdropScale = useTransform(smoothY, [-0.5, 0.5], [1.05, 1.1]);

  const contentX = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const contentY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (movie?.id) {
      fetch(`http://localhost:4000/api/movies/${movie.id}/videos`)
        .then(res => res.json())
        .then(data => {
          const videos = data.results || [];
          const bestVideo = 
            videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
            videos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') || 
            videos.find((v: any) => v.site === 'YouTube');
          
          if (bestVideo) setTrailerKey(bestVideo.key);
        })
        .catch(() => setTrailerKey(''));
    }
  }, [movie?.id]);

  if (!movie) {
    return (
      <div className="h-[85vh] bg-gradient-to-b from-cinema-obsidian to-cinema-void animate-pulse flex items-center justify-center">
        <div className="text-cinema-muted text-sm">Loading cinematic experience...</div>
      </div>
    );
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (trailerKey) {
      setIsTrailerOpen(true);
    } else {
      const searchQuery = encodeURIComponent(`${movie.title} trailer`);
      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    }
  };

  const genres = movie.genre_ids?.slice(0, 3).map((id: number) => GENRE_MAP[id]).filter(Boolean) || [];
  const matchScore = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const year = movie.release_date?.substring(0, 4);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden perspective-1000">
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoKey={trailerKey} 
      />
      
      {/* 3D Background Layer */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ 
          x: backdropX, 
          y: backdropY, 
          scale: backdropScale,
          rotateX,
          rotateY
        }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Deep Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-cinema-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-void/90 via-cinema-void/40 to-transparent" />
        {/* Dynamic Atmospheric Glow */}
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-cinema-primary/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
      </motion.div>

      {/* Content Layer with inverse parallax for depth */}
      <motion.div 
        className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-3/5 z-20"
        style={{ x: contentX, y: contentY }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          >
            {/* Meta badges */}
            <div className="flex items-center flex-wrap gap-3 mb-6">
              {matchScore && (
                <div className="flex items-center gap-1.5 bg-cinema-jade/20 border border-cinema-jade/40 px-3 py-1 rounded-full backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 text-cinema-jade fill-cinema-jade" />
                  <span className="text-cinema-jade text-xs font-black tracking-widest uppercase">{matchScore}% Match</span>
                </div>
              )}
              {year && (
                <span className="text-white/60 text-[10px] font-black tracking-widest uppercase border border-white/20 px-3 py-1 rounded-full backdrop-blur-md bg-white/5">{year}</span>
              )}
              {genres.map((g: string) => (
                <span key={g} className="text-white/60 text-[10px] font-black tracking-widest uppercase border border-white/10 px-3 py-1 rounded-full backdrop-blur-md bg-white/5">{g}</span>
              ))}
            </div>

            {/* Title with Layered Shadow */}
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <span className="block">{movie.title || movie.name}</span>
            </h1>

            {/* Overview */}
            <p className="text-white/60 text-base md:text-xl max-w-xl mb-10 leading-relaxed font-medium drop-shadow-md">
              {movie.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-6 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlay}
                className="flex items-center gap-3 bg-cinema-gold text-cinema-void px-10 py-4.5 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-2xl shadow-cinema-gold/30 group"
              >
                <div className="w-6 h-6 rounded-full bg-cinema-void flex items-center justify-center group-hover:bg-cinema-gold transition-colors">
                  <Play className="w-3 h-3 fill-current text-cinema-gold group-hover:text-cinema-void" />
                </div>
                {trailerKey ? 'Experience Trailer' : 'Search YouTube'}
              </motion.button>
              
              <Link href={`/movie/${movie.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 text-white px-10 py-4.5 rounded-2xl font-black text-lg transition-all"
                >
                  <Info className="w-5 h-5" />
                  In-Depth Details
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Ultra-Wide Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-cinema-void via-cinema-void/80 to-transparent pointer-events-none z-30" />
    </div>
  );
}

