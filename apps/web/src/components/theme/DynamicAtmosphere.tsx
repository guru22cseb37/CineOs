import { motion } from 'framer-motion';

interface DynamicAtmosphereProps {
  imagePath: string;
}

export default function DynamicAtmosphere({ imagePath }: DynamicAtmosphereProps) {
  const [dominantColor, setDominantColor] = useState('#d4af37');

  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `https://image.tmdb.org/t/p/w200${imagePath}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: Record<string, number> = {};
      const step = 20;

      for (let i = 0; i < imageData.length; i += 4 * step) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      const primary = sortedColors[0]?.[0] || '#d4af37';
      
      setDominantColor(primary);
      document.documentElement.style.setProperty('--cineos-primary', primary);
      canvas.remove();
    };
  }, [imagePath]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-cinema-void">
      {/* Living Atmospheric Layer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute inset-0"
      >
        <div 
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[150px] animate-mesh-float-1"
          style={{ backgroundColor: dominantColor }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-mesh-float-2 opacity-50"
          style={{ backgroundColor: `${dominantColor}88` }}
        />
        <div 
          className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] animate-mesh-float-3 opacity-30"
          style={{ backgroundColor: dominantColor }}
        />
      </motion.div>
      
      {/* Grain & Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-void via-transparent to-cinema-void/40" />
    </div>
  );
}
