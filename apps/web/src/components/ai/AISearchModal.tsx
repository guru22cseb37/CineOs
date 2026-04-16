'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Loader2, X, Film } from 'lucide-react';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export default function AISearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [aiParams, setAiParams] = useState<Record<string, string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setAiParams(null);

    try {
      const res = await fetch('https://cine-os-api.vercel.app/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResults(data.results || []);
      setAiParams(data.params || null);
    } catch (err) {
      console.error('AI search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-cinema-muted hover:border-cinema-gold/50 hover:text-cinema-gold transition-all"
      >
        <Sparkles className="w-4 h-4 text-cinema-gold" />
        <span>AI Search</span>
        <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-cinema-muted">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-cinema-obsidian border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-1">
                <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3">
                  <Sparkles className="w-5 h-5 text-cinema-gold flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder='Try "a tense psychological thriller from the 90s" or "romantic comedy set in Paris"...'
                    className="flex-1 bg-transparent text-white placeholder-cinema-muted outline-none text-sm"
                  />
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-cinema-gold animate-spin" />
                  ) : (
                    <button type="submit">
                      <Search className="w-4 h-4 text-cinema-muted hover:text-white" />
                    </button>
                  )}
                  <button type="button" onClick={() => setOpen(false)}>
                    <X className="w-4 h-4 text-cinema-muted hover:text-white" />
                  </button>
                </form>
              </div>

              {/* AI parsed params */}
              {aiParams && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {Object.entries(aiParams).map(([k, v]) => (
                    <span key={k} className="text-xs bg-cinema-gold/10 text-cinema-gold border border-cinema-gold/20 px-2 py-0.5 rounded-full">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-white/5" />

              {/* Results */}
              <div className="max-h-[420px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.slice(0, 8).map(movie => (
                      <Link
                        key={movie.id}
                        href={`/movie/${movie.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-10 h-14 rounded overflow-hidden bg-white/5 flex-shrink-0">
                          {movie.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-full h-full object-cover" alt={movie.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-cinema-muted" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-cinema-gold transition-colors">{movie.title}</h4>
                          <p className="text-xs text-cinema-muted">{movie.release_date?.substring(0, 4)} · {Math.round(movie.vote_average * 10)}% match</p>
                          <p className="text-xs text-cinema-muted line-clamp-1 mt-0.5">{movie.overview}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !loading && query && (
                  <div className="py-12 text-center text-cinema-muted text-sm">No results found. Try a different vibe!</div>
                )}

                {!query && !loading && (
                  <div className="py-8 px-4 text-center">
                    <Sparkles className="w-8 h-8 text-cinema-gold/40 mx-auto mb-3" />
                    <p className="text-cinema-muted text-sm">Describe the movie you&apos;re feeling, not just the title.</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {["A scary horror movie from the 80s", "Recent top rated drama", "Popular Korean thriller", "Animated family adventure"].map(s => (
                        <button key={s} onClick={() => setQuery(s)} className="text-xs bg-white/5 hover:bg-cinema-gold/10 hover:text-cinema-gold border border-white/10 px-3 py-1.5 rounded-full text-cinema-muted transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
