'use client';

import { useQuery } from '@tanstack/react-query';

import { Quote, Sparkles, GraduationCap, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieCriticsProps {
  title: string;
  overview: string;
}

export default function MovieCritics({ title, overview }: MovieCriticsProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['critics', title],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/ai/critics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, overview })
      });
      if (!res.ok) throw new Error('Critics escaped!');
      return res.json();
    },
    staleTime: Infinity
  });

  if (isLoading) return <div className="h-48 animate-pulse bg-cinema-glass rounded-2xl border border-white/5" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-12">
      {/* The Scholarly Take */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-cinema-obsidian/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <GraduationCap size={100} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <GraduationCap className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Analysis</h3>
            <h4 className="text-xl font-black text-white">The Scholar</h4>
          </div>
        </div>
        <p className="text-cinema-muted italic leading-relaxed text-sm relative z-10">
          <Quote className="inline-block w-4 h-4 mr-2 text-blue-400 opacity-50" />
          {reviews?.scholar}
        </p>
      </motion.div>

      {/* The Technical Perspective */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-3xl bg-cinema-obsidian/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Video size={100} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Video className="text-purple-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Mastery</h3>
            <h4 className="text-xl font-black text-white">The Director</h4>
          </div>
        </div>
        <p className="text-cinema-muted italic leading-relaxed text-sm relative z-10">
          <Quote className="inline-block w-4 h-4 mr-2 text-purple-400 opacity-50" />
          {reviews?.technical}
        </p>
      </motion.div>

      {/* The Hype Perspective */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-3xl bg-cinema-obsidian/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles size={100} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
            <Sparkles className="text-orange-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Vibe Check</h3>
            <h4 className="text-xl font-black text-white">The Fan</h4>
          </div>
        </div>
        <p className="text-cinema-muted italic leading-relaxed text-sm relative z-10">
          <Quote className="inline-block w-4 h-4 mr-2 text-orange-400 opacity-50" />
          {reviews?.hype}
        </p>
      </motion.div>
    </div>
  );
}

