'use client';

import MovieCard from './MovieCard';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movies: any[];
  icon?: React.ReactNode;
}

export default function MovieRow({ title, movies, icon }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8 relative">
      <div className="flex items-center gap-2 mb-4 px-4 md:px-12">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="group relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cinema-void to-transparent z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:border-cinema-gold transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
        </button>

        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-auto hide-scrollbar px-4 md:px-12 pb-4 pt-2"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cinema-void to-transparent z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:border-cinema-gold transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}
