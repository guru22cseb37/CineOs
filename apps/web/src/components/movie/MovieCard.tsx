'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import TrailerModal from './TrailerModal';

interface MovieCardProps {
  movie: any;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch trailer only once per card with robust fallback
  const fetchTrailer = useCallback(async () => {
    if (trailerKey !== null) return;
    try {
      const res = await fetch(`https://cine-os-api.vercel.app/api/movies/${movie.id}/videos`);
      const data = await res.json();
      const videos = data.results || [];
      
      const bestVideo = 
        videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
        videos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') || 
        videos.find((v: any) => v.type === 'Clip' && v.site === 'YouTube') || 
        videos.find((v: any) => v.site === 'YouTube');

      setTrailerKey(bestVideo?.key || '');
    } catch {
      setTrailerKey('');
    }
  }, [movie.id, trailerKey]);

  const handleMouseEnter = useCallback(() => {
    fetchTrailer();
    hoverTimerRef.current = setTimeout(() => setShowTrailer(true), 1500);
  }, [fetchTrailer]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowTrailer(false);
  }, []);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerKey) {
      setIsModalOpen(true);
    } else {
      const searchQuery = encodeURIComponent(`${movie.title} trailer`);
      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    }
  };

  if (!movie.poster_path) return null;

  return (
    <>
      <TrailerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        videoKey={trailerKey || ''} 
      />
      
      <Link href={`/movie/${movie.id}`}>
        <motion.div
          className="relative group min-w-[200px] h-[300px] rounded-lg overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05, zIndex: 10 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Poster */}
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Auto-playing Trailer Overlay */}
          {showTrailer && trailerKey && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&rel=0`}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media"
                title={movie.title}
                style={{ border: 'none', pointerEvents: 'none' }}
              />
              {/* Mute toggle */}
              <button
                className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setMuted(m => !m); }}
                style={{ pointerEvents: 'all' }}
              >
                {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </motion.div>
          )}

          {/* Info overlay on hover */}
          <div className={`absolute inset-0 bg-black/80 ${showTrailer && trailerKey ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 flex flex-col justify-end p-4 z-20`}>
            <h3 className="text-white font-bold text-sm truncate">{movie.title || movie.name}</h3>
            <div className="flex items-center mt-2 space-x-2">
              <div 
                onClick={handlePlayClick}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-cinema-gold transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div 
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-cinema-muted space-x-2 border-t border-white/10 pt-2">
              <span className="text-cinema-jade font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
              <span>{movie.release_date?.substring(0, 4)}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </>
  );
}
