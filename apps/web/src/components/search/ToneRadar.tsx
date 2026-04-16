'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun, Ghost, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const VIBES = [
  { id: 'neon', name: 'Neon Noir', icon: <Zap className="text-purple-400" />, desc: 'Cyberpunk, rainy, electric' },
  { id: 'dark', name: 'Gritty Realism', icon: <Moon className="text-gray-400" />, desc: 'Hard-hitting, raw, intense' },
  { id: 'golden', name: 'Golden Hour', icon: <Sun className="text-yellow-400" />, desc: 'Warm, nostalgic, hopeful' },
  { id: 'ethereal', name: 'Dreamy Surrealism', icon: <Wand2 className="text-blue-400" />, desc: 'Visual poetry, artistic' },
  { id: 'scary', name: 'Psychological Chill', icon: <Ghost className="text-red-400" />, desc: 'Tense, haunting, silent' },
];

export default function ToneRadar() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleVibeSearch = async (vibeId: string) => {
    setSelected(vibeId);
    
    // In a real app, we'd call the /vibe-search endpoint and redirect to a results page
    // For this demo, we'll simulate the search and redirect to a special search query
    const vibeName = VIBES.find(v => v.id === vibeId)?.name;
    router.push(`/search?vibe=${encodeURIComponent(vibeName || '')}`);
  };

  return (
    <div className="py-12 px-4 md:px-12 bg-cinema-obsidian/50 rounded-3xl border border-white/5 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="text-cinema-gold" /> Tone Radar
        </h2>
        <p className="text-cinema-muted">Don't search by title. Search by how you want to feel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {VIBES.map((vibe) => (
          <motion.button
            key={vibe.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVibeSearch(vibe.id)}
            className={`p-6 rounded-2xl flex flex-col items-center text-center gap-4 transition-all duration-300 border ${
              selected === vibe.id 
              ? 'bg-cinema-gold/20 border-cinema-gold' 
              : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            <div className={`p-4 rounded-full bg-white/5 mb-2 ${selected === vibe.id ? 'animate-pulse' : ''}`}>
              {vibe.icon}
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">{vibe.name}</h4>
              <p className="text-xs text-cinema-muted leading-tight">{vibe.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
