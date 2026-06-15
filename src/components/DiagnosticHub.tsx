import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  Code2, 
  Cpu, 
  Activity, 
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Import our sub-components safely
import { WebsiteAnalysis } from './WebsiteAnalysis';
import { DesignToCode } from './DesignToCode';
import { PromptOptimizer } from './PromptOptimizer';

export const DiagnosticHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'website' | 'code' | 'prompt'>('website');

  const subTabs = [
    { 
      id: 'website' as const, 
      label: 'Website Auditor', 
      desc: 'Evaluate UI, SEO & performance structures', 
      icon: Globe,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    { 
      id: 'code' as const, 
      label: 'Design-to-Code', 
      desc: 'Convert screenshots into responsive components', 
      icon: Code2,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    { 
      id: 'prompt' as const, 
      label: 'Prompt Re-engineer', 
      desc: 'Detect linguistic ambiguity & refine instructions', 
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/25'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 select-none">
      {/* Aesthetic glowing background details */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-10 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        
        {/* Dynamic cyber dashboard header */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 font-mono">
                AI Diagnostics Suite
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Diagnostics & Auditing Hub
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl font-medium leading-relaxed">
              Run real-time multi-model comparative diagnostics on website layouts, screenshot mockups, and natural language prompts to detect hidden liabilities and generate code implementations.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50/60 p-4 border border-slate-200 rounded-2xl shrink-0 shadow-inner">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-650">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">Consensus Engines</div>
              <div className="text-xs font-black text-slate-700">Gemini Pro • GPT-4o • Claude Sonnet</div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Grid Choice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`p-5 rounded-3xl text-left border cursor-pointer transition-all duration-300 transform relative overflow-hidden flex flex-col gap-3 group outline-none ${
                  isSelected 
                    ? `bg-white border-slate-350 ring-2 ring-indigo-500/15 shadow-md translate-y-[-2px] text-slate-900`
                    : `bg-slate-100/40 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300 shadow-sm`
                }`}
              >
                {/* Visual hover border overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${tab.bgColor} ${tab.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>

                <div>
                  <h3 className={`text-sm font-black tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-950'}`}>
                    {tab.label}
                  </h3>
                  <p className="text-[11px] text-slate-550 group-hover:text-slate-600 leading-snug mt-1 font-semibold">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actual Sandbox Wrapper Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-2 min-h-[600px] shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {activeSubTab === 'website' && (
                <div className="p-2">
                  <WebsiteAnalysis />
                </div>
              )}
              {activeSubTab === 'code' && (
                <div className="p-2">
                  <DesignToCode />
                </div>
              )}
              {activeSubTab === 'prompt' && (
                <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl">
                  <div className="mb-4">
                    <h2 className="text-lg font-black text-slate-950">Prompt Engineering Playground</h2>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Linguistically check models for prompt alignment, bias mitigation, instructions adherence, and output quality upgrades.
                    </p>
                  </div>
                  <PromptOptimizer 
                    isInline={true} 
                    initialPrompt="Write a Python script for robust file processing, with custom error handlers, retry logic, and comprehensive semantic layout bounds."
                    onApplyPrompt={(optimizedText) => {
                      navigator.clipboard.writeText(optimizedText);
                      toast.success("Optimized prompt text loaded and copied to clipboard!");
                    }}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
