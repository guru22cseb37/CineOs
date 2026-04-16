'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface CineDNARadarProps {
  movieId: string;
}

export default function CineDNARadar({ movieId }: CineDNARadarProps) {
  const { data: dna, isLoading } = useQuery({
    queryKey: ['movie-dna', movieId],
    queryFn: async () => {
      const res = await fetch(`https://cine-os-api.vercel.app/api/movies/${movieId}/dna`);
      if (!res.ok) throw new Error('DNA sequencing failed');
      return res.json();
    },
    staleTime: Infinity
  });

  if (isLoading || !dna) {
    return (
      <div className="h-64 flex items-center justify-center bg-cinema-obsidian/20 rounded-3xl border border-white/5 animate-pulse">
        <Activity className="w-8 h-8 text-cinema-primary animate-bounce" />
      </div>
    );
  }

  const { labels, values } = dna;
  const numPoints = labels.length;
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) * 0.7;

  // Calculate coordinates for a point on the radar
  const getPointCoors = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const x = center + radius * (value / 100) * Math.cos(angle);
    const y = center + radius * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = values?.map((v: number, i: number) => {
    const { x, y } = getPointCoors(i, v);
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[2rem] bg-cinema-obsidian/40 backdrop-blur-3xl border border-white/5 relative group h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-cinema-primary uppercase tracking-[0.3em] mb-1">AI Sequencing</h3>
          <h4 className="text-3xl font-black text-white">Cinematic DNA</h4>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cinema-primary/10 flex items-center justify-center border border-cinema-primary/20">
          <Activity className="w-6 h-6 text-cinema-primary" />
        </div>
      </div>

      <div className="relative flex justify-center py-4">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Grid Circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * r}
              fill="none"
              stroke="white"
              strokeOpacity="0.05"
              strokeDasharray="4 4"
            />
          ))}

          {/* Axes */}
          {labels?.map((_: string, i: number) => {
            const { x, y } = getPointCoors(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="white"
                strokeOpacity="0.1"
              />
            );
          })}

          {/* Data Polygon */}
          {polyPoints && (
            <motion.polygon
              points={polyPoints}
              fill="url(#dnaGradient)"
              fillOpacity="0.4"
              stroke="var(--cinema-primary)"
              strokeWidth="3"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          )}

          {/* Data Points */}
          {values?.map((v: number, i: number) => {
            const { x, y } = getPointCoors(i, v);
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="var(--cinema-primary)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              />
            );
          })}

          {/* Labels */}
          {labels?.map((label: string, i: number) => {
            const { x, y } = getPointCoors(i, 115);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="white"
                fillOpacity="0.6"
                className="uppercase tracking-widest pointer-events-none"
              >
                {label}
              </text>
            );
          })}

          <defs>
            <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ADFF2F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend / Values breakdown */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-4 hidden lg:block">
          {labels?.map((label: string, i: number) => (
            <div key={label} className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">{label}</span>
              <span className="text-sm font-black text-white">{values[i]}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <p className="mt-8 text-center text-[10px] text-cinema-muted font-black uppercase tracking-widest bg-white/5 py-3 rounded-2xl border border-white/5 mx-4">
        Neural Pattern Recognition Active
      </p>
    </motion.div>
  );
}
