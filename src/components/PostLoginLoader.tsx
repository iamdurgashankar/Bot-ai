import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Cpu, ShieldCheck, Zap, Server } from 'lucide-react';

interface PostLoginLoaderProps {
  onComplete: () => void;
  userEmail?: string;
}

const loadingSteps = [
  { text: "Initializing Core Neural Processor...", icon: Cpu, duration: 600, color: "text-indigo-400" },
  { text: "Mapping Workspace Synapses & Layouts...", icon: Brain, duration: 700, color: "text-purple-400" },
  { text: "Verifying Admin Security Protocols...", icon: ShieldCheck, duration: 605, color: "text-emerald-400" },
  { text: "Synching Comparative Models Databases...", icon: Server, duration: 650, color: "text-sky-400" },
  { text: "Empowering AI Consensus Pipelines...", icon: Sparkles, duration: 550, color: "text-amber-400" },
  { text: "Access Authorization Granted! Entering Workspace...", icon: Zap, duration: 400, color: "text-rose-400" }
];

export const PostLoginLoader: React.FC<PostLoginLoaderProps> = ({ onComplete, userEmail }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [expression, setExpression] = useState<'idle' | 'wink' | 'excited' | 'glowing'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Periodically change facial expressions of the Big AI Bot
  useEffect(() => {
    const expressions: ('idle' | 'wink' | 'excited' | 'glowing')[] = ['glowing', 'excited', 'idle', 'wink', 'glowing'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % expressions.length;
      setExpression(expressions[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Update progress bar and loading text logs step-by-step
  useEffect(() => {
    let currentStep = 0;
    let stepTimer: NodeJS.Timeout;

    const runStep = () => {
      if (currentStep >= loadingSteps.length) {
        // Complete loading
        setProgress(100);
        setTimeout(() => {
          onComplete();
        }, 600);
        return;
      }

      const step = loadingSteps[currentStep];
      setStepIndex(currentStep);
      setConsoleLogs(prev => [...prev, `[SYSTEM] ${step.text}`]);
      
      // Animate progress smoothly within this step
      const startProgress = Math.floor((currentStep / loadingSteps.length) * 100);
      const endProgress = Math.floor(((currentStep + 1) / loadingSteps.length) * 100);
      
      let stepProgress = startProgress;
      const progressInterval = setInterval(() => {
        if (stepProgress < endProgress) {
          stepProgress += 1;
          setProgress(stepProgress);
        } else {
          clearInterval(progressInterval);
        }
      }, step.duration / (endProgress - startProgress));

      stepTimer = setTimeout(() => {
        clearInterval(progressInterval);
        currentStep++;
        runStep();
      }, step.duration);
    };

    runStep();

    return () => {
      clearTimeout(stepTimer);
    };
  }, []);

  const ActiveIcon = loadingSteps[stepIndex]?.icon || Sparkles;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Immersive ambient glowing network lines and bento backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[150px]" />
        
        {/* Subtle grid patterns overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f4614_1px,transparent_1px),linear-gradient(to_bottom,#3f3f4614_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center">
        {/* BIG AI BOT COMPONENT WITH BREATHING AND FLOATING ANIMATION */}
        <motion.div
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative flex flex-col items-center mb-8"
        >
          {/* Animated Glowing Aura */}
          <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl scale-95 opacity-80 animate-pulse pointer-events-none" />
          
          {/* External Antenna Sensor */}
          <div className="flex flex-col items-center -mb-1 relative z-10">
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                backgroundColor: ["#818cf8", "#c084fc", "#34d399", "#818cf8"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.9)]"
            />
            <div className="w-1 h-5 bg-zinc-700 shadow-inner" />
          </div>

          {/* Large Retro-Futuristic Hologram Screen Head */}
          <div className="w-44 h-36 bg-gradient-to-b from-zinc-900 to-black border-2 border-indigo-500/30 rounded-[40px] p-3.5 shadow-2xl relative flex flex-col items-center justify-center">
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 rounded-[38px] bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            
            {/* Golden ear joints */}
            <div className="absolute -left-3 w-3 h-10 bg-zinc-805 border border-zinc-700/60 rounded-l-md" />
            <div className="absolute -right-3 w-3 h-10 bg-zinc-805 border border-zinc-700/60 rounded-r-md" />

            {/* Glowing Screen Container */}
            <div className="w-full h-full bg-[#030712] rounded-3xl border border-zinc-900 flex flex-col items-center justify-center p-3 overflow-hidden relative">
              {/* Scanlines overlay effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
              
              {/* Dynamic Eye Matrix */}
              <div className="flex items-center justify-center gap-7 w-full h-full relative">
                {/* Background matrix mesh */}
                <div className="absolute inset-0 bg-[#4f46e5]/5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] bg-[size:16px_16px] opacity-10" />

                {/* Left Eye */}
                <motion.div
                  animate={expression === 'wink' ? { scaleY: 0.1 } : { scaleY: 1 }}
                  transition={{ duration: 0.15 }}
                  className="relative z-10"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center shadow-[0_0_12px_#6366f1,0_0_25px_#4f46e5]">
                    <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90 animate-ping absolute" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white relative z-20" />
                  </div>
                </motion.div>

                {/* Right Eye */}
                <motion.div
                  animate={expression === 'wink' ? { scaleY: 1 } : { scaleY: 1 }}
                  className="relative z-10"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center shadow-[0_0_12px_#6366f1,0_0_25px_#4f46e5]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </motion.div>
                
                {/* Animated happy blushing cheeks */}
                <div className="absolute bottom-1 left-2 w-3 h-1.5 bg-rose-500/40 rounded-full blur-[1px]" />
                <div className="absolute bottom-1 right-2 w-3 h-1.5 bg-rose-500/40 rounded-full blur-[1px]" />
              </div>

              {/* Speaker mouth lattice */}
              <div className="flex gap-1.5 mt-1 relative z-10 items-center justify-center">
                <motion.span 
                  animate={{ height: [3, 7, 3] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="w-1 bg-indigo-400 rounded-full" 
                />
                <motion.span 
                  animate={{ height: [3, 11, 3] }}
                  transition={{ repeat: Infinity, duration: 0.3, delay: 0.05 }}
                  className="w-1 bg-indigo-400 rounded-full" 
                />
                <motion.span 
                  animate={{ height: [3, 5, 3] }}
                  transition={{ repeat: Infinity, duration: 0.15, delay: 0.1 }}
                  className="w-1 bg-indigo-400 rounded-full" 
                />
                <motion.span 
                  animate={{ height: [3, 13, 3] }}
                  transition={{ repeat: Infinity, duration: 0.25, delay: 0.08 }}
                  className="w-1 bg-indigo-400 rounded-full" 
                />
                <motion.span 
                  animate={{ height: [3, 7, 3] }}
                  transition={{ repeat: Infinity, duration: 0.2, delay: 0.02 }}
                  className="w-1 bg-indigo-400 rounded-full" 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* WELCOME BANNER */}
        <div className="text-center space-y-1 z-10">
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-widest flex items-center justify-center gap-2">
            <ActiveIcon className={`w-5 h-5 animate-pulse ${loadingSteps[stepIndex]?.color || "text-indigo-400"}`} />
            SYNAPSE NEURAL LINK
          </h2>
          {userEmail && (
            <p className="text-xs font-mono text-zinc-500 lowercase tracking-tight">
              establishing session: <span className="text-indigo-600 font-bold">{userEmail}</span>
            </p>
          )}
        </div>

        {/* PROGRESS DISPLAY SECTION */}
        <div className="w-full mt-8 bg-white border border-zinc-200 p-6 rounded-3xl space-y-5 shadow-2xl relative z-10">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-600 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              STATUS: CONNECTING
            </span>
            <span className="text-indigo-600 font-extrabold font-mono text-sm tracking-widest">{progress}%</span>
          </div>

          {/* Smooth custom interactive progress path bar */}
          <div className="h-2.5 w-full bg-zinc-100 border border-zinc-200 rounded-xl overflow-hidden p-[2px]">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-lg shadow-[0_0_10px_rgba(129,140,248,0.5)]"
            />
          </div>

          {/* REAL TIME CONSOLE FEED LOGS */}
          <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 h-32 overflow-y-auto font-mono text-[10px] select-none text-zinc-600 scrollbar-thin">
            <div className="space-y-1.5">
              {consoleLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-1 text-zinc-700"
                >
                  <span className="text-indigo-600 font-bold select-none shrink-0">&gt;&gt;</span>
                  <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
                </motion.div>
              ))}
              <div className="text-[9px] text-zinc-500 opacity-60 italic animate-pulse mt-1 select-none">
                [LOG] holding active network handshake sequence...
              </div>
            </div>
          </div>
        </div>

        {/* Footer info element adhering strictly to the Anti-AI-Slop and architectural rules */}
        <div className="mt-6 flex items-center gap-1.5 select-none font-mono text-[9px] text-zinc-500">
          <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
          <span>PORTAL PROTOCOLS ARE FULLY ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};
