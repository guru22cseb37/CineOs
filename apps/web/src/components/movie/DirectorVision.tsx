'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, Palette, Award, Camera } from 'lucide-react';

interface DirectorVisionProps {
  title: string;
  overview: string;
}

export default function DirectorVision({ title, overview }: DirectorVisionProps) {
  const { data: vision, isLoading } = useQuery({
    queryKey: ['director-vision', title],
    queryFn: async () => {
      const res = await fetch('https://cine-os-api.vercel.app/api/ai/director-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, overview })
      });
      if (!res.ok) throw new Error('Vision blurred!');
      return res.json();
    },
    staleTime: Infinity
  });

  if (isLoading) return <div className="h-64 animate-pulse bg-cinema-glass rounded-3xl border border-white/5" />;

  const specs = [
    { 
      label: 'Mise-en-scène', 
      content: vision?.miseEnScene, 
      icon: Eye,
      color: 'text-cinema-jade',
      bg: 'bg-cinema-jade/10'
    },
    { 
      label: 'Visual Palette', 
      content: vision?.colorTheory, 
      icon: Palette,
      color: 'text-cinema-gold',
      bg: 'bg-cinema-gold/10'
    },
    { 
      label: 'Directorial Fingerprint', 
      content: vision?.signatureStyle, 
      icon: Award,
      color: 'text-cinema-primary',
      bg: 'bg-cinema-primary/10'
    }
  ];

  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-black text-cinema-muted uppercase tracking-[0.4em] mb-1">Cinephile Masterclass</h3>
          <h4 className="text-3xl font-black text-white">The Director's Lens</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {specs.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group relative p-8 rounded-[2.5rem] bg-cinema-obsidian/40 backdrop-blur-3xl border border-white/5 hover:border-white/20 transition-all duration-700 overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl ${spec.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
              <spec.icon className={`w-7 h-7 ${spec.color}`} />
            </div>
            
            <h5 className="text-white font-black text-xl mb-4 tracking-tight">{spec.label}</h5>
            <p className="text-cinema-muted leading-relaxed font-medium text-sm group-hover:text-white/80 transition-colors">
              {spec.content}
            </p>

            {/* Aesthetic Background Detail */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
