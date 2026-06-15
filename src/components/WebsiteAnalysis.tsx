import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Settings, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  History, 
  ShieldAlert, 
  Smartphone, 
  TrendingUp, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Award,
  ChevronRight,
  RefreshCw,
  Search,
  Eye,
  Info
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
  { id: 'gemini-pro', name: 'Gemini 3.1 Pro', provider: 'gemini', modelId: 'gemini-3.1-pro-preview' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  { id: 'gpt-4o', name: 'GPT-4o Full', provider: 'openai', modelId: 'gpt-4o' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', provider: 'anthropic', modelId: 'claude-3-5-haiku-20241022' },
  { id: 'llama-groq', name: 'Llama 3.3 70B', provider: 'groq', modelId: 'llama-3.3-70b-versatile' },
  { id: 'deepseek-chat', name: 'DeepSeek V3 Chat', provider: 'deepseek', modelId: 'deepseek-chat' }
];

interface AnalysisResult {
  provider: string;
  modelId: string;
  status: string;
  scores: {
    uiUx: number;
    seo: number;
    accessibility: number;
    performance: number;
    responsiveness: number;
    conversion: number;
  };
  suggestions: { category: string; text: string }[];
  detailedReport: string;
}

interface JudgeResult {
  winner: {
    provider: string;
    modelId: string;
    reason: string;
  };
  ratings: {
    provider: string;
    modelId: string;
    overallScore: number;
    pros: string[];
    cons: string[];
  }[];
  comparisonSummary: string;
}

interface SavedAudit {
  id: string;
  url: string;
  timestamp: string;
  results: AnalysisResult[];
  judge: JudgeResult | null;
  consensusReport: string;
}

export const WebsiteAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-flash', 'gpt-4o-mini']);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Results
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [consensusReport, setConsensusReport] = useState<string>('');
  const [selectedModelTab, setSelectedModelTab] = useState<string>('');
  
  // History
  const [history, setHistory] = useState<SavedAudit[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('website_audit_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load audit history:", e);
      }
    }
  }, []);

  const progressSteps = [
    "Initiating handshake and analyzing domain DNS headers...",
    "Crawling website structure, fetching HTML tags and SEO metadata...",
    "Evaluating client UI/UX layouts, responsiveness viewport styles, and font sizes...",
    "Routing crawled page signals to selected AI models for auditing...",
    "Evaluating outputs through AI Judge metrics and ranking recommendations...",
    "Compiling consensus report from top model recommendations..."
  ];

  const handleToggleModel = (id: string) => {
    setSelectedModels(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          toast.error("Please select at least one model for analysis.");
          return prev;
        }
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };

  const parseOrLoadHistory = (item: SavedAudit) => {
    setUrl(item.url);
    setAnalysisResults(item.results);
    setJudgeResult(item.judge);
    setConsensusReport(item.consensusReport);
    if (item.results.length > 0) {
      setSelectedModelTab(item.results[0].provider + '-' + item.results[0].modelId);
    }
    toast.success(`Loaded audit log for ${item.url}`);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL first.");
      return;
    }

    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      setUrl(cleanUrl);
    }

    setAnalyzing(true);
    setProgressStep(0);
    setAnalysisResults([]);
    setJudgeResult(null);
    setConsensusReport('');

    // Start progress step simulation
    const timer = setInterval(() => {
      setProgressStep(prev => {
        if (prev < progressSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      // Gather keys from local storage to pass if configured
      const geminiKey = localStorage.getItem('compare_key_gemini') || '';
      const openaiKey = localStorage.getItem('compare_key_openai') || '';
      const anthropicKey = localStorage.getItem('compare_key_anthropic') || '';
      const groqKey = localStorage.getItem('compare_key_groq') || '';
      const deepseekKey = localStorage.getItem('compare_key_deepseek') || '';

      const configs = AVAILABLE_MODELS
        .filter(m => selectedModels.includes(m.id))
        .map(m => {
          let apiKey = '';
          if (m.provider === 'gemini') apiKey = geminiKey;
          if (m.provider === 'openai') apiKey = openaiKey;
          if (m.provider === 'anthropic') apiKey = anthropicKey;
          if (m.provider === 'groq') apiKey = groqKey;
          if (m.provider === 'deepseek') apiKey = deepseekKey;

          return {
            provider: m.provider,
            modelId: m.modelId,
            apiKey
          };
        });

      const res = await fetch('/api/website-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, configs })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      clearInterval(timer);
      setProgressStep(progressSteps.length - 1);

      setAnalysisResults(data.results);
      setJudgeResult(data.winner);
      setConsensusReport(data.consensus);
      
      if (data.results.length > 0) {
        setSelectedModelTab(data.results[0].provider + '-' + data.results[0].modelId);
      }

      // Save to localStorage history
      const newAudit: SavedAudit = {
        id: Math.random().toString(36).substring(2, 9),
        url: cleanUrl,
        timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
        results: data.results,
        judge: data.winner,
        consensusReport: data.consensus
      };

      const updatedHistory = [newAudit, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('website_audit_history', JSON.stringify(updatedHistory));

      toast.success("Website report generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Analysis failed: ${err.message || 'Unknown network error'}`);
    } finally {
      clearInterval(timer);
      setAnalyzing(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleExportText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const reader = new FileReader();
    reader.onload = function(e) {
      const link = document.createElement('a');
      link.href = e.target?.result as string;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);
    toast.success(`Exported ${filename}`);
  };

  const handleDeleteHistoryIdx = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    localStorage.setItem('website_audit_history', JSON.stringify(updated));
    toast.success("Audit history logic cleared!");
  };

  // Get average scores across models for visual main meters
  const getAverageScore = (metric: 'uiUx' | 'seo' | 'accessibility' | 'performance' | 'responsiveness' | 'conversion') => {
    if (analysisResults.length === 0) return 0;
    const sum = analysisResults.reduce((acc, curr) => acc + (curr.scores?.[metric] || 0), 0);
    return Math.round(sum / analysisResults.length);
  };

  const avgScores = {
    uiUx: getAverageScore('uiUx'),
    seo: getAverageScore('seo'),
    accessibility: getAverageScore('accessibility'),
    performance: getAverageScore('performance'),
    responsiveness: getAverageScore('responsiveness'),
    conversion: getAverageScore('conversion'),
  };

  const overallAvg = Math.round(
    Object.values(avgScores).reduce((acc, curr) => acc + curr, 0) / 6
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-8 h-8 text-indigo-600 animate-pulse" />
            Website Auditor & Decision Engine
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
            Crawl and audit responsive live websites across parallel AI models, matched with a Unified AI Judge recommendation consensus.
          </p>
        </div>
        
        {/* Toggle options or quick action summary */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 border border-slate-200 rounded-xl max-w-sm">
            <History className="w-4 h-4 text-slate-500 ml-2" />
            <select 
              className="bg-transparent border-none text-xs text-slate-700 outline-none pr-6 font-semibold max-w-[200px]"
              onChange={(e) => {
                const found = history.find(h => h.id === e.target.value);
                if (found) parseOrLoadHistory(found);
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-white text-slate-800">Quick Load History...</option>
              {history.map(item => (
                <option key={item.id} value={item.id} className="bg-white text-slate-800">
                  {item.url.replace(/^https?:\/\//i, '')} ({item.timestamp.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Audit Input controls and Model select */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5 pb-2.5 border-b border-slate-200">
              <Settings className="w-3.5 h-3.5" />
              Crawler Parameters
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. google.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={analyzing}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold"
                />
              </div>
            </div>

            {/* Model Selector Card */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-505 uppercase tracking-widest block">Compare Models</span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {AVAILABLE_MODELS.map(model => {
                  const isChecked = selectedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      disabled={analyzing}
                      onClick={() => handleToggleModel(model.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                        isChecked 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                          : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold block truncate">{model.name}</span>
                        <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-mono">{model.provider}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? "bg-indigo-600 border-indigo-500" : "border-slate-300 bg-transparent"
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:-translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {analyzing ? "Auditing Website..." : "Analyze Website"}
            </button>
          </div>

          {/* History Log Panel */}
          {history.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Audit Log (Cache)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => parseOrLoadHistory(item)}
                    className="w-full border border-slate-200 hover:border-slate-300 bg-slate-55/30 hover:bg-slate-50 p-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 flex justify-between items-center group"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-extrabold text-slate-800 truncate block">{item.url.replace(/^https?:\/\//i, '')}</span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{item.timestamp}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistoryIdx(idx, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-500 rounded-md transition-all shrink-0 cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right columns: Loading progress OR Results Dashboard */}
        <div className="lg:col-span-3 min-w-0">
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200 rounded-3xl p-12 text-center h-[520px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm"
              >
                {/* Visual grid decor */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

                <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-full flex items-center justify-center relative z-10 animate-bounce">
                  <Globe className="w-10 h-10 text-indigo-655 animate-spin" />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mt-8 tracking-tight relative z-10">Website Decision Analysis Underway</h3>
                <p className="text-slate-550 text-xs max-w-sm mt-1 mb-8 leading-snug">
                  Currently running direct audits on <span className="font-mono text-slate-800">{url}</span> across {selectedModels.length} top AI targets...
                </p>

                {/* Progress bar and text */}
                <div className="w-full max-w-md bg-slate-100 border border-slate-200 h-2 rounded-full overflow-hidden mb-4 relative z-10">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full"
                    initial={{ width: '5%' }}
                    animate={{ width: `${((progressStep + 1) / progressSteps.length) * 100}%` }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
                <div className="text-[10px] sm:text-xs text-indigo-600 font-bold max-w-md leading-relaxed animate-pulse">
                  {progressSteps[progressStep]}
                </div>
              </motion.div>
            )}

            {!analyzing && analysisResults.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center h-[520px] flex flex-col items-center justify-center shadow-sm"
              >
                <div className="w-16 h-16 bg-white border border-slate-150 rounded-2xl flex items-center justify-center text-indigo-550 mb-6 shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">No Active Audit Report</h3>
                <p className="text-slate-500 text-xs max-w-xs mt-1.5 leading-normal">
                  Enter a website URL and select models to crawl, score layout responsiveness, SEO, accessibility performance, and generate consensus recommendations.
                </p>
              </motion.div>
            )}

            {!analyzing && analysisResults.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. Overall Audit Summary Header */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#00b0ff]">Overall Audit Rating</span>
                      <div className="text-5xl font-black text-slate-900 mt-1 select-none flex items-baseline">
                        {overallAvg}
                        <span className="text-slate-400 text-sm font-semibold">/100</span>
                      </div>
                      <div className="mt-2.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-[10px] text-slate-600 font-extrabold select-none">
                        {overallAvg >= 80 ? "🏆 HIGH QUALITY" : overallAvg >= 60 ? "🧠 BALANCED STABILITY" : "🔴 NEEDS REWORK"}
                      </div>
                    </div>

                    {/* Breakdown SVG Dial Circles */}
                    <div className="md:col-span-3 grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-6">
                      {[
                        { key: 'uiUx', label: 'UI/UX', val: avgScores.uiUx, color: 'text-emerald-500', stroke: 'stroke-emerald-500' },
                        { key: 'seo', label: 'SEO', val: avgScores.seo, color: 'text-indigo-500', stroke: 'stroke-indigo-500' },
                        { key: 'accessibility', label: 'Access.', val: avgScores.accessibility, color: 'text-sky-500', stroke: 'stroke-sky-500' },
                        { key: 'performance', label: 'Perfor.', val: avgScores.performance, color: 'text-amber-500', stroke: 'stroke-amber-500' },
                        { key: 'responsiveness', label: 'Respons.', val: avgScores.responsiveness, color: 'text-pink-500', stroke: 'stroke-pink-500' },
                        { key: 'conversion', label: 'Conversion', val: avgScores.conversion, color: 'text-rose-600', stroke: 'stroke-rose-600' },
                      ].map(metric => (
                        <div key={metric.key} className="flex flex-col items-center justify-center text-center">
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="2.5" />
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="2.5" 
                                className={metric.color}
                                strokeDasharray="100"
                                strokeDashoffset={100 - (metric.val || 0)}
                              />
                            </svg>
                            <span className="absolute text-[10px] font-black text-slate-800">{metric.val}%</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-1.5 whitespace-nowrap">{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Unified AI Judge Evaluation Segment */}
                {judgeResult && (
                  <div className="bg-gradient-to-r from-amber-500/5 via-amber-600/5 to-slate-50 border border-amber-500/20 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Award className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 select-none tracking-wider">
                              Decision Winner
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 select-none">AI JUDGING SYSTEM</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-850 mt-0.5 uppercase tracking-wide">
                            🏆 Recommended: {judgeResult.winner.provider} {' '}
                            <span className="text-slate-400 text-xs font-mono font-medium">({judgeResult.winner.modelId})</span>
                          </h4>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 font-mono text-right shrink-0">
                        Winner Decision Rating: <span className="text-amber-655 font-black text-xs">
                          {Math.round(judgeResult.ratings?.find(r => r.provider === judgeResult.winner.provider)?.overallScore || 90)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs leading-normal bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      <strong>AI Judge Recommendation:</strong> {judgeResult.winner.reason}
                    </p>

                    {/* Pro / Cons columns of various analyzed models */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
                      {judgeResult.ratings?.map((r, idx) => {
                        const mInfo = AVAILABLE_MODELS.find(m => m.provider === r.provider && m.modelId === r.modelId);
                        return (
                          <div key={idx} className="space-y-2 border-r border-slate-200 pr-2 last:border-none">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800">{mInfo?.name || r.provider}</span>
                              <span className="text-[11px] font-mono text-slate-550">Score: {r.overallScore}%</span>
                            </div>
                            
                            <div className="space-y-1.5">
                              {r.pros && r.pros.length > 0 && (
                                <div className="space-y-1">
                                  {r.pros.map((pro, pIdx) => (
                                    <div key={pIdx} className="flex items-start gap-1.5 text-[10.5px] text-emerald-700 leading-snug">
                                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                                      <span>{pro}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {r.cons && r.cons.length > 0 && (
                                <div className="space-y-1 pt-1.5 border-t border-slate-200">
                                  {r.cons.map((con, cIdx) => (
                                    <div key={cIdx} className="flex items-start gap-1.5 text-[10.5px] text-red-700 leading-snug">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                      <span>{con}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Combined Consensus Report Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/25">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-widest leading-none">
                          Unified Consensus Audit Plan
                        </h4>
                        <span className="text-[9px] text-slate-500">Amalgamated actionable report from all sources</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(consensusReport, 'consensus_rep')}
                        className="p-1 px-2 text-[10px] font-bold select-none cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-lg transition-all flex items-center gap-1 active:scale-95 outline-none"
                      >
                        {copied === 'consensus_rep' ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'consensus_rep' ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        onClick={() => handleExportText(consensusReport, `consensus-report-${url.replace(/^https?:\/\//i, '').replace(/[^a-z0-9]/gi, '_')}.md`)}
                        className="p-1 px-2 text-[10px] font-bold select-none cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-lg transition-all flex items-center gap-1 active:scale-95 outline-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-800 text-xs leading-relaxed max-h-96 overflow-y-auto pr-1 select-text bg-slate-50/50 p-4 border border-slate-200 rounded-2xl max-w-full">
                    <div className="whitespace-pre-wrap font-sans">{consensusReport}</div>
                  </div>
                </div>

                {/* 4. Individual Model Audit Segment tabs */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                  <div className="flex items-center bg-slate-50 px-4 py-2 flex-wrap border-b border-slate-200 gap-1 select-none">
                    {analysisResults.map(res => {
                      const isActive = selectedModelTab === `${res.provider}-${res.modelId}`;
                      const mInfo = AVAILABLE_MODELS.find(m => m.provider === res.provider && m.modelId === res.modelId);
                      return (
                        <button
                          key={`${res.provider}-${res.modelId}`}
                          onClick={() => setSelectedModelTab(`${res.provider}-${res.modelId}`)}
                          className={`px-3 py-2 text-xs font-black transition-all rounded-lg cursor-pointer active:scale-95 outline-none flex items-center gap-1.5 ${
                            isActive
                              ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold"
                              : "text-slate-500 hover:text-slate-850 border border-transparent"
                          }`}
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{mInfo?.name || res.provider}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-6">
                    {analysisResults.map((res) => {
                      if (selectedModelTab !== `${res.provider}-${res.modelId}`) return null;
                      return (
                        <div key={`${res.provider}-${res.modelId}`} className="space-y-6">
                          {/* Inner scores checklist */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              { label: 'UI/UX Visual Layout', score: res.scores?.uiUx || 80, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-805' },
                              { label: 'SEO tags & Structure', score: res.scores?.seo || 80, color: 'border-indigo-200 bg-indigo-50/50 text-indigo-805' },
                              { label: 'Accessibility Standards', score: res.scores?.accessibility || 80, color: 'border-sky-200 bg-sky-50/50 text-sky-805' },
                              { label: 'Performance Speed Metrics', score: res.scores?.performance || 80, color: 'border-amber-200 bg-amber-50/50 text-amber-805' },
                              { label: 'Responsiveness Adaptability', score: res.scores?.responsiveness || 80, color: 'border-pink-200 bg-pink-50/50 text-pink-805' },
                              { label: 'Conversion & CTAs', score: res.scores?.conversion || 80, color: 'border-rose-200 bg-rose-50/50 text-rose-805' },
                            ].map((grid, gIdx) => (
                              <div key={gIdx} className={`p-3.5 border rounded-2xl flex items-center justify-between ${grid.color}`}>
                                <span className="text-[11px] font-extrabold truncate pr-1">{grid.label}</span>
                                <span className="text-sm font-black tracking-tight">{grid.score}%</span>
                              </div>
                            ))}
                          </div>

                          {/* Actionable Recommendations Table and full detailed report */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-1">
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                              Actionable Recommendations Table
                            </h5>
                            
                            <div className="space-y-2">
                              {res.suggestions?.map((s, sIdx) => (
                                <div key={sIdx} className="p-3 bg-slate-50/50 border border-slate-150 rounded-2xl flex items-start gap-2.5">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold font-mono text-[8.5px] tracking-wider text-indigo-700 shrink-0 uppercase select-none mt-0.5">
                                    {s.category}
                                  </span>
                                  <p className="text-slate-800 text-xs leading-normal">{s.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Detailed Report Summary</span>
                            <div className="text-slate-700 text-xs leading-relaxed max-h-72 overflow-y-auto pr-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                              <div className="whitespace-pre-line select-text font-sans">{res.detailedReport}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Internal trash icon helper
const Trash2Icon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
