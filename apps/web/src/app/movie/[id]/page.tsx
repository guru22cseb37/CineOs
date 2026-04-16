'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Plus, BookOpen, Calendar, Star, Ghost } from 'lucide-react';


import MovieRow from '@/components/movie/MovieRow';
import DynamicAtmosphere from '@/components/theme/DynamicAtmosphere';

import MovieCritics from '@/components/movie/MovieCritics';
import DirectorVision from '@/components/movie/DirectorVision';
import CineDNARadar from '@/components/movie/CineDNARadar';
import SceneExplorer from '@/components/movie/SceneExplorer';
import TrailerModal from '@/components/movie/TrailerModal';
import JournalModal from '@/components/movie/JournalModal';
import MoodToScene from '@/components/movie/MoodToScene';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function MovieDetail({ params }: { params: { id: string } }) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedVideoKey, setSelectedVideoKey] = useState('');
  const [isWatched, setIsWatched] = useState(false);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', params.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch movie');
      return res.json();
    }
  });

  const { data: videoData } = useQuery({
    queryKey: ['movie-videos', params.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/${params.id}/videos`);
      if (!res.ok) return { results: [] };
      return res.json();
    },
    enabled: !!movie
  });

  const { data: providers } = useQuery({
    queryKey: ['movie-providers', params.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/${params.id}/providers`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!movie
  });

  if (isLoading || !movie) {
    return <div className="h-screen bg-cinema-void animate-pulse flex items-center justify-center text-cinema-gold font-black tracking-widest italic uppercase">Sequencing...</div>;
  }

  const directors = movie.credits?.crew?.filter((c: any) => c.job === 'Director') || [];
  const topCast = movie.credits?.cast?.slice(0, 10) || [];
  const similarMovies = movie.similar?.results || [];

  const handlePlayTrailer = () => {
    const videos = videoData?.results || [];
    
    // Priority: Trailer > Teaser > Clip > Featurette > Any YouTube
    const bestVideo = 
      videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
      videos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') || 
      videos.find((v: any) => v.type === 'Clip' && v.site === 'YouTube') || 
      videos.find((v: any) => v.site === 'YouTube');
    
    if (bestVideo) {
      setSelectedVideoKey(bestVideo.key);
      setIsTrailerOpen(true);
    } else {
      const searchQuery = encodeURIComponent(`${movie.title} ${movie.release_date?.substring(0, 4)} trailer`);
      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    }
  };

  const handleToggleWatched = async () => {
    setIsWatched(true);
    setIsJournalOpen(true);
    
    // Add to history in background
    try {
      await fetch(`${API_BASE}/users/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, rating: 8 }) // Default rating
      });
    } catch {
      console.warn('History sync failed');
    }
  };

  const handleJournalSubmit = async (entry: string, vibe: string) => {
    try {
      await fetch(`${API_BASE}/users/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          movieId: movie.id, 
          movieTitle: movie.title, 
          entry, 
          vibe 
        })
      });
    } catch {
      console.error('Journal sync failed');
    }
  };

  const watchOptions = providers?.flatrate || providers?.rent || providers?.buy || [];

  return (
    <div className="pb-20">
      <DynamicAtmosphere imagePath={movie.backdrop_path} />
      
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoKey={selectedVideoKey} 
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSubmit={handleJournalSubmit}
        movieTitle={movie.title}
      />

      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0 z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-cinema-void/70 to-cinema-void/10" />
        </div>
        
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-3/4 flex gap-8 items-center z-10">
          <motion.img
            initial={{ opacity: 0, scale: 0.9, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-48 md:w-72 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 hidden md:block hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-[0.9] tracking-tighter"
            >
              {movie.title}
            </motion.h1>
            <div className="flex items-center space-x-4 mb-6 text-sm font-black uppercase tracking-widest text-white/50">
              <span className="text-cinema-jade">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{movie.release_date?.substring(0, 4)}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{movie.runtime}m</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-cinema-gold">21:9 UltraWide</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-white/30 font-bold">Kodak 35mm Style</span>
              <div className="flex space-x-2">
                {movie.genres?.slice(0, 2).map((g: any) => (
                  <span key={g.id} className="border border-white/10 px-3 py-1 rounded-full backdrop-blur-3xl bg-white/5 text-[10px]">{g.name}</span>
                ))}
              </div>
            </div>
            
            {/* Watch Providers Snippet */}
            {watchOptions.length > 0 && (
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-[10px] font-black text-cinema-gold uppercase tracking-widest">Available On:</span>
                <div className="flex -space-x-2">
                  {watchOptions.slice(0, 4).map((provider: any) => (
                    <motion.div 
                      key={provider.provider_id}
                      whileHover={{ scale: 1.2, zIndex: 20 }}
                      className="w-8 h-8 rounded-lg overflow-hidden border-2 border-cinema-void bg-white relative group cursor-pointer"
                      title={provider.provider_name}
                      onClick={() => window.open(providers?.link, '_blank')}
                    >
                      <img src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                  {watchOptions.length > 4 && (
                    <div className="w-8 h-8 rounded-lg bg-cinema-glass border-2 border-cinema-void flex items-center justify-center text-[8px] font-bold text-white">
                      +{watchOptions.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-cinema-muted text-lg max-w-3xl mb-10 leading-relaxed line-clamp-3 md:line-clamp-none font-medium"
            >
              {movie.overview}
            </motion.p>
            <div className="flex items-center space-x-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayTrailer}
                className="flex items-center space-x-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-cinema-gold transition-all shadow-2xl shadow-white/5 group"
              >
                <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                <span>Experience</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWatched}
                className={`flex items-center space-x-3 px-10 py-4 rounded-2xl font-black text-lg transition-all ${
                  isWatched 
                    ? 'bg-cinema-jade text-black' 
                    : 'bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {isWatched ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                <span>{isWatched ? 'Watched' : 'Watchlist'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <MovieCritics title={movie.title} overview={movie.overview} />
          </div>
          <div className="lg:mt-12">
            <CineDNARadar movieId={movie.id} title={movie.title} overview={movie.overview} />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topCast.map((actor: any) => (
                <div key={actor.id} className="text-center group cursor-pointer">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-cinema-gold transition-colors shadow-xl">
                    {actor.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="w-full h-full object-cover" alt={actor.name} />
                    ) : (
                      <div className="w-full h-full bg-cinema-obsidian" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{actor.name}</h4>
                  <p className="text-xs text-cinema-muted truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Crew</h2>
            <div className="space-y-4">
              <div className="p-4 bg-cinema-glass rounded-xl border border-white/5">
                <span className="text-cinema-muted block text-xs uppercase tracking-wider mb-1">Director</span>
                <span className="text-white font-medium">{directors.map((d: any) => d.name).join(', ') || 'Unknown'}</span>
              </div>
              <div className="p-4 bg-cinema-glass rounded-xl border border-white/5">
                <span className="text-cinema-muted block text-xs uppercase tracking-wider mb-1">Production</span>
                <span className="text-white font-medium leading-tight">{movie.production_companies?.map((pc: any) => pc.name).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        <DirectorVision title={movie.title} overview={movie.overview} />

        <MoodToScene movieTitle={movie.title} />

        <SceneExplorer movieId={movie.id} movieTitle={movie.title} />

        <div className="mt-20">
          <MovieRow title="More Like This" movies={similarMovies} />
        </div>
      </div>
    </div>
  );
}


