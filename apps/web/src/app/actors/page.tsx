'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, User, Star, Search, ChevronRight } from 'lucide-react';

const INDUSTRIES = [
  { id: 'all', name: 'Global', icon: Globe, lang: '' },
  { id: 'hollywood', name: 'Hollywood', icon: Star, lang: 'en' },
  { id: 'kollywood', name: 'Kollywood', icon: User, lang: 'ta' },
  { id: 'bollywood', name: 'Bollywood', icon: User, lang: 'hi' },
  { id: 'tollywood', name: 'Tollywood', icon: User, lang: 'te' },
  { id: 'mollywood', name: 'Mollywood', icon: User, lang: 'ml' },
  { id: 'hallyu', name: 'Hallyu Wave', icon: Star, lang: 'ko' },
];

export default function Actors() {
  const [activeIndustry, setActiveIndustry] = useState(INDUSTRIES[0]);
  const [letter, setLetter] = useState('A');
  
  const currentLang = activeIndustry.lang;

  const { data, isLoading } = useQuery({
    queryKey: ['actors', activeIndustry.id, letter],
    queryFn: async () => {
      const url = currentLang 
        ? `http://localhost:4000/api/actors?language=${currentLang}`
        : `http://localhost:4000/api/actors?letter=${letter.toLowerCase()}`;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch actors');
      return res.json();
    }
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="container mx-auto px-4 md:px-12 pt-32 pb-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Actors Zone</h1>
          <p className="text-cinema-muted text-lg max-w-xl">
            Explore the legendary performers and rising stars of global cinema.
          </p>
        </div>
        
        {/* Industry Selector */}
        <div className="flex items-center gap-2 bg-cinema-obsidian p-1.5 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar max-w-full">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => {
                setActiveIndustry(ind);
                setLetter('A'); // Reset letter when switching industry
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeIndustry.id === ind.id 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-cinema-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <ind.icon className="w-4 h-4" />
              {ind.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Alphabet Filter (Show only for Global/All) */}
      <AnimatePresence>
        {!currentLang && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-20 z-40 bg-cinema-void/90 backdrop-blur-md py-4 mb-12 border-b border-white/5 overflow-x-auto hide-scrollbar flex space-x-1"
          >
            {alphabet.map((l) => (
              <button
                key={l}
                onClick={() => setLetter(l)}
                className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  letter === l ? 'bg-cinema-gold text-cinema-void scale-110 shadow-lg' : 'text-cinema-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {l}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          {currentLang ? `Top Stars from ${activeIndustry.name}` : `Stars starting with "${letter}"`}
          <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-cinema-obsidian rounded-2xl mb-4" />
              <div className="h-4 bg-cinema-obsidian rounded w-3/4 mb-2" />
              <div className="h-3 bg-cinema-obsidian rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {data?.results?.map((actor: any, idx: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={actor.id}
            >
              <Link href={`/actor/${actor.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-xl bg-cinema-obsidian">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={actor.name} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cinema-obsidian to-cinema-void">
                      <User className="w-12 h-12 text-cinema-muted" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-end">
                    <button className="bg-white text-black py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      View Profile <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Popularity Badge */}
                  {actor.popularity > 50 && (
                    <div className="absolute top-3 left-3 bg-cinema-gold/90 backdrop-blur-md text-cinema-void text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                      TRENDING
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white group-hover:text-cinema-gold transition-colors truncate">{actor.name}</h3>
                <p className="text-xs text-cinema-muted line-clamp-1 mt-1 font-medium">
                  {actor.known_for?.map((m: any) => m.title || m.name).join(' • ') || 'Actor'}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      
      {data?.results?.length === 0 && (
        <div className="text-center py-20 bg-cinema-obsidian rounded-3xl border border-dashed border-white/10">
          <Search className="w-12 h-12 text-cinema-muted mx-auto mb-4" />
          <p className="text-white font-bold text-xl">No actors found here.</p>
          <p className="text-cinema-muted">Try switching industries or checking another letter.</p>
        </div>
      )}
    </div>
  );
}

