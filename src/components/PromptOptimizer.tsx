import React, { useState } from 'react';
import { 
  Sparkles, 
  Settings, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Send,
  Sliders,
  Award,
  BookOpen,
  Mail,
  Smartphone,
  Cpu,
  Trash2,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  modelId: string;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  { id: 'gemini-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', modelId: 'gemini-3.5-flash' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' }
];

const MODES = [
  { id: 'General', label: 'General', emoji: '🌟', desc: 'Balanced structural precision' },
  { id: 'Coding', label: 'Coding', emoji: '💻', desc: 'Adds type definitions & bounds' },
  { id: 'Marketing', label: 'Marketing', emoji: '📈', desc: 'Adds persuasive copy guidelines' },
  { id: 'SEO', label: 'SEO', emoji: '🔍', desc: 'Injects LSI keywords & meta targets' },
  { id: 'Business', label: 'Business', emoji: '💼', desc: 'Focuses on executive summaries' },
  { id: 'Writing', label: 'Content Writing', emoji: '✍️', desc: 'Enforces voice & semantic flow' }
];

interface OptimizationResult {
  provider: string;
  modelId: string;
  optimizedPrompt: string;
  expectedScore: number;
  ambiguities: string[];
  opportunities: string[];
}

interface JudgeResult {
  winner: {
    provider: string;
    modelId: string;
    reason: string;
  };
  comparisonRating: string;
}

interface PromptOptimizerProps {
  initialPrompt: string;
  onApplyPrompt: (optimizedText: string) => void;
  onClose?: () => void;
  isInline?: boolean;
}

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({ 
  initialPrompt, 
  onApplyPrompt,
  onClose,
  isInline = false
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [mode, setMode] = useState('General');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-flash', 'gpt-4o-mini']);
  const [optimizing, setOptimizing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Results state
  const [optimizedResults, setOptimizedResults] = useState<OptimizationResult[]>([]);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);

  const handleToggleModel = (id: string) => {
    setSelectedModels(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          toast.error("Please retain at least one model.");
          return prev;
        }
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a user prompt to optimize.");
      return;
    }

    setOptimizing(true);
    setOptimizedResults([]);
    setJudgeResult(null);

    try {
      const geminiKey = localStorage.getItem('compare_key_gemini') || '';
      const openaiKey = localStorage.getItem('compare_key_openai') || '';
      const anthropicKey = localStorage.getItem('compare_key_anthropic') || '';

      const configs = AVAILABLE_MODELS
        .filter(m => selectedModels.includes(m.id))
        .map(m => {
          let apiKey = '';
          if (m.provider === 'gemini') apiKey = geminiKey;
          if (m.provider === 'openai') apiKey = openaiKey;
          if (m.provider === 'anthropic') apiKey = anthropicKey;
          return { provider: m.provider, modelId: m.modelId, apiKey };
        });

      const res = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          configs
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setOptimizedResults(data.results);
      setJudgeResult(data.winner);
      toast.success("Prompt optimized successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Prompt optimization failed: ${e.message || 'Unknown network error'}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
    toast.success("Optimized prompt text copied!");
  };

  const wrapperClass = isInline 
    ? "w-full bg-white border border-slate-200 rounded-2xl flex flex-col text-slate-800 overflow-hidden relative select-none shadow-sm"
    : "absolute inset-y-0 right-0 w-[550px] max-w-full bg-white border-l border-slate-250 shadow-[0_0_40px_rgba(0,0,0,0.15)] z-50 flex flex-col text-slate-850 overflow-hidden animate-slide-in select-none";

  return (
    <div className={wrapperClass}>
      {/* Visual cyber mesh details */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Slideout Header */}
      <div className={`p-4 border-b border-slate-200 flex items-center justify-between ${isInline ? 'bg-slate-50' : 'bg-slate-50'} relative z-10 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-505">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-650">
              Prompt Optimizer
            </h3>
            <p className="text-[9px] text-slate-400 leading-none mt-0.5">Detect ambiguities & refine user messages</p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>


      {/* Main split viewport scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 relative z-10 min-h-0">
        {/* User Raw Input message block */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">Original Raw Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={optimizing}
            rows={3}
            placeholder="e.g. Write a quick script for web scraping in Python"
            className="w-full bg-slate-5 rows text-xs text-slate-800 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3 py-2 outline-none placeholder-slate-400 resize-y font-semibold shadow-inner"
          />
        </div>

        {/* Optimiser Modes segment */}
        <div className="space-y-1.5 select-none">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-505" />
            Enhancement Mode Style
          </span>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                disabled={optimizing}
                className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                  mode === item.id
                    ? "bg-[#005c4b]/5 border-emerald-300 text-emerald-805 font-black"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                }`}
              >
                <span className="text-lg pb-0.5">{item.emoji}</span>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-bold block">{item.label}</span>
                  <span className="text-[8px] text-slate-450 truncate block leading-none">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Optimizing Engines selectors */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 tracking-widest block uppercase">Selected Refiners</span>
          <div className="flex gap-2">
            {AVAILABLE_MODELS.map((m) => {
              const isChecked = selectedModels.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleToggleModel(m.id)}
                  disabled={optimizing}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-black cursor-pointer transition-all ${
                    isChecked 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-white border-slate-205 text-slate-500 hover:text-slate-800 hover:border-slate-350 shadow-sm"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger */}
        <button
          onClick={handleOptimize}
          disabled={optimizing || !prompt.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:-translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {optimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {optimizing ? "Engineering Prompts..." : "Optimize & Compare"}
        </button>

        {/* Progress and results outputs */}
        <AnimatePresence>
          {optimizing && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-zinc-400 text-[10.5px] font-bold tracking-wide animate-pulse">Running linguistic ambiguity scan on prompt text...</p>
            </div>
          )}

          {!optimizing && optimizedResults.length > 0 && (
            <div className="space-y-6">
              {/* Optional AI Judge Recommendation Banner */}
              {judgeResult && (
                <div className="bg-amber-600/5 border border-amber-500/20 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider">AI Judge Best Optimization Selection</span>
                  </div>
                  <p className="text-[10.5px] text-slate-700 leading-relaxed font-bold">
                    🥇 Best Optimized: {AVAILABLE_MODELS.find(m => m.provider === judgeResult.winner.provider && m.modelId === judgeResult.winner.modelId)?.name || judgeResult.winner.provider} — {judgeResult.winner.reason}
                  </p>
                </div>
              )}

              {/* Individual Optimized versions */}
              {optimizedResults.map((result) => {
                const mInfo = AVAILABLE_MODELS.find(m => m.provider === result.provider && m.modelId === result.modelId);
                return (
                  <div key={`${result.provider}-${result.modelId}`} className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm">
                    {/* Model Header */}
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-xs font-black block text-slate-800">{mInfo?.name || result.provider}</span>
                        <span className="text-[8.5px] font-mono text-slate-400 uppercase">{result.provider}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 rounded font-black text-[9px] text-emerald-800 select-none">
                          +{result.expectedScore || 40}% Quality Lift
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Ambiguities bullet checklist */}
                      {result.ambiguities && result.ambiguities.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[8.5px] uppercase font-black text-amber-800 font-mono tracking-widest block flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Missing Context / Risks Detected
                          </span>
                          <div className="space-y-1 pl-1">
                            {result.ambiguities.map((item, id) => (
                              <div key={id} className="text-[10.5px] text-slate-655 flex items-start gap-1 leading-snug">
                                <span className="text-red-550 mt-0.5">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Optimized Output */}
                      <div className="space-y-1.5">
                        <span className="text-[8.5px] uppercase font-black text-indigo-750 font-mono tracking-widest block">Optimized prompt text</span>
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl relative">
                          <p className="text-slate-700 font-semibold text-xs leading-relaxed break-words select-text">
                            {result.optimizedPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Active Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApplyPrompt(result.optimizedPrompt)}
                          className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-black text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 outline-none"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply & Use Prompt</span>
                        </button>
                        <button
                          onClick={() => handleCopy(result.optimizedPrompt, `${result.provider}-co`)}
                          className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 transition-all active:scale-95 cursor-pointer outline-none shrink-0"
                          title="Copy prompt"
                        >
                          {copied === `${result.provider}-co` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
