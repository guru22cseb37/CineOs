'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Loader2, Film, Sparkles } from 'lucide-react';
import Link from 'next/link';

const GENRE_OPTIONS = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }, { id: 16, name: 'Animation' }, { id: 14, name: 'Fantasy' },
  { id: 80, name: 'Crime' }, { id: 12, name: 'Adventure' }, { id: 99, name: 'Documentary' },
];

interface Profile { name: string; genres: number[] }

export default function WatchPartyPage() {
  const [profiles, setProfiles] = useState<Profile[]>([
    { name: 'You', genres: [] },
    { name: 'Friend', genres: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addProfile = () => {
    if (profiles.length < 4) setProfiles(p => [...p, { name: `Friend ${p.length}`, genres: [] }]);
  };

  const removeProfile = (idx: number) => {
    if (profiles.length > 2) setProfiles(p => p.filter((_, i) => i !== idx));
  };

  const updateName = (idx: number, name: string) => {
    setProfiles(p => p.map((pr, i) => i === idx ? { ...pr, name } : pr));
  };

  const toggleGenre = (profileIdx: number, genreId: number) => {
    setProfiles(p => p.map((pr, i) => i === profileIdx ? {
      ...pr,
      genres: pr.genres.includes(genreId) ? pr.genres.filter(g => g !== genreId) : [...pr.genres, genreId]
    } : pr));
  };

  const findMovies = async () => {
    if (profiles.some(p => p.genres.length === 0)) {
      alert('Each person needs at least one genre!');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:4000/api/ai/watch-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles })
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-12 pt-32 pb-20 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-8 h-8 text-cinema-gold" />
        <h1 className="text-4xl font-black text-white">Watch Party AI</h1>
      </div>
      <p className="text-cinema-muted mb-10">Add everyone's taste. Our AI finds the perfect movie everyone will enjoy.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {profiles.map((profile, idx) => (
          <motion.div key={idx} layout className="bg-cinema-obsidian border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <input
                value={profile.name}
                onChange={e => updateName(idx, e.target.value)}
                className="text-lg font-bold text-white bg-transparent border-b border-white/20 focus:border-cinema-gold outline-none pb-1 w-40"
              />
              {profiles.length > 2 && (
                <button onClick={() => removeProfile(idx)} className="text-cinema-muted hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-cinema-muted mb-3">Select genres you enjoy:</p>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(idx, genre.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    profile.genres.includes(genre.id)
                      ? 'bg-cinema-gold border-cinema-gold text-cinema-void font-bold'
                      : 'border-white/20 text-cinema-muted hover:border-white/40'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {profiles.length < 4 && (
          <button
            onClick={addProfile}
            className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-cinema-gold/40 transition-colors text-cinema-muted hover:text-cinema-gold group"
          >
            <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span>Add Person</span>
          </button>
        )}
      </div>

      <button
        onClick={findMovies}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-cinema-gold text-cinema-void font-black py-4 rounded-xl hover:bg-cinema-gold/90 transition-colors text-lg disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'AI is thinking...' : 'Find Perfect Movies for Everyone'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <div className="bg-cinema-jade/10 border border-cinema-jade/20 rounded-xl px-6 py-4 mb-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cinema-jade flex-shrink-0 mt-0.5" />
              <p className="text-white/80 text-sm"><strong className="text-cinema-jade">AI says:</strong> {result.reason}</p>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Movies Everyone Will Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {result.recommendations?.map((movie: any) => (
                <Link href={`/movie/${movie.id}`} key={movie.id} className="group">
                  <div className="relative h-64 rounded-lg overflow-hidden border border-white/5 mb-2">
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={movie.title} />
                    ) : (
                      <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center"><Film className="text-cinema-muted" /></div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                  <p className="text-xs text-cinema-muted">{Math.round(movie.vote_average * 10)}% match</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
