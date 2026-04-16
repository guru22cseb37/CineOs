'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function MoviesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: async () => {
      const res = await fetch(`https://cine-os-api.vercel.app/api/movies/popular`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      return res.json();
    }
  });

  return (
    <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
      <h1 className="text-4xl font-bold mb-8 text-white">Popular Movies</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-80 bg-cinema-obsidian rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data?.results?.map((movie: any) => (
            <Link href={`/movie/${movie.id}`} key={movie.id} className="group">
              <div className="relative h-80 rounded-lg overflow-hidden mb-3 border border-white/5">
                {movie.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={movie.title} />
                ) : (
                  <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center text-cinema-muted">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-cinema-gold font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
                </div>
              </div>
              <h3 className="font-bold text-white truncate">{movie.title}</h3>
              <p className="text-xs text-cinema-muted">{movie.release_date?.substring(0, 4)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
