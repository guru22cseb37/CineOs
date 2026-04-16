'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string;
}

export default function TrailerModal({ isOpen, onClose, videoKey }: TrailerModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            onClick={onClose} 
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Header / Actions */}
            <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-4">
              <a 
                href={`https://www.youtube.com/watch?v=${videoKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white flex items-center gap-2 text-xs font-bold"
              >
                <ExternalLink size={16} />
                <span>Open in YouTube</span>
              </a>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player */}
            {videoKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-cinema-muted">
                <p className="text-xl font-bold">No trailer available for this movie.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
