import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: string, vibe: string) => void;
  movieTitle: string;
}

export default function JournalModal({ isOpen, onClose, onSubmit, movieTitle }: JournalModalProps) {
  const [entry, setEntry] = useState('');
  const [vibe, setVibe] = useState('Satisfied');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const moods = ['Mind-blown', 'Emotional', 'Satisfied', 'Perplexed', 'Disappointed'];

  const handleAISuggest = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/ai/journal-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: movieTitle, rating: 8, mood: vibe })
      });
      const data = await res.json();
      if (data.entry) setEntry(data.entry);
    } catch (error) {
      console.error('Failed to generate entry', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(entry, vibe);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-cinema-void/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-cinema-obsidian border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
          >
            {isSubmitted ? (
              <div className="p-20 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-cinema-jade/20 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-cinema-jade" />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2 italic">SEQUENCED</h2>
                <p className="text-cinema-muted">Your reflection has been added to the Cinematic Archive.</p>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black text-cinema-gold uppercase tracking-[0.3em]">AI Journal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <X className="w-5 h-5 text-white/50" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-white italic truncate">{movieTitle}</h3>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">How did it leave you?</label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((m) => (
                        <button
                          key={m}
                          onClick={() => setVibe(m)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            vibe === m 
                              ? 'bg-cinema-gold text-black border-cinema-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                              : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Cinematic Reflection</label>
                      <button 
                        onClick={handleAISuggest}
                        disabled={isGenerating}
                        className="flex items-center space-x-2 text-[10px] font-black text-cinema-gold hover:text-white transition-colors group"
                      >
                        <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12'}`} />
                        <span>{isGenerating ? 'ANALYZING...' : 'AI SUGGEST'}</span>
                      </button>
                    </div>
                    <textarea 
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                      placeholder="Capture the vibe, the cinematography, or that one scene..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cinema-gold/50 transition-colors resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={!entry}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-cinema-gold transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    <Send className="w-5 h-5" />
                    <span>Archive Flashback</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
