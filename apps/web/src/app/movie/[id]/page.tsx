'use client';

import { useQuery } from '@tanstack/react-query';
import { Play, Plus } from 'lucide-react';
import MovieRow from '@/components/movie/MovieRow';

export default function MovieDetail({ params }: { params: { id: string } }) {
  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', params.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/movies/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch movie');
      return res.json();
    }
  });

  if (isLoading || !movie) {
    return <div className="h-screen bg-cinema-void animate-pulse flex items-center justify-center text-cinema-gold">Loading...</div>;
  }

  const directors = movie.credits?.crew?.filter((c: any) => c.job === 'Director') || [];
  const topCast = movie.credits?.cast?.slice(0, 10) || [];
  const similarMovies = movie.similar?.results || [];

  return (
    <div className="pb-20">
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-cinema-void/80 to-cinema-void/20" />
        </div>
        
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-3/4 flex gap-8 items-end">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-48 md:w-64 rounded-xl shadow-2xl border border-white/10 hidden md:block"
          />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{movie.title}</h1>
            <div className="flex items-center space-x-4 mb-4 text-sm font-medium">
              <span className="text-cinema-jade">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-white/60">{movie.release_date?.substring(0, 4)}</span>
              <span className="text-white/60">{movie.runtime}m</span>
              <div className="flex space-x-2">
                {movie.genres?.map((g: any) => (
                  <span key={g.id} className="border border-white/20 px-2 py-0.5 rounded text-xs">{g.name}</span>
                ))}
              </div>
            </div>
            <p className="text-cinema-muted text-lg max-w-2xl mb-8 leading-relaxed">
              {movie.overview}
            </p>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-cinema-gold transition-colors">
                <Play className="w-5 h-5 fill-current" />
                <span>Play</span>
              </button>
              <button className="flex items-center space-x-2 bg-cinema-glass backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Watchlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topCast.map((actor: any) => (
              <div key={actor.id} className="text-center group cursor-pointer">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-cinema-gold transition-colors">
                  {actor.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="w-full h-full object-cover" alt={actor.name} />
                  ) : (
                    <div className="w-full h-full bg-cinema-obsidian" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate">{actor.name}</h4>
                <p className="text-xs text-cinema-muted truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Crew</h2>
          <div className="space-y-4">
            <div>
              <span className="text-cinema-muted block text-sm">Director</span>
              <span className="text-white font-medium">{directors.map((d: any) => d.name).join(', ') || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-cinema-muted block text-sm">Production</span>
              <span className="text-white font-medium">{movie.production_companies?.map((pc: any) => pc.name).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <MovieRow title="More Like This" movies={similarMovies} />
      </div>
    </div>
  );
}
