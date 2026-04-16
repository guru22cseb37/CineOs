'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Globe, Star, Calendar, Film } from 'lucide-react';
import Link from 'next/link';

export default function ActorProfile({ params }: { params: { id: string } }) {
  const { data: actor, isLoading } = useQuery({
    queryKey: ['actor', params.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/actors/${params.id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  if (isLoading || !actor) {
    return (
      <div className="min-h-screen bg-cinema-void flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedMovies = actor.credits?.cast
    ?.filter((m: any) => m.poster_path)
    .sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 20) || [];

  const age = actor.birthday
    ? new Date().getFullYear() - new Date(actor.birthday).getFullYear()
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero section */}
      <div className="relative">
        {/* Background blurred portrait */}
        {actor.profile_path && (
          <div className="absolute inset-0 h-[60vh] overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/original${actor.profile_path}`}
              className="w-full h-full object-cover object-top blur-xl scale-110 opacity-20"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cinema-void/40 via-cinema-void/70 to-cinema-void" />
          </div>
        )}

        <div className="relative container mx-auto px-4 md:px-12 pt-36 pb-12">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <div className="w-56 h-72 rounded-2xl overflow-hidden border-4 border-cinema-gold/30 shadow-2xl shadow-cinema-gold/10">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                    className="w-full h-full object-cover"
                    alt={actor.name}
                  />
                ) : (
                  <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center">
                    <Film className="w-12 h-12 text-cinema-muted" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <h1 className="text-5xl font-black text-white mb-3">{actor.name}</h1>
              <p className="text-cinema-gold font-semibold mb-4">{actor.known_for_department}</p>

              <div className="flex flex-wrap gap-4 text-sm text-cinema-muted mb-6">
                {actor.birthday && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Born {new Date(actor.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {age && <span className="text-white/60">({age} years old)</span>}
                  </span>
                )}
                {actor.place_of_birth && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {actor.place_of_birth}
                  </span>
                )}
                {actor.popularity && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-cinema-gold" />
                    Popularity: {actor.popularity.toFixed(1)}
                  </span>
                )}
              </div>

              {actor.biography && (
                <div>
                  <p className="text-white/70 leading-relaxed line-clamp-5 max-w-3xl">{actor.biography}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filmography */}
      <div className="container mx-auto px-4 md:px-12 mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Film className="w-6 h-6 text-cinema-gold" />
          Filmography
          <span className="text-sm font-normal text-cinema-muted ml-2">({sortedMovies.length} titles)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedMovies.map((movie: any, idx: number) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link href={`/movie/${movie.id}`} className="group block">
                <div className="relative h-60 rounded-lg overflow-hidden border border-white/5 mb-2">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={movie.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-cinema-gold text-xs font-bold">{Math.round(movie.vote_average * 10)}%</span>
                  </div>
                </div>
                <p className="text-white text-xs font-semibold truncate">{movie.title}</p>
                {movie.character && (
                  <p className="text-cinema-muted text-xs truncate italic">as {movie.character}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
