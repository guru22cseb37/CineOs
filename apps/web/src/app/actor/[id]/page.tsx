'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Film } from 'lucide-react';
import Link from 'next/link';
import ActorConnectionGraph from '@/components/movie/ActorConnectionGraph';

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
        <div className="text-cinema-gold font-black tracking-[0.5em] animate-pulse uppercase italic">Sequencing DNA...</div>
      </div>
    );
  }

  const sortedMovies = actor.credits?.cast
    ?.filter((m: any) => m.poster_path)
    .sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 18) || [];

  const age = actor.birthday
    ? new Date().getFullYear() - new Date(actor.birthday).getFullYear()
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Hero section */}
      <div className="relative">
        {/* Background blurred portrait */}
        {actor.profile_path && (
          <div className="absolute inset-0 h-[70vh] overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/original${actor.profile_path}`}
              className="w-full h-full object-cover object-top blur-[100px] scale-125 opacity-30"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cinema-void/20 via-cinema-void/80 to-cinema-void" />
          </div>
        )}

        <div className="relative container mx-auto px-4 md:px-12 pt-40 pb-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12">
            {/* Portrait with Glass frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex-shrink-0 z-10"
            >
              <div className="w-64 h-96 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative group">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={actor.name}
                  />
                ) : (
                  <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center">
                    <Film className="w-16 h-16 text-cinema-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-void/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>

            {/* Premium Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 text-center lg:text-left z-10"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">{actor.name}</h1>
                <div className="bg-cinema-primary/20 border border-cinema-primary/40 px-4 py-1.5 rounded-full backdrop-blur-3xl inline-flex self-center lg:self-auto">
                    <span className="text-cinema-primary text-[10px] font-black uppercase tracking-[0.2em]">{actor.known_for_department}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-white/50 mb-10 font-bold uppercase tracking-widest">
                {actor.birthday && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20">Earth Entry</span>
                    <span className="text-white flex items-center gap-2">
                       {new Date(actor.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                       {age && <span className="text-cinema-gold">({age})</span>}
                    </span>
                  </div>
                )}
                {actor.place_of_birth && (
                  <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
                    <span className="text-[10px] text-white/20">Origin Point</span>
                    <span className="text-white">{actor.place_of_birth.split(',').slice(-1)[0].trim()}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
                    <span className="text-[10px] text-white/20">Global Rank</span>
                    <span className="text-white flex items-center gap-1.5 font-black">
                        <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                        {actor.popularity?.toFixed(1)}
                    </span>
                </div>
              </div>

              {actor.biography && (
                <div className="relative group">
                  <p className="text-cinema-muted text-lg leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-700 font-medium max-w-2xl bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    {actor.biography}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left Column: Connections */}
        <div className="lg:col-span-2">
            <ActorConnectionGraph actorId={params.id} actorName={actor.name} />
        </div>

        {/* Right Column: Filmography */}
        <div className="lg:col-span-3">
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter flex items-center gap-4">
            <Film className="w-8 h-8 text-cinema-primary" />
            Top Performances
            <span className="h-px flex-1 bg-white/10" />
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sortedMovies.map((movie: any, idx: number) => (
                <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                >
                <Link href={`/movie/${movie.id}`} className="group block">
                    <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 mb-4 shadow-2xl bg-cinema-obsidian">
                    <img
                        src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 group-hover:rotate-2"
                        alt={movie.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cinema-void/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                        <span className="text-cinema-gold text-xs font-black tracking-widest uppercase mb-1">Impact Score</span>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${movie.vote_average * 10}%` }}
                                className="h-full bg-cinema-gold" 
                            />
                        </div>
                    </div>
                    </div>
                    <h5 className="text-white font-black text-sm truncate uppercase tracking-tight">{movie.title}</h5>
                    {movie.character && (
                    <p className="text-cinema-muted text-[10px] font-bold uppercase tracking-widest truncate mt-1 opacity-60">
                        {movie.character}
                    </p>
                    )}
                </Link>
                </motion.div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}

