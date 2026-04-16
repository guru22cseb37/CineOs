'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Loader2, Film, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

const QUICK_SEARCHES = [
  "A mind-bending psychological thriller from the 90s",
  "Heartwarming animated movies for the whole family",
  "Recent Korean thriller with plot twists",
  "Classic sci-fi with epic space battles",
  "Emotional drama about family relationships",
  "Underrated horror movie with a great storyline",
  "Oscar-winning films from the last 5 years",
  "Action-comedy with a strong female lead",
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [aiParams, setAiParams] = useState<Record<string, string> | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    if (q) setQuery(q);

    setLoading(true);
    setResults([]);
    setAiParams(null);
    setSearched(true);

    try {
      const res = await fetch('https://cine-os-api.vercel.app/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setResults(data.results || []);
      setAiParams(data.params || null);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-cinema-gold/10 border border-cinema-gold/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-cinema-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Discover by <span className="text-cinema-gold">Feeling</span>
            </h1>
            <p className="text-cinema-muted text-lg max-w-xl mx-auto">
              Don't know the title? Describe the vibe. Our Groq AI converts your mood into the perfect movie.
            </p>
          </motion.div>
        </div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-cinema-obsidian border border-white/10 rounded-2xl overflow-hidden focus-within:border-cinema-gold/50 transition-colors">
              <Sparkles className="w-5 h-5 text-cinema-gold ml-5 flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='e.g. "A tense 90s thriller set in the rain" or "Funny romantic comedy in Paris"'
                className="flex-1 bg-transparent px-4 py-5 text-white placeholder-cinema-muted outline-none text-base"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="m-2 bg-cinema-gold text-cinema-void font-bold px-6 py-3 rounded-xl hover:bg-cinema-gold/90 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* AI Parameter Tags */}
        <AnimatePresence>
          {aiParams && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto mb-8 flex flex-wrap gap-2 items-center"
            >
              <SlidersHorizontal className="w-4 h-4 text-cinema-muted" />
              <span className="text-cinema-muted text-xs">AI extracted:</span>
              {Object.entries(aiParams).map(([k, v]) => (
                <span key={k} className="text-xs bg-cinema-gold/10 text-cinema-gold border border-cinema-gold/20 px-3 py-1 rounded-full">
                  {k.replace(/_/g, ' ')}: <strong>{v}</strong>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick search suggestions */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-cinema-muted text-sm font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cinema-gold" />
              Try these vibes:
            </p>
            <div className="flex flex-wrap gap-3">
              {QUICK_SEARCHES.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="text-sm bg-white/5 hover:bg-cinema-gold/10 hover:text-cinema-gold border border-white/10 hover:border-cinema-gold/30 px-4 py-2 rounded-full text-cinema-muted transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-72 bg-cinema-obsidian rounded-xl mb-3" />
                <div className="h-3 bg-cinema-obsidian rounded w-3/4 mb-2" />
                <div className="h-3 bg-cinema-obsidian rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {results.length} results for "<span className="text-cinema-gold">{query}</span>"
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {results.map((movie: any, idx: number) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={`/movie/${movie.id}`} className="group block">
                    <div className="relative h-72 rounded-xl overflow-hidden border border-white/5 mb-3">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={movie.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center">
                          <Film className="w-10 h-10 text-cinema-muted" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div>
                          <div className="text-cinema-gold text-sm font-bold">{Math.round(movie.vote_average * 10)}% Match</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white text-sm truncate group-hover:text-cinema-gold transition-colors">{movie.title}</h3>
                    <p className="text-cinema-muted text-xs mt-0.5">{movie.release_date?.substring(0, 4)}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-12 h-12 text-cinema-muted mx-auto mb-4" />
            <p className="text-cinema-muted text-lg">No movies found for that vibe.</p>
            <p className="text-cinema-muted/60 text-sm mt-2">Try describing the mood differently!</p>
          </div>
        )}
      </div>
    </div>
  );
}
