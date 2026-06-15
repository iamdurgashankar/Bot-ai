import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export const InteractiveBot: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [expression, setExpression] = useState<'idle' | 'happy' | 'curious' | 'dizzy'>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('Bleep bloop! Powering up diagnostics...');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const quotes = [
    "Hello! Ready to orchestrate supreme intelligence?",
    "No active agents found in the collective. Let's assemble one!",
    "Bloop... Parallel processing speed is within normal variables.",
    "Did you know? Parallel execution slices hallucination rates!",
    "My neural pathways are warm, cozy, and highly responsive.",
    "Click me again! I dare you!",
    "Command approved: Searching the sector for active subroutines...",
    "Connecting consensus merger modules..."
  ];

  // periodic eye blink interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (expression === 'idle') {
        const nextExp = Math.random() > 0.7 ? 'curious' : 'idle';
        setExpression(nextExp);
        setTimeout(() => setExpression('idle'), 800);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, [expression]);

  // handle mouse offset for parallax looking tilt action
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate normalized offset (-1 to 1)
    const rawX = (e.clientX - centerX) / (rect.width / 2);
    const rawY = (e.clientY - centerY) / (rect.height / 2);
    
    // Clamp values
    const x = Math.max(-1, Math.min(1, rawX));
    const y = Math.max(-1, Math.min(1, rawY));
    
    setMousePos({ x, y });
    
    if (expression === 'idle') {
      setExpression('curious');
    }
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setExpression('idle');
    setShowBubble(false);
  };

  const handleMouseEnter = () => {
    setShowBubble(true);
    setBubbleText(quotes[Math.floor(Math.random() * 4)]); // random from first 4
  };

  // Click handler: explodes particles, ticks up click count, shifts expressions, yields custom bubbles
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Click tracking dizzy matrix
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Spawn sparkle particles
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const colors = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f43f5e'];
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      return {
        id: Date.now() + idx,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8
      };
    });
    
    setParticles((prev) => [...prev, ...newParticles]);
    
    // Direct state switches
    if (newCount >= 6) {
      setExpression('dizzy');
      setBubbleText("Dizzy... critical buffer overflow! Click limit reached!");
      setShowBubble(true);
      // Reset after status check
      setTimeout(() => {
        setExpression('idle');
        setClickCount(0);
      }, 4000);
    } else {
      setExpression('happy');
      setBubbleText(quotes[Math.floor(Math.random() * quotes.length)]);
      setShowBubble(true);
      setTimeout(() => {
        setExpression('idle');
      }, 1500);
    }
  };

  // particle animation looping
  useEffect(() => {
    if (particles.length === 0) return;
    
    const frame = requestAnimationFrame(() => {
      setParticles((prev) => 
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity effect
            vx: p.vx * 0.96 // drag
          }))
          // only keep inside local visual boundaries
          .filter((p) => p.y < 180 && p.x > -20 && p.x < 180)
      );
    });
    
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      
      {/* Dynamic Voice/Thinking Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute -top-24 max-w-[240px] bg-white border border-slate-200 text-slate-800 text-[11px] font-bold py-2.5 px-3.5 rounded-2xl shadow-xl z-20 text-center select-none"
          >
            <div className="relative">
              {bubbleText}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-r border-b border-slate-200"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bot Animation Outer frame - Keeps target criteria */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className="w-24 h-24 bg-gradient-to-b from-indigo-50/60 to-white hover:from-indigo-100 hover:to-indigo-50/80 text-indigo-600 border border-indigo-100 hover:border-indigo-200 rounded-3xl flex flex-col items-center justify-center mb-6 cursor-pointer select-none relative overflow-hidden transition-all duration-300 shadow active:scale-[0.96]"
      >
        {/* Radar concentric wave rings */}
        {expression === 'curious' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-indigo-300 m-auto w-12 h-12 pointer-events-none"
          />
        )}
        
        {/* Particle Canvas Layer */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '9999px',
              boxShadow: `0 0 8px ${p.color}`,
              opacity: Math.max(0, 1 - (p.y / 180)),
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        ))}
 
        {/* Parallax Looking Robot Grid */}
        <motion.div
          animate={{
            x: mousePos.x * 12,
            y: mousePos.y * 10,
            rotate: mousePos.x * 6
          }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          className="flex flex-col items-center justify-center z-10"
        >
          {/* Antenna with status flashing light */}
          <div className="flex flex-col items-center -mb-0.5">
            <motion.div
              animate={{
                backgroundColor: expression === 'dizzy' ? '#f43f5e' : expression === 'happy' ? '#34d399' : '#6366f1',
                scale: expression === 'happy' ? [1, 1.4, 1] : 1
              }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.6)]"
            />
            <div className="w-0.5 h-2 bg-slate-300" />
          </div>
 
          {/* Actual Robot Head */}
          <motion.div
            animate={{
              y: expression === 'happy' ? [0, -6, 0] : [0, 2, 0]
            }}
            transition={
              expression === 'happy' 
                ? { duration: 0.4, repeat: 2 }
                : { repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "easeInOut" }
            }
            className="w-14 h-11 bg-white border border-slate-250/80 rounded-2xl flex flex-col items-center justify-center p-1.5 relative shadow-sm"
          >
            {/* Ambient Eye Screen Background */}
            <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center gap-3.5 px-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.6))]" />
              
              {/* Left Eye */}
              <motion.div className="relative">
                {expression === 'idle' && (
                  <motion.div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                )}
                {expression === 'curious' && (
                  <motion.div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </motion.div>
                )}
                {expression === 'happy' && (
                  <svg className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {expression === 'dizzy' && (
                  <span className="text-rose-500 font-extrabold text-[12px] leading-none select-none font-mono">×</span>
                )}
              </motion.div>
 
              {/* Right Eye */}
              <motion.div className="relative">
                {expression === 'idle' && (
                  <motion.div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                )}
                {expression === 'curious' && (
                  <motion.div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </motion.div>
                )}
                {expression === 'happy' && (
                  <svg className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {expression === 'dizzy' && (
                  <span className="text-rose-500 font-extrabold text-[12px] leading-none select-none font-mono">×</span>
                )}
              </motion.div>
            </div>
            
            {/* Cute side bolts */}
            <div className="absolute -left-1 w-1 h-3 bg-slate-200 rounded-l" />
            <div className="absolute -right-1 w-1 h-3 bg-slate-200 rounded-r" />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating hints overlay */}
      <span className="text-[10px] font-mono tracking-wider text-zinc-550 group-hover:text-indigo-400 transition-colors uppercase select-none">
        {expression === 'dizzy' ? 'System Overload' : expression === 'happy' ? 'Hehe! Bloop!' : 'Hover & Click'}
      </span>
    </div>
  );
};
