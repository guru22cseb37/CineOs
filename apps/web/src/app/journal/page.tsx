import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Star, Ghost } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function JournalPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/me`);
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center text-cinema-gold font-black italic">OPENING ARCHIVE...</div>;

  const journalEntries = user?.journal || [];

  return (
    <div className="min-h-screen pb-32 pt-24 container mx-auto px-4 md:px-12">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-sm font-black text-cinema-primary uppercase tracking-[0.4em] mb-2">Personal Archive</h1>
          <h2 className="text-5xl font-black text-white italic">Cinematic Journal</h2>
        </div>
        <div className="w-16 h-16 rounded-3xl bg-cinema-primary/10 flex items-center justify-center border border-cinema-primary/20">
          <BookOpen className="w-8 h-8 text-cinema-primary" />
        </div>
      </div>

      {journalEntries.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center opacity-30">
          <Ghost className="w-20 h-20 mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">The Archive is Silent</h3>
          <p className="text-sm text-cinema-muted">Mark a movie as watched and write your first reflection.</p>
          <Link href="/" className="mt-8 px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-cinema-gold transition-all">Discover Movies</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {journalEntries.map((entry: any, index: number) => (
            <motion.div
              key={entry.movieId + index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12 md:pl-20 border-l border-white/5"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-cinema-primary shadow-[0_0_15px_rgba(173,255,47,0.5)]" />
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2 text-[10px] font-black text-cinema-muted uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    {entry.vibe && (
                      <span className="px-3 py-1 rounded-full bg-cinema-primary/10 border border-cinema-primary/20 text-[9px] font-black text-cinema-primary uppercase">
                        {entry.vibe}
                      </span>
                    )}
                  </div>
                  
                  <Link href={`/movie/${entry.movieId}`}>
                    <h3 className="text-3xl font-black text-white hover:text-cinema-gold transition-colors mb-4">{entry.movieTitle}</h3>
                  </Link>
                  
                  <div className="relative p-8 rounded-[2rem] bg-cinema-glass border border-white/5 group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BookOpen className="w-20 h-20" />
                    </div>
                    <p className="text-xl text-cinema-muted font-medium italic leading-relaxed relative z-10">
                      "{entry.entry}"
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-4">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Memory Type</span>
                    <span className="text-white font-bold">Deep Impression</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-cinema-primary/5 border border-cinema-primary/10">
                    <span className="text-[10px] font-black text-cinema-primary uppercase tracking-widest block mb-1">Influence Score</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-cinema-primary text-cinema-primary' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
