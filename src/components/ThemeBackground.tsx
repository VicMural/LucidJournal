import React from 'react';
import { motion } from 'motion/react';

export const PALETTES: Record<string, string[]> = {
  twilight: ["#4c1d95", "#ea580c", "#0284c7", "#be185d"], // Deep purple, vivid orange, cyan, magenta
  prism: ["#0284c7", "#0369a1", "#fbbf24", "#e11d48"], // Cyan, sapphire, amber, rose
  ether: ["#1e1b4b", "#4338ca", "#0f766e", "#34d399"], // Midnight violet, indigo, teal, emerald
  void: ["#09090b", "#27272a", "#312e81", "#18181b"], // Almost black, charcoal, deep navy, pitch
  ember: ["#450a0a", "#9a3412", "#b91c1c", "#ea580c"], // Dark crimson, burnt orange, bright red
  abyss: ["#020617", "#0f172a", "#1e3a8a", "#0284c7"], // Midnight blue, slate, sapphire, ocean
};

export function ThemeBackground({ themeName = 'twilight', speed = 50 }: { themeName: string, speed: number }) {
  const colors = PALETTES[themeName] || PALETTES.twilight;
  const duration = 8 + ((100 - speed) / 100) * 40; // 8s to 48s for a slower, majestic breathe

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#030305]">
      {/* 
        Using screen blending on a very dark base with 50-60% opacity provides 
        rich, vivid color blends that won't blind the user at 4:00 AM. 
      */}
      <div className="absolute inset-0 opacity-55 mix-blend-screen">
        <motion.div
          animate={{
            x: ["0%", "15%", "-10%", "0%"],
            y: ["0%", "-15%", "10%", "0%"],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] md:w-[45vw] md:h-[45vw] rounded-full filter blur-[120px] md:blur-[180px]"
          style={{ backgroundColor: colors[0] }}
        />
        <motion.div
          animate={{
            x: ["0%", "-15%", "15%", "0%"],
            y: ["0%", "10%", "-15%", "0%"],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: duration * 1.3, ease: "easeInOut", repeat: Infinity, delay: duration * 0.1 }}
          className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full filter blur-[120px] md:blur-[180px]"
          style={{ backgroundColor: colors[1] }}
        />
        <motion.div
          animate={{
            x: ["0%", "10%", "-20%", "0%"],
            y: ["0%", "-10%", "20%", "0%"],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: duration * 1.1, ease: "easeInOut", repeat: Infinity, delay: duration * 0.2 }}
          className="absolute bottom-[-10%] left-[10%] w-[65vw] h-[65vw] md:w-[50vw] md:h-[50vw] rounded-full filter blur-[120px] md:blur-[180px]"
          style={{ backgroundColor: colors[2] }}
        />
        <motion.div
          animate={{
            x: ["0%", "-20%", "10%", "0%"],
            y: ["0%", "15%", "-20%", "0%"],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{ duration: duration * 1.4, ease: "easeInOut", repeat: Infinity, delay: duration * 0.3 }}
          className="absolute bottom-[-20%] right-[-5%] w-[75vw] h-[75vw] md:w-[55vw] md:h-[55vw] rounded-full filter blur-[120px] md:blur-[180px]"
          style={{ backgroundColor: colors[3] }}
        />
      </div>

      {/* Texture overlay: noise */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px'
        }}
      />

      {/* Texture overlay: vertical striations (ribbed glass effect) */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{ 
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, #ffffff 2px, #ffffff 4px)'
        }}
      />
    </div>
  );
}
