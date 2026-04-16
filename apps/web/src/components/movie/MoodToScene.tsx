'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Play, Search, Zap } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Scene {
  time: string;
  description: string;
  vibe: string;
}

interface MoodToSceneProps {
  movieTitle: string;
}

export default function MoodToScene({ movieTitle }: MoodToSceneProps) {
  const [mood, setMood] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!mood) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/ai/mood-to-scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: movieTitle, mood })
      });
      const data = await res.json();
      setScenes(data.scenes || []);
    } catch (error) {
      console.error('Mood-to-Scene failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-black text-cinema-primary uppercase tracking-[0.3em] mb-1">Game Changer</h2>
          <h3 className="text-3xl font-black text-white italic">Mood-to-Scene</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cinema-primary/10 flex items-center justify-center border border-cinema-primary/20">
          <Zap className="w-6 h-6 text-cinema-primary" />
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-cinema-obsidian/40 backdrop-blur-3xl border border-white/5 relative group">
        <p className="text-cinema-muted text-sm mb-6 max-w-xl">
          Don't watch the whole movie. Jump to the exact scene that matches your current vibe. 
          Enter a feeling (e.g., "haunting beauty", "explosive tension").
        </p>

        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text"
            placeholder="What mood are you chasing?"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-32 text-white focus:outline-none focus:border-cinema-primary/50 transition-all font-medium"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading || !mood}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-2 rounded-xl font-black text-xs hover:bg-cinema-gold transition-all disabled:opacity-50"
          >
            {isLoading ? 'ANALYZING...' : 'DECOUPLE'}
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </motion.div>
            ) : scenes.length > 0 ? (
              scenes.map((scene, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-cinema-primary font-black text-xl italic tracking-tighter w-24">
                      {scene.time}
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-cinema-gold uppercase tracking-widest">{scene.vibe}</span>
                      <p className="text-white font-medium text-sm leading-snug max-w-md">{scene.description}</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Play className="w-4 h-4 fill-current ml-1" />
                  </button>
                </motion.div>
              ))
            ) : hasSearched && (
              <div className="text-center py-10 opacity-30">
                <Ghost className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No matching sequences found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
