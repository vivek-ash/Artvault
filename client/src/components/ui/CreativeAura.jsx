import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineArrowPath } from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';

const AURAS = [
  {
    name: 'Terracotta Dream',
    gradient: 'from-[#c45d3e] via-[#d97a5e] to-[#c9a84c]',
    description: 'Warm, grounded, and rich with physical texture. Your art identity focuses on organic depth, landscapes, and classical tones.',
    tag: 'Classicist'
  },
  {
    name: 'Teal Ethereal',
    gradient: 'from-[#2d8686] via-[#3a9d8c] to-[#a384cc]',
    description: 'Futuristic, cool, and geometrically balanced. Your art identity values technical precision, character design, and digital depth.',
    tag: 'Futurist'
  },
  {
    name: 'Gold Radiance',
    gradient: 'from-[#c9a84c] via-[#d97a5e] to-[#c45d3e]',
    description: 'Bold, luxury-focused, and filled with spotlight contrast. Your art identity is abstract, premium, and spotlighted.',
    tag: 'Expressionist'
  },
  {
    name: 'Lavender Mist',
    gradient: 'from-[#a384cc] via-[#2d8686] to-[#c9a84c]',
    description: 'Soft, narrative-driven, and dreamy. Your art identity focuses on illustration, fantasy concept art, and ambient stories.',
    tag: 'Dreamer'
  }
];

const CreativeAura = () => {
  const { isDark } = useTheme();
  const [auraIndex, setAuraIndex] = useState(0);

  useEffect(() => {
    // Select random aura on initial render
    setAuraIndex(Math.floor(Math.random() * AURAS.length));
  }, []);

  const nextAura = () => {
    setAuraIndex((prev) => (prev + 1) % AURAS.length);
  };

  const currentAura = AURAS[auraIndex];

  return (
    <div className={`card p-6 overflow-hidden relative border ${
      isDark ? 'border-gallery-darkBorder bg-gallery-darkCard' : 'border-gallery-border bg-gallery-card'
    }`}>
      {/* Morphing Background Glow */}
      <style>{`
        @keyframes auraMorph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        @keyframes auraRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .aura-orb-element {
          animation: auraMorph 8s ease-in-out infinite, auraRotate 25s linear infinite;
        }
      `}</style>

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Animated Morphing Orb */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={auraIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 bg-gradient-to-tr ${currentAura.gradient} aura-orb-element blur-md opacity-80`}
            />
          </AnimatePresence>
          <div className="absolute inset-2 rounded-full bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white text-center p-2">
            <HiOutlineSparkles className="w-5 h-5 text-brand-gold animate-pulse mb-1" />
            <span className="text-[10px] font-semibold tracking-widest uppercase">{currentAura.tag}</span>
          </div>
        </div>

        {/* Aura Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
            <h4 className="font-display font-bold text-xl text-brand-terracotta">{currentAura.name}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isDark ? 'bg-white/10 text-brand-gold' : 'bg-black/5 text-brand-terracotta'
            }`}>
              Creative Aura
            </span>
          </div>
          
          <p className={`text-sm leading-relaxed mb-4 max-w-xl ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            {currentAura.description}
          </p>

          <button
            onClick={nextAura}
            className="btn-ghost text-xs flex items-center gap-1.5 !py-1.5 !px-3 hover:text-brand-terracotta"
          >
            <HiOutlineArrowPath className="w-4 h-4" /> Shift Aura Identity
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreativeAura;
