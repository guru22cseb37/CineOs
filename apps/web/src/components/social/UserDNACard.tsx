import { motion } from 'framer-motion';
import { Sparkles, Share2, Download, Zap } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function UserDNACard() {
  const { data: dna, isLoading } = useQuery({
    queryKey: ['user-dna'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/me/dna`);
      if (!res.ok) throw new Error('DNA sequencing failed');
      return res.json();
    }
  });

  if (isLoading || !dna) {
    return (
      <div className="h-[500px] w-full max-w-sm rounded-[3rem] bg-cinema-obsidian animate-pulse border border-white/5 flex items-center justify-center">
        <Zap className="w-12 h-12 text-cinema-primary animate-bounce" />
      </div>
    );
  }

  const { labels, values } = dna;
  const numPoints = labels.length;
  const size = 320;
  const center = size / 2;
  const radius = (size / 2) * 0.65;

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cinematic DNA',
          text: `Check out my CineOS movie profile! I'm ${values[0]}% into Cinematography and ${values[4]}% Complex.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-full max-w-sm aspect-[3/4] rounded-[3.5rem] p-8 overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cinema-primary/20 via-transparent to-cinema-gold/10 opacity-50" />
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cinema-primary/20 rounded-full blur-[100px] animate-pulse" />
      
      {/* Card Content */}
      <div className="relative h-full flex flex-col items-center justify-between text-center z-10">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-cinema-primary uppercase tracking-[0.4em]">Proprietary AI</span>
            <Sparkles className="w-4 h-4 text-cinema-gold" />
          </div>
          <h2 className="text-3xl font-black text-white italic leading-tight">Your Cinematic DNA</h2>
          <p className="text-[10px] text-cinema-muted uppercase tracking-widest mt-2">Sequenced from {dna.sampleSize} Masterpieces</p>
        </div>

        <div className="relative">
          <svg width={size} height={size} className="overflow-visible drop-shadow-[0_0_30px_rgba(173,255,47,0.2)]">
            {/* Background Grid */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
              <circle key={i} cx={center} cy={center} r={radius * r} fill="none" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
            ))}
            {labels?.map((_: string, i: number) => {
              const { x, y } = getPointCoors(i, 100);
              return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="white" strokeOpacity="0.1" />;
            })}

            {/* Polygon */}
            <motion.polygon
              points={polyPoints}
              fill="url(#userDnaGradient)"
              fillOpacity="0.4"
              stroke="var(--cinema-primary)"
              strokeWidth="4"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            {/* Labels */}
            {labels?.map((label: string, i: number) => {
              const { x, y } = getPointCoors(i, 120);
              return (
                <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fillOpacity="0.4" className="uppercase tracking-widest">
                  {label}
                </text>
              );
            })}

            <defs>
              <linearGradient id="userDnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ADFF2F" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-center space-x-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            <div className="flex flex-col items-center">
              <span className="text-white text-base mb-1">{values[0]}%</span>
              <span>VISUAL</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-white text-base mb-1">{values[4]}%</span>
              <span>DEPTH</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-white text-base mb-1">{values[2]}%</span>
              <span>PULSE</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 hover:bg-cinema-gold transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </button>
            <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[3.5rem] shadow-inner" />
    </motion.div>
  );
}
