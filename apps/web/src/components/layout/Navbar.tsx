'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Menu, Clapperboard } from 'lucide-react';
import AISearchModal from '@/components/ai/AISearchModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-cinema-void/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-cinema-gold tracking-tighter">
            CINEOS<span className="text-white">.</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-cinema-gold transition-colors">Home</Link>
            <Link href="/movies" className="text-sm font-medium text-cinema-muted hover:text-white transition-colors">Movies</Link>
            <Link href="/actors" className="text-sm font-medium text-cinema-muted hover:text-white transition-colors">Actors</Link>
            <Link href="/party" className="text-sm font-medium text-cinema-muted hover:text-cinema-jade transition-colors">👥 Watch Party</Link>
            <Link href="/onboarding" className="text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors">Calibrate</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <AISearchModal />
          <div className="hidden md:flex w-8 h-8 rounded-full bg-cinema-obsidian border border-white/10 items-center justify-center overflow-hidden cursor-pointer hover:border-cinema-gold transition-colors">
            <User className="w-4 h-4 text-cinema-muted" />
          </div>
          <button className="md:hidden text-cinema-muted hover:text-white transition-colors" onClick={() => setMobileOpen(p => !p)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-cinema-void/95 backdrop-blur-md border-t border-white/5 px-4 py-4 flex flex-col gap-4"
        >
          <Link href="/" className="text-sm" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/movies" className="text-sm text-cinema-muted" onClick={() => setMobileOpen(false)}>Movies</Link>
          <Link href="/actors" className="text-sm text-cinema-muted" onClick={() => setMobileOpen(false)}>Actors</Link>
          <Link href="/party" className="text-sm text-cinema-muted" onClick={() => setMobileOpen(false)}>👥 Watch Party</Link>
          <Link href="/onboarding" className="text-sm text-cinema-muted" onClick={() => setMobileOpen(false)}>Calibrate Taste</Link>
        </motion.div>
      )}
    </motion.header>
  );
}
