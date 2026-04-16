'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Heart, X, Loader2, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

function SwipeCard({ movie, onSwipe, isTop }: { movie: Movie; onSwipe: (id: number, liked: boolean) => void; isTop: boolean }) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = useCallback(async (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe(movie.id, true);
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe(movie.id, false);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    }
  }, [controls, movie.id, onSwipe]);

  return (
    <motion.div
      style={{ x, rotate, position: 'absolute', width: '100%' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={`cursor-grab active:cursor-grabbing ${isTop ? 'z-10' : 'z-0 scale-95 -mt-4'}`}
    >
      <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="relative h-[500px]">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* Like indicator */}
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 bg-cinema-jade/90 text-white font-black text-2xl px-6 py-2 rounded-xl rotate-[-20deg] border-4 border-cinema-jade">
            LIKE ❤️
          </motion.div>
          {/* Dislike indicator */}
          <motion.div style={{ opacity: dislikeOpacity }} className="absolute top-8 right-8 bg-red-600/90 text-white font-black text-2xl px-6 py-2 rounded-xl rotate-[20deg] border-4 border-red-600">
            NOPE ✕
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-black text-white mb-1">{movie.title}</h2>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
              <span className="text-cinema-gold font-semibold">{movie.vote_average.toFixed(1)}</span>
            </div>
            <p className="text-white/70 text-sm line-clamp-3">{movie.overview}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interactions, setInteractions] = useState<{ movieId: number; liked: boolean; genres: number[] }[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-movies'],
    queryFn: async () => {
      // Try trending first, fallback to popular
      try {
        const res = await fetch('https://cine-os-api.vercel.app/api/movies/trending');
        const json = await res.json();
        if (json.results && json.results.length > 0) return json;
      } catch {}
      // Fallback
      const res = await fetch('https://cine-os-api.vercel.app/api/movies/popular');
      return res.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  const movies: Movie[] = (data?.results || []).filter((m: any) => m.poster_path).slice(0, 12);

  const handleSwipe = useCallback((movieId: number, liked: boolean) => {
    const movie = movies.find(m => m.id === movieId);
    setInteractions(prev => [...prev, { movieId, liked, genres: movie?.genre_ids || [] }]);
    setCurrentIndex(prev => prev + 1);
  }, [movies]);

  const handleFinish = async () => {
    setSaving(true);
    // Store calibration in localStorage for dynamic theme too
    const likedGenres = interactions
      .filter(i => i.liked)
      .flatMap(i => i.genres);
    localStorage.setItem('cineos_calibration', JSON.stringify({ likedGenres, completedAt: new Date().toISOString() }));
    setSaving(false);
    router.push('/');
  };

  const remaining = movies.length - currentIndex;

  // Show spinner while loading OR if movies haven't loaded yet
  if (isLoading || movies.length === 0) {
    return (
      <div className="min-h-screen bg-cinema-void flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-cinema-gold animate-spin" />
        <p className="text-cinema-muted text-sm">Loading movies for calibration...</p>
      </div>
    );
  }

  // Only show completion when user has actually swiped through movies
  if (currentIndex >= movies.length && interactions.length > 0) {
    return (
      <div className="min-h-screen bg-cinema-void flex flex-col items-center justify-center gap-6 text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <div className="w-24 h-24 rounded-full bg-cinema-gold/20 border-4 border-cinema-gold flex items-center justify-center mb-6">
            <span className="text-4xl">🎬</span>
          </div>
        </motion.div>
        <h1 className="text-4xl font-black text-white">Taste Calibrated!</h1>
        <p className="text-cinema-muted max-w-md">
          You liked <strong className="text-cinema-jade">{interactions.filter(i => i.liked).length}</strong> out of {interactions.length} movies.
          Your personal algorithm is now active!
        </p>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="flex items-center gap-2 bg-cinema-gold text-cinema-void font-black px-10 py-4 rounded-xl hover:bg-cinema-gold/90 transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          Discover Your Movies →
        </button>
      </div>
    );
  }

  const visibleMovies = movies.slice(currentIndex, currentIndex + 2);

  return (
    <div className="min-h-screen bg-cinema-void flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-white mb-2">Calibrate Your Taste</h1>
        <p className="text-cinema-muted">Swipe right to like, left to skip · <strong className="text-cinema-gold">{remaining}</strong> left</p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mx-auto mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cinema-gold rounded-full"
            animate={{ width: `${(currentIndex / movies.length) * 100}%` }}
            transition={{ type: 'spring' }}
          />
        </div>
      </div>

      <div className="relative w-full max-w-sm h-[500px]">
        <AnimatePresence>
          {visibleMovies.map((movie, idx) => (
            <SwipeCard
              key={movie.id}
              movie={movie}
              onSwipe={handleSwipe}
              isTop={idx === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={() => handleSwipe(movies[currentIndex].id, false)}
          className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-600 flex items-center justify-center hover:bg-red-600/40 transition-colors"
        >
          <X className="w-7 h-7 text-red-400" />
        </button>
        <button
          onClick={() => handleSwipe(movies[currentIndex].id, true)}
          className="w-16 h-16 rounded-full bg-cinema-jade/20 border-2 border-cinema-jade flex items-center justify-center hover:bg-cinema-jade/40 transition-colors"
        >
          <Heart className="w-7 h-7 text-cinema-jade fill-cinema-jade" />
        </button>
      </div>
    </div>
  );
}
