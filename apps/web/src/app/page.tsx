'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroBanner from '@/components/movie/HeroBanner';

import MovieRow from '@/components/movie/MovieRow';
import ToneRadar from '@/components/search/ToneRadar';
import { Sparkles, Users, Clapperboard, Flame, Star, Globe2, Zap } from 'lucide-react';

import { API_BASE } from '@/lib/api';

const fetchMovies = async (path: string) => {
  const res = await fetch(`${API}/movies/${path}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
};

const FeatureCard = ({
  icon, title, desc, href, color
}: { icon: React.ReactNode; title: string; desc: string; href: string; color: string }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative rounded-2xl overflow-hidden border border-white/10 bg-cinema-obsidian p-6 cursor-pointer group h-full`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cinema-gold transition-colors">{title}</h3>
      <p className="text-cinema-muted text-sm leading-relaxed">{desc}</p>
      <div className="absolute bottom-4 right-4 text-cinema-muted group-hover:text-cinema-gold transition-colors text-sm font-semibold">
        Try it →
      </div>
    </motion.div>
  </Link>
);

export default function Home() {
  const { data: trending } = useQuery({ queryKey: ['trending'], queryFn: () => fetchMovies('trending') });
  const { data: popular } = useQuery({ queryKey: ['popular'], queryFn: () => fetchMovies('popular') });
  const { data: topRated } = useQuery({ queryKey: ['topRated'], queryFn: () => fetchMovies('discover?sort_by=vote_average.desc&vote_count.gte=1000') });
  const { data: action } = useQuery({ queryKey: ['action'], queryFn: () => fetchMovies('discover?with_genres=28&sort_by=popularity.desc') });
  const { data: korean } = useQuery({ queryKey: ['korean'], queryFn: () => fetchMovies('discover?language=ko&sort_by=popularity.desc') });
  const { data: hindi } = useQuery({ queryKey: ['hindi'], queryFn: () => fetchMovies('discover?language=hi&sort_by=popularity.desc') });
  const { data: tamil } = useQuery({ queryKey: ['tamil'], queryFn: () => fetchMovies('discover?language=ta') });
  const { data: malayalam } = useQuery({ queryKey: ['malayalam'], queryFn: () => fetchMovies('discover?language=ml') });
  const { data: scifi } = useQuery({ queryKey: ['scifi'], queryFn: () => fetchMovies('discover?with_genres=878&sort_by=popularity.desc') });
  const { data: horror } = useQuery({ queryKey: ['horror'], queryFn: () => fetchMovies('discover?with_genres=27&sort_by=popularity.desc') });
  const { data: animation } = useQuery({ queryKey: ['animation'], queryFn: () => fetchMovies('discover?with_genres=16&sort_by=vote_average.desc&vote_count.gte=500') });
  const { data: japanese } = useQuery({ queryKey: ['japanese'], queryFn: () => fetchMovies('discover?language=ja&sort_by=popularity.desc') });

  const heroMovie = trending?.results?.[2] || trending?.results?.[0] || null;

  return (
    <div className="pb-20">
      <HeroBanner movie={heroMovie} />

      {/* Tone Radar Search */}
      <section className="container mx-auto px-4 md:px-12 -mt-10 mb-16 relative z-30">
        <ToneRadar />
      </section>

      {/* AI Features Showcase */}
      <section className="relative z-20 container mx-auto px-4 md:px-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-cinema-gold uppercase tracking-widest mb-4">Powered by Groq AI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-amber-400" />}
              title="Vibe Search"
              desc='Search by feeling — "a tense 90s thriller with dark themes"'
              href="/"
              color="bg-amber-500/10"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-cyan-400" />}
              title="Taste Calibration"
              desc="Swipe movies Tinder-style to calibrate your personal AI taste profile."
              href="/onboarding"
              color="bg-cyan-500/10"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-emerald-400" />}
              title="Watch Party AI"
              desc="Let AI resolve movie night arguments. One movie everyone will love."
              href="/party"
              color="bg-emerald-500/10"
            />
            <FeatureCard
              icon={<Clapperboard className="w-6 h-6 text-purple-400" />}
              title="Auto-Trailers"
              desc="Hover any movie card for 1.5s to watch the trailer automatically play."
              href="/movies"
              color="bg-purple-500/10"
            />
          </div>
        </motion.div>
      </section>

      {/* Movie Rows */}
      <div className="space-y-2">
        <MovieRow
          title="🔥 Trending This Week"
          movies={trending?.results || []}
          icon={<Flame className="w-5 h-5 text-orange-400" />}
        />
        <MovieRow
          title="⭐ Top Rated All Time"
          movies={topRated?.results || []}
          icon={<Star className="w-5 h-5 text-cinema-gold" />}
        />
        <MovieRow
          title="🌍 Popular on CineOS"
          movies={popular?.results || []}
        />
        <MovieRow
          title="💥 Action & Adventure"
          movies={action?.results || []}
        />
        <MovieRow
          title="🤖 Sci-Fi Universe"
          movies={scifi?.results || []}
        />
        <MovieRow
          title="😱 Horror & Thriller"
          movies={horror?.results || []}
        />

        {/* Regional divider */}
        <div className="container mx-auto px-4 md:px-12 pt-8 pb-2">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-cinema-gold" />
            <h2 className="text-lg font-bold text-white">World Cinema</h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        </div>

        <MovieRow title="🇰🇷 Korean Cinema (Hallyu)" movies={korean?.results || []} />
        <MovieRow title="🇮🇳 Bollywood & Indian Cinema" movies={hindi?.results || []} />
        <MovieRow title="🎬 Tamil Cinema (Kollywood)" movies={tamil?.results || []} />
        <MovieRow title="🌴 Malayalam Cinema" movies={malayalam?.results || []} />
        <MovieRow title="🗾 Japanese Cinema" movies={japanese?.results || []} />
        <MovieRow
          title="🎨 Animation Masterpieces"
          movies={animation?.results || []}
        />
      </div>
    </div>
  );
}
