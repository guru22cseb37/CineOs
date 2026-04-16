import Link from 'next/link';
import { Film, Sparkles, ExternalLink } from 'lucide-react';

const LINKS = {
  Discover: [
    { label: 'Home', href: '/' },
    { label: 'Popular Movies', href: '/movies' },
    { label: 'Actors A-Z', href: '/actors' },
    { label: 'AI Vibe Search', href: '/search' },
  ],
  Features: [
    { label: 'Calibrate Taste', href: '/onboarding' },
    { label: 'Watch Party AI', href: '/party' },
    { label: 'Auto-Trailers', href: '/movies' },
  ],
  Genres: [
    { label: 'Action', href: '/movies?genre=28' },
    { label: 'Horror', href: '/movies?genre=27' },
    { label: 'Sci-Fi', href: '/movies?genre=878' },
    { label: 'Romance', href: '/movies?genre=10749' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-cinema-void/80 backdrop-blur-md mt-20">
      <div className="container mx-auto px-4 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-3xl font-black text-cinema-gold tracking-tighter">
              CINEOS<span className="text-white">.</span>
            </Link>
            <p className="text-cinema-muted text-sm mt-3 leading-relaxed max-w-xs">
              The world's most intelligent movie discovery platform. Powered by Groq AI and TMDB.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-cinema-muted/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3 text-cinema-gold" />
                Groq LLaMA 3.3 70B
              </div>
              <div className="flex items-center gap-2 text-xs text-cinema-muted/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <Film className="w-3 h-3 text-cyan-400" />
                TMDB API
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-cinema-muted text-sm hover:text-cinema-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cinema-muted/60 text-xs">
            © {new Date().getFullYear()} CineOS. Movie data provided by{' '}
            <a href="https://themoviedb.org" target="_blank" rel="noreferrer" className="text-cinema-gold hover:underline">TMDB</a>.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-cinema-muted/60 hover:text-cinema-gold transition-colors flex items-center gap-1 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> GitHub
            </a>
            <a href="#" className="text-cinema-muted/60 hover:text-cinema-gold transition-colors flex items-center gap-1 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Twitter
            </a>
            <a href="#" className="text-cinema-muted/60 hover:text-cinema-gold transition-colors flex items-center gap-1 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
