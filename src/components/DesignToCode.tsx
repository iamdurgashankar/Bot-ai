import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Settings, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  Eye, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  UploadCloud,
  ChevronRight,
  Code2,
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
  { id: 'gemini-pro', name: 'Gemini 3.1 Pro', provider: 'gemini', modelId: 'gemini-3.1-pro-preview' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  { id: 'gpt-4o', name: 'GPT-4o Full', provider: 'openai', modelId: 'gpt-4o' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', provider: 'anthropic', modelId: 'claude-3-5-haiku-20241022' }
];

const FRAMEWORKS = [
  "React",
  "React + TypeScript",
  "HTML & Tailwind CSS",
  "Tailwind CSS (Raw)",
  "Next.js",
  "Vue.js"
];

interface GeneratedResult {
  provider: string;
  modelId: string;
  code: string;
  livePreviewHtml: string;
  scores: {
    codeQuality: number;
    responsiveness: number;
    accessibility: number;
    reusability: number;
  };
  explanation: string;
}

interface JudgeResult {
  winner: {
    provider: string;
    modelId: string;
    reason: string;
  };
  overallComparison: string;
}

interface SavedDesignTask {
  id: string;
  imageUrl: string;
  targetFramework: string;
  timestamp: string;
  results: GeneratedResult[];
  judge: JudgeResult | null;
}

export const DesignToCode: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [targetFramework, setFramework] = useState('React + TypeScript');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-flash', 'gpt-4o-mini']);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Results
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [selectedModelTab, setSelectedModelTab] = useState<string>('');
  
  // History
  const [history, setHistory] = useState<SavedDesignTask[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progressSteps = [
    "Uploading visual design and establishing secure neural frame...",
    "Scanning grid layout, wireframe ratios, margins, and typography details...",
    "Extracting brand color palette and semantic components map...",
    "Dispatching multimodal payloads to selected AI models for compiler analysis...",
    "Generating syntax structures and injecting high-performance styling...",
    "Assembling live preview sandbox environments and running Code Quality checks..."
  ];

  useEffect(() => {
    const saved = localStorage.getItem('design_to_code_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load design history:", e);
      }
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Loaded mockup: ${file.name}`);
    } else {
      toast.error("Please load a valid PNG or JPG screenshot mockup file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleToggleModel = (id: string) => {
    setSelectedModels(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          toast.error("Please choose at least one model.");
          return prev;
        }
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };

  const handleLoadTask = (task: SavedDesignTask) => {
    setImagePreview(task.imageUrl);
    setFramework(task.targetFramework);
    setGeneratedResults(task.results);
    setJudgeResult(task.judge);
    if (task.results.length > 0) {
      setSelectedModelTab(task.results[0].provider + '-' + task.results[0].modelId);
    }
    toast.success(`Loaded historic code task`);
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      toast.error("Please upload or drag a wireframe mockup image first!");
      return;
    }

    setGenerating(true);
    setProgressStep(0);
    setGeneratedResults([]);
    setJudgeResult(null);

    const timer = setInterval(() => {
      setProgressStep(prev => {
        if (prev < progressSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

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

      const res = await fetch('/api/design-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          targetFramework,
          configs
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      clearInterval(timer);
      setProgressStep(progressSteps.length - 1);

      setGeneratedResults(data.results);
      setJudgeResult(data.winner);
      
      if (data.results.length > 0) {
        setSelectedModelTab(data.results[0].provider + '-' + data.results[0].modelId);
      }

      // Save history log
      const newTask: SavedDesignTask = {
        id: Math.random().toString(36).substring(2, 9),
        imageUrl: imagePreview,
        targetFramework,
        timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
        results: data.results,
        judge: data.winner
      };

      const updatedHistory = [newTask, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('design_to_code_history', JSON.stringify(updatedHistory));

      toast.success("Design converted into code successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Design To Code compilation failed: ${e.message || 'Unknown error'}`);
    } finally {
      clearInterval(timer);
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Code copied!");
  };

  const handleExport = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
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
    toast.success(`Downloaded ${filename}!`);
  };

  const activeResult = generatedResults.find(r => `${r.provider}-${r.modelId}` === selectedModelTab);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-205">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            Design-to-Code Decision Hub
          </h1>
          <p className="text-slate-550 text-xs sm:text-sm mt-1 leading-snug">
            Upload visual layouts, mockups or wireframes to compile highly elegant responsive code across models with side-by-side comparative sandboxes.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 border border-slate-200 rounded-xl max-w-sm">
            <FileCode className="w-4 h-4 text-slate-500 ml-2" />
            <select 
              className="bg-transparent border-none text-xs text-slate-705 outline-none pr-6 font-semibold max-w-[200px]"
              onChange={(e) => {
                const found = history.find(h => h.id === e.target.value);
                if (found) handleLoadTask(found);
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-white">Load Historical Tasks...</option>
              {history.map(item => (
                <option key={item.id} value={item.id} className="bg-white text-slate-805">
                  {item.targetFramework} Mock ({item.timestamp.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Layout upload controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-205">
              <UploadCloud className="w-3.5 h-3.5" />
              Design Payload
            </h3>

            {/* Drag and drop panel */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-50" 
                  : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/70"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div className="relative w-full h-full min-h-[100px]">
                  <img 
                    src={imagePreview} 
                    alt="Mockup preview" 
                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-[10px] text-white font-bold uppercase">
                    Replace Mockup
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700">Upload UI Design</span>
                  <span className="text-[9px] text-slate-450 mt-1 block">Drag and drop PNG, JPG or Figma mockup</span>
                </>
              )}
            </div>

            {/* Framework Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Framework Target</label>
              <select
                value={targetFramework}
                onChange={(e) => setFramework(e.target.value)}
                disabled={generating}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-505 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                {FRAMEWORKS.map(f => (
                  <option key={f} value={f} className="bg-white">{f}</option>
                ))}
              </select>
            </div>

            {/* Model Target selectors */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AI Engines</label>
              <div className="space-y-1.5">
                {AVAILABLE_MODELS.map(model => {
                  const isChecked = selectedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      disabled={generating}
                      onClick={() => handleToggleModel(model.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isChecked 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                          : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350"
                      }`}
                    >
                      <span className="text-[10.5px] font-extrabold truncate">{model.name}</span>
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${
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
              onClick={handleGenerate}
              disabled={generating || !imagePreview}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:-translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Compiling Code..." : "Generate Code"}
            </button>
          </div>
        </div>

        {/* Output layout presentation */}
        <div className="lg:col-span-3 min-w-0">
          <AnimatePresence>
            {generating && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200 rounded-3xl p-12 text-center h-[520px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm"
              >
                {/* Visual grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

                <div className="w-20 h-20 bg-indigo-50 border border-indigo-150 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                  <Code2 className="w-10 h-10 text-indigo-550 rotate-12" />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mt-8 tracking-tight relative z-10">Compiling Visuals to Production Code</h3>
                <p className="text-slate-500 text-xs max-w-sm mt-1 mb-8 leading-snug">
                  Transforming layout mockups into high-fidelity React/Tailwind elements across selected engines simultaneously...
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md bg-slate-100 border border-slate-200 h-2 rounded-full overflow-hidden mb-4 relative z-10">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    initial={{ width: '5%' }}
                    animate={{ width: `${((progressStep + 1) / progressSteps.length) * 100}%` }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
                <div className="text-[10px] sm:text-xs text-indigo-650 font-bold max-w-md leading-relaxed animate-pulse">
                  {progressSteps[progressStep]}
                </div>
              </motion.div>
            )}

            {!generating && generatedResults.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center h-[520px] flex flex-col items-center justify-center shadow-sm"
              >
                <div className="w-16 h-16 bg-white border border-slate-150 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-inner">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">No Active Designs Imported</h3>
                <p className="text-slate-500 text-xs max-w-xs mt-1.5 leading-normal">
                  Upload a webpage screenshot or mobile mockup draft to generate production-ready React or HTML components, and compared by AI Judge metrics.
                </p>
              </motion.div>
            )}

            {!generating && generatedResults.length > 0 && (
              <motion.div
                key="rendered-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. Unified AI Judge evaluation block */}
                {judgeResult && (
                  <div className="bg-gradient-to-r from-amber-500/5 via-amber-600/5 to-slate-50 border border-amber-500/30 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4 select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              AI Judge Choice
                            </span>
                            <span className="text-[9px] font-medium text-slate-400">OPTIMAL IMPLEMENTATION MATRIX</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 mt-1 uppercase tracking-wide">
                            🏆 Best Implementation: {judgeResult.winner.provider} {' '}
                            <span className="text-slate-400 text-xs font-mono font-medium">({judgeResult.winner.modelId})</span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-700 text-xs leading-relaxed bg-white p-4 border border-slate-250 rounded-2xl">
                      <strong>AI Judge Ruling reasoning:</strong> {judgeResult.winner.reason}
                    </div>
                  </div>
                )}

                {/* 2. Interactive comparative Workspace */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-md flex flex-col h-[580px]">
                  {/* Tabs header */}
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-200 select-none flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      {generatedResults.map(res => {
                        const mInfo = AVAILABLE_MODELS.find(m => m.provider === res.provider && m.modelId === res.modelId);
                        const isActive = selectedModelTab === `${res.provider}-${res.modelId}`;
                        return (
                          <button
                            key={`${res.provider}-${res.modelId}`}
                            onClick={() => setSelectedModelTab(`${res.provider}-${res.modelId}`)}
                            className={`px-3 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer ${
                              isActive
                                ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold"
                                : "text-slate-500 hover:text-slate-850"
                            }`}
                          >
                            {mInfo?.name || res.provider}
                          </button>
                        );
                      })}
                    </div>

                    {activeResult && (
                      <div className="flex items-center gap-4">
                        {/* Selector for Preview Mode / Code Mode */}
                        <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-lg">
                          <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              activeTab === 'preview' ? "bg-white border border-slate-200 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('code')}
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              activeTab === 'code' ? "bg-white border border-slate-200 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </button>
                        </div>

                        {/* Copy / Export buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(activeResult.code, `${activeResult.provider}-c`)}
                            className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            title="Copy code"
                          >
                            {copied === `${activeResult.provider}-c` ? <Check className="w-3 h-3 text-emerald-650" /> : <Copy className="w-3 h-3" />}
                            <span>{copied === `${activeResult.provider}-c` ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            onClick={() => handleExport(activeResult.code, `layout_mock_${activeResult.provider}.tsx`)}
                            className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            title="Download code"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar stats panel + Main Content split */}
                  <div className="flex-1 flex min-h-0">
                    {activeResult && (
                      <>
                        {/* Action metrics indicators side column */}
                        <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between hidden sm:flex select-none">
                          <div className="space-y-4">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#00e676] block">Model Quality scores</span>
                            
                            {[
                              { label: 'Code Quality', score: activeResult.scores?.codeQuality || 85, color: 'text-indigo-650', bar: 'bg-indigo-600' },
                              { label: 'Responsiveness', score: activeResult.scores?.responsiveness || 90, color: 'text-emerald-655', bar: 'bg-emerald-600' },
                              { label: 'Accessibility', score: activeResult.scores?.accessibility || 80, color: 'text-sky-655', bar: 'bg-sky-600' },
                              { label: 'Reusability', score: activeResult.scores?.reusability || 75, color: 'text-amber-655', bar: 'bg-amber-600' },
                            ].map(item => (
                              <div key={item.label} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-slate-500 truncate pr-1">{item.label}</span>
                                  <span className={item.color}>{item.score}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.bar}`} style={{ width: `${item.score}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-4 border-t border-slate-200">
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-1">Visual insights</span>
                            <p className="text-[10px] text-slate-600 leading-normal line-clamp-4">
                              {activeResult.explanation}
                            </p>
                          </div>
                        </div>

                        {/* Content Workspace element */}
                        <div className="flex-1 min-w-0 bg-slate-50/50 relative">
                          {activeTab === 'preview' ? (
                            <div className="w-full h-full relative p-2">
                              {activeResult.livePreviewHtml ? (
                                <iframe
                                  srcDoc={activeResult.livePreviewHtml}
                                  title="Live Sandbox output mockup HTML rendering"
                                  className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm"
                                  sandbox="allow-scripts"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                                  Live sandbox render not compiled for this view
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full p-4 overflow-auto scrollbar-thin scrollbar-thumb-slate-250">
                              <pre className="text-[11px] font-mono leading-relaxed text-slate-800 whitespace-pre scroll-text select-text bg-white p-4 border border-slate-200 rounded-xl shadow-inner h-full overflow-auto">
                                <code>{activeResult.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </>
                    )}
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
