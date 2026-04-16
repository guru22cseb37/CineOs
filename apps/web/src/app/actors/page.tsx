'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';

export default function Actors() {
  const [letter, setLetter] = useState('a');
  
  const { data, isLoading } = useQuery({
    queryKey: ['actors', letter],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/actors?letter=${letter}`);
      if (!res.ok) throw new Error('Failed to fetch actors');
      return res.json();
    }
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
      <h1 className="text-4xl font-bold mb-8 text-white">Actor Discovery</h1>
      
      <div className="sticky top-20 z-40 bg-cinema-void/90 backdrop-blur-md py-4 mb-8 border-b border-white/5 overflow-x-auto hide-scrollbar flex space-x-2">
        {alphabet.map((l) => (
          <button
            key={l}
            onClick={() => setLetter(l.toLowerCase())}
            className={`w-10 h-10 flex-shrink-0 rounded flex items-center justify-center font-bold transition-colors ${
              letter === l.toLowerCase() ? 'bg-cinema-gold text-cinema-void' : 'bg-cinema-obsidian text-cinema-muted hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-64 bg-cinema-obsidian rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data?.results?.map((actor: any) => (
            <Link href={`/actor/${actor.id}`} key={actor.id} className="group">
              <div className="relative h-64 rounded-lg overflow-hidden mb-3 border border-white/5">
                {actor.profile_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={actor.name} />
                ) : (
                  <div className="w-full h-full bg-cinema-obsidian flex items-center justify-center text-cinema-muted">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-bold text-white truncate">{actor.name}</h3>
              <p className="text-xs text-cinema-muted line-clamp-1">
                Known for: {actor.known_for?.map((m: any) => m.title || m.name).join(', ')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
