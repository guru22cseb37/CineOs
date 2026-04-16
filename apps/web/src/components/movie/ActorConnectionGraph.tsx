'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Connection {
  id: number;
  name: string;
  count: number;
  profile_path: string;
}

interface ActorConnectionGraphProps {
  actorId: string;
  actorName: string;
}

export default function ActorConnectionGraph({ actorId, actorName }: ActorConnectionGraphProps) {
  const { data: connections, isLoading } = useQuery<Connection[]>({
    queryKey: ['actor-connections', actorId],
    queryFn: async () => {
      const res = await fetch(`https://cine-os-api.vercel.app/api/actors/${actorId}/connections`);
      if (!res.ok) throw new Error('Connection logic failed');
      return res.json();
    }
  });

  if (isLoading || !connections || connections.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-cinema-obsidian/20 rounded-[2.5rem] border border-white/5 animate-pulse">
        <div className="text-cinema-muted font-black tracking-widest uppercase text-xs">Mapping Connections...</div>
      </div>
    );
  }

  const centerSize = 100;
  const orbitRadius = 160;

  return (
    <div className="relative p-12 rounded-[3rem] bg-cinema-obsidian/40 backdrop-blur-3xl border border-white/5 overflow-hidden">
      <div className="mb-12">
        <h3 className="text-sm font-black text-cinema-primary uppercase tracking-[0.4em] mb-2">Collaboration Web</h3>
        <h4 className="text-4xl font-black text-white">Circle of Influence</h4>
      </div>

      <div className="relative h-[450px] w-full flex items-center justify-center">
        {/* Central Actor */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-20 w-32 h-32 rounded-full border-4 border-cinema-primary shadow-[0_0_50px_rgba(141,224,33,0.3)] bg-cinema-obsidian flex items-center justify-center overflow-hidden"
        >
          <div className="text-center p-4">
            <span className="text-[10px] font-black text-cinema-primary uppercase block mb-1">Central</span>
            <span className="text-sm font-black text-white leading-tight block">{actorName}</span>
          </div>
        </motion.div>

        {/* Connections */}
        {connections.map((conn, i) => {
          const angle = (i * (360 / connections.length)) * (Math.PI / 180);
          const x = Math.cos(angle) * orbitRadius;
          const y = Math.sin(angle) * orbitRadius;

          return (
            <div key={conn.id} className="absolute flex items-center justify-center">
              {/* Connecting Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: orbitRadius }}
                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                style={{ 
                  transformOrigin: '0% 50%',
                  rotate: `${(i * (360 / connections.length))}deg`,
                  left: '0px'
                }}
                className="absolute h-px bg-gradient-to-r from-cinema-primary/40 to-transparent"
              />

              {/* Orbit Actor */}
              <motion.div
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, x, y }}
                transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.1, zIndex: 30 }}
                className="absolute w-20 h-20 rounded-full border-2 border-white/20 bg-cinema-obsidian overflow-hidden hover:border-cinema-gold transition-colors shadow-2xl group"
              >
                <Link href={`/actor/${conn.id}`}>
                  {conn.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${conn.profile_path}`} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      alt={conn.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-cinema-muted">{conn.name}</div>
                  )}
                  {/* Collaborative Count Badge */}
                  <div className="absolute inset-x-0 bottom-0 bg-cinema-gold text-cinema-void text-[8px] font-black text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {conn.count} FILMS
                  </div>
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-cinema-muted font-bold tracking-tight bg-white/5 py-3 rounded-2xl border border-white/5">
        Neural relationship analysis identifying the most frequent creative partners.
      </p>
    </div>
  );
}
