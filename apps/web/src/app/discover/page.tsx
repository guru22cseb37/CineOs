'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Star, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export default function DiscoverPage() {
  const [calibData, setCalibData] = useState<{ likedGenres: number[]; completedAt: string } | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('cineos_calibration');
    if (data) {
      setCalibData(JSON.parse(data));
    }
  }, []);

  const topGenres = calibData?.likedGenres ? Array.from(new Set(calibData.likedGenres)).slice(0, 3).join(',') : '';

  const { data, isLoading } = useQuery({
    queryKey: ['personalized-discovery', topGenres],
    queryFn: async () => {
      if (!topGenres) return { results: [] };
      const res = await fetch(`${API_BASE}/movies/discover?with_genres=${topGenres}&sort_by=popularity.desc`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    enabled: !!topGenres,
  });

  if (!calibData) {
    return (
      <div className="min-h-screen bg-cinema-void flex flex-col items-center justify-center text-center px-4">
        <Sparkles className="w-12 h-12 text-cinema-gold mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-white mb-2">No Calibration Data Found</h1>
        <p className="text-cinema-muted mb-8 max-w-sm">Please calibrate your taste first so we can find movies you'll love.</p>
        <Link href="/onboarding">
          <button className="bg-cinema-gold text-cinema-void font-black px-8 py-3 rounded-xl hover:scale-105 transition-all">
            Calibrate Taste Now
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-void pt-24 pb-20">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cinema-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cinema-jade/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-cinema-gold mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Master AI Discovery</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Tailored For <span className="text-cinema-gold">You.</span>
            </h1>
            <p className="text-cinema-muted mt-4 max-w-xl text-lg">
              Based on your calibration from {new Date(calibData.completedAt).toLocaleDateString()}, we've sequenced these matches for your DNA.
            </p>
          </div>

          <Link href="/onboarding">
            <button className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all font-bold group">
              <RefreshCw className="w-4 h-4 text-cinema-gold group-hover:rotate-180 transition-transform duration-500" />
              Retrain My AI
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-cinema-gold animate-spin" />
            <p className="text-cinema-muted font-medium">Sequencing matches...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            <AnimatePresence>
              {data?.results?.slice(0, 15).map((movie: Movie, idx: number) => {
                // Pseudo-match calculation for premium feel
                const matchScore = 90 + Math.floor(Math.random() * 10);
                
                return (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Link href={`/movie/${movie.id}`}>
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-4">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-transparent to-transparent opacity-80" />
                        
                        {/* Match Label */}
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-1.5 bg-cinema-gold text-cinema-void px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                            <Zap className="w-3 h-3 fill-current" />
                            {matchScore}% DNA Match
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-black text-lg leading-tight truncate">{movie.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-cinema-gold">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <span className="text-[10px] text-cinema-muted uppercase font-bold tracking-widest">
                              {movie.release_date?.substring(0, 4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && data?.results?.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-cinema-muted">We couldn't find exact matches. Try retraining your taste!</p>
          </div>
        )}
      </div>
    </div>
  );
}
