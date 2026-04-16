'use client';

import { useQuery } from '@tanstack/react-query';
import { Camera, Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/lib/api';

interface SceneExplorerProps {
  movieId: string;
  movieTitle: string;
}

export default function SceneExplorer({ movieId, movieTitle }: SceneExplorerProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [trivia, setTrivia] = useState<string>('');
  const [isTriviaLoading, setIsTriviaLoading] = useState(false);

  const { data: imageData } = useQuery({
    queryKey: ['movie-images', movieId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/ai/movie-images/${movieId}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    }
  });

  const fetchTrivia = async (image: any) => {
    setSelectedImage(image);
    setTrivia('');
    setIsTriviaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/scene-trivia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          movieTitle, 
          sceneDescription: `A scene with aspect ratio ${image.aspect_ratio} and dominant colors.`
        })
      });
      const data = await res.json();
      setTrivia(data.trivia);
    } catch {
      setTrivia('Film history was lost in the archives!');
    } finally {
      setIsTriviaLoading(false);
    }
  };

  const images = imageData?.backdrops?.slice(0, 8) || [];

  if (images.length === 0) return null;

  return (
    <div className="mt-20 px-4 md:px-0">
      <div className="flex items-center gap-3 mb-8">
        <Camera className="text-cinema-gold" />
        <h2 className="text-2xl font-bold text-white">Scene Explorer</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {images.map((img: any, i: number) => (
          <motion.div
            key={img.file_path}
            whileHover={{ scale: 1.05 }}
            onClick={() => fetchTrivia(img)}
            className="flex-shrink-0 w-64 md:w-80 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer snap-start relative group"
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              alt="Scene"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Info className="text-white w-8 h-8" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-6 rounded-2xl bg-cinema-obsidian border border-cinema-gold/30 relative"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            <h4 className="text-cinema-gold font-bold mb-2 flex items-center gap-2">
              <Camera size={16} /> Scene Trivia
            </h4>
            {isTriviaLoading ? (
              <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded" />
            ) : (
              <p className="text-white/80 leading-relaxed italic">"{trivia}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
