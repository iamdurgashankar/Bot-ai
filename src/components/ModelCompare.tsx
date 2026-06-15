import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Settings2, 
  Play, 
  Zap, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Info,
  Upload,
  Download,
  Plus,
  Trash2,
  FileSpreadsheet,
  PlayCircle,
  GitCompare
} from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
import { motion, AnimatePresence } from 'motion/react';
import { Bot } from '../types';
import { dbService } from '../services/dbService';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

interface ModelInfo {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek';
  modelId: string;
  requiresKey: boolean;
  keyName: 'geminiKey' | 'openaiKey' | 'anthropicKey' | 'groqKey' | 'deepseekKey';
  defaultEnabled: boolean;
  desc?: string;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  { id: 'gemini-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', modelId: 'gemini-3.5-flash', requiresKey: false, keyName: 'geminiKey', defaultEnabled: true, desc: 'Highly versatile, fast, and balanced model.' },
  { id: 'gemini-pro', name: 'Gemini 3.1 Pro', provider: 'gemini', modelId: 'gemini-3.1-pro-preview', requiresKey: false, keyName: 'geminiKey', defaultEnabled: false, desc: 'Highest intelligence tier preview model.' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini', requiresKey: true, keyName: 'openaiKey', defaultEnabled: true, desc: 'Fast, lightweight and cost-efficient OpenAI model.' },
  { id: 'gpt-4o', name: 'GPT-4o Full', provider: 'openai', modelId: 'gpt-4o', requiresKey: true, keyName: 'openaiKey', defaultEnabled: false, desc: 'High-performance flagship model from OpenAI.' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022', requiresKey: true, keyName: 'anthropicKey', defaultEnabled: false, desc: 'Flagship tier with excellent logic and formatting.' },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', provider: 'anthropic', modelId: 'claude-3-5-haiku-20241022', requiresKey: true, keyName: 'anthropicKey', defaultEnabled: false, desc: 'Fast and responsive Anthropic model.' },
  { id: 'llama-groq', name: 'Llama 3.3 70B', provider: 'groq', modelId: 'llama-3.3-70b-versatile', requiresKey: true, keyName: 'groqKey', defaultEnabled: false, desc: 'Extremely fast open weights model via Groq.' },
  { id: 'deepseek-chat', name: 'DeepSeek V3 Chat', provider: 'deepseek', modelId: 'deepseek-chat', requiresKey: true, keyName: 'deepseekKey', defaultEnabled: false, desc: 'Powerhouse analytical chat model.' },
];

interface ModelCompareProps {
  bot: Bot;
}

export const ModelCompare: React.FC<ModelCompareProps> = ({ bot }) => {
  // Local storage and bot document keys state
  const [keys, setKeys] = useState({
    geminiKey: bot.compareKeys?.geminiKey || localStorage.getItem('compare_key_gemini') || '',
    openaiKey: bot.compareKeys?.openaiKey || localStorage.getItem('compare_key_openai') || '',
    anthropicKey: bot.compareKeys?.anthropicKey || localStorage.getItem('compare_key_anthropic') || '',
    groqKey: bot.compareKeys?.groqKey || localStorage.getItem('compare_key_groq') || '',
    deepseekKey: bot.compareKeys?.deepseekKey || localStorage.getItem('compare_key_deepseek') || '',
  });

  const [showKeys, setShowKeys] = useState({
    geminiKey: false,
    openaiKey: false,
    anthropicKey: false,
    groqKey: false,
    deepseekKey: false,
  });

  const [isKeysConfigOpen, setIsKeysConfigOpen] = useState(false);

  const [serverKeysStatus, setServerKeysStatus] = useState<Record<string, boolean>>({
    geminiKey: false,
    openaiKey: false,
    anthropicKey: false,
    groqKey: false,
    deepseekKey: false,
  });

  useEffect(() => {
    fetch('/api/keys-status')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setServerKeysStatus({
            geminiKey: !!data.geminiKey,
            openaiKey: !!data.openaiKey,
            anthropicKey: !!data.anthropicKey,
            groqKey: !!data.groqKey,
            deepseekKey: !!data.deepseekKey,
          });
        }
      })
      .catch(err => console.warn('Failed to fetch server credentials status:', err));
  }, []);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
    AVAILABLE_MODELS.filter(m => m.defaultEnabled).map(m => m.id)
  );
  
  const [prompt, setPrompt] = useState('');
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  // Batch states
  const [compareTab, setCompareTab] = useState<'single' | 'batch'>('single');
  const [batchPrompts, setBatchPrompts] = useState<string[]>([]);
  const [newManualPrompt, setNewManualPrompt] = useState('');
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAbortedRef = useRef(false);

  // Dynamic batch stats compiler
  const getBatchStats = () => {
    if (batchResults.length === 0) return null;
    
    const wins: Record<string, number> = {};
    const avgLatency: Record<string, number> = {};
    const avgWordCount: Record<string, number> = {};
    
    selectedModelIds.forEach(id => {
      const model = AVAILABLE_MODELS.find(m => m.id === id);
      if (model) {
        const key = `${model.provider}-${model.modelId}`;
        wins[key] = 0;
        avgLatency[key] = 0;
        avgWordCount[key] = 0;
      }
    });

    batchResults.forEach(item => {
      const winner = item.evaluation?.winner;
      if (winner && winner.provider && winner.modelId) {
        const key = `${winner.provider}-${winner.modelId}`;
        if (wins[key] !== undefined) {
          wins[key]++;
        }
      }

      if (item.results && Array.isArray(item.results)) {
        item.results.forEach((r: any) => {
          const key = `${r.provider}-${r.modelId}`;
          if (avgLatency[key] !== undefined) {
            avgLatency[key] += r.latency || 0;
            avgWordCount[key] += r.wordCount || 0;
          }
        });
      }
    });

    const count = batchResults.length;
    Object.keys(avgLatency).forEach(key => {
      avgLatency[key] = avgLatency[key] / count;
      avgWordCount[key] = Math.round(avgWordCount[key] / count);
    });

    return { wins, avgLatency, avgWordCount };
  };

  const batchStats = getBatchStats();

  // Parse CSV format into prompt rows
  const parseCSV = (text: string): string[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const parseCSVLine = (line: string): string[] => {
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim().replace(/^["']|["']$/g, ''));
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim().replace(/^["']|["']$/g, ''));
      return fields;
    };

    const firstLine = lines[0].trim();
    if (!firstLine) return [];

    const headers = parseCSVLine(firstLine);
    const possibleHeaders = ['prompt', 'query', 'question', 'text', 'input', 'prompts'];
    let promptColumnIndex = -1;
    
    for (let i = 0; i < headers.length; i++) {
      if (possibleHeaders.includes(headers[i].toLowerCase())) {
        promptColumnIndex = i;
        break;
      }
    }

    const collected: string[] = [];
    const startIdx = promptColumnIndex !== -1 ? 1 : 0;
    
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      if (promptColumnIndex !== -1) {
        const fields = parseCSVLine(line);
        if (fields[promptColumnIndex]) {
          collected.push(fields[promptColumnIndex]);
        }
      } else {
        const cleanLine = line.replace(/^["']|["']$/g, '').trim();
        if (cleanLine) {
          collected.push(cleanLine);
        }
      }
    }
    return collected;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      try {
        const parsed = parseCSV(content);
        if (parsed.length === 0) {
          toast.error("Could not find any prompts in the uploaded file.");
          return;
        }
        setBatchPrompts(prev => [...prev, ...parsed]);
        toast.success(`Successfully uploaded and parsed ${parsed.length} prompts!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        toast.error(`Error parsing file: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemoPrompts = () => {
    const demos = [
      `Introduce yourself in character and tell me your primary strength.`,
      `How would you assist a client requesting custom database installations?`,
      `Write a professional, concise email closing a successful support ticket.`,
      `A user is confused by subscription details. Guide them with empathy.`,
      `Explain the concept of responsive layouts to a non-technical manager.`
    ];
    setBatchPrompts(prev => [...prev, ...demos]);
    toast.success("Loaded 5 beautiful demo prompts to test batch comparisons!");
  };

  const handleAddManualPrompt = () => {
    if (!newManualPrompt.trim()) return;
    setBatchPrompts(prev => [...prev, newManualPrompt.trim()]);
    setNewManualPrompt('');
    toast.success("Added Custom Prompt to batch.");
  };

  const handleRemoveBatchPrompt = (idx: number) => {
    setBatchPrompts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClearBatch = () => {
    setBatchPrompts([]);
    setBatchResults([]);
    setSelectedBatchIndex(0);
    toast.success("Cleared batch comparisons configuration.");
  };

  const handleStopBatch = () => {
    isAbortedRef.current = true;
    setBatchRunning(false);
    toast.warning("Stopping batch collection. Currently completed results are preserved.");
  };

  const handleRunBatchCompare = async () => {
    if (batchPrompts.length === 0) {
      toast.error("Please upload or add prompts to run a batch comparison.");
      return;
    }

    const missingKeys = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id) && m.requiresKey && !keys[m.keyName] && !serverKeysStatus[m.keyName]);
    if (missingKeys.length > 0) {
      toast.error(`Please provide API keys for: ${missingKeys.map(m => m.name).join(', ')}`);
      setIsKeysConfigOpen(true);
      return;
    }

    setBatchRunning(true);
    setBatchResults([]);
    setBatchProgress(0);
    isAbortedRef.current = false;

    const activeModels = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id));
    const configs = activeModels.map(m => ({
      provider: m.provider,
      modelId: m.modelId,
      apiKey: keys[m.keyName] || undefined
    }));

    const resultsCollector: any[] = [];

    for (let i = 0; i < batchPrompts.length; i++) {
      if (isAbortedRef.current) {
        break;
      }

      setBatchProgress(i);
      const currentPrompt = batchPrompts[i];

      try {
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: currentPrompt,
            systemInstruction: `You are ${bot.name}.\nTone: ${bot.tone}.\nContext:\n${bot.context}\n\nStay strictly in character and adhere to configurations.`,
            configs
          })
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        resultsCollector.push({
          prompt: currentPrompt,
          results: data.results || [],
          evaluation: data.evaluation || null
        });

        setBatchResults([...resultsCollector]);
      } catch (err: any) {
        console.error(`Error comparing prompt: ${currentPrompt}`, err);
        resultsCollector.push({
          prompt: currentPrompt,
          results: configs.map(c => ({
            provider: c.provider,
            modelId: c.modelId,
            status: 'error',
            text: err.message || 'Invocation failed',
            latency: 0,
            wordCount: 0
          })),
          evaluation: {
            winner: {
              provider: 'None',
              modelId: 'None',
              reason: `Batch run failed: ${err.message || 'Server error'}`
            }
          }
        });
        setBatchResults([...resultsCollector]);
      }
    }

    setBatchRunning(false);
    setSelectedBatchIndex(0);
    toast.success("Batch Multi-Model Comparison finished!");
  };

  const handleExportBatchResults = () => {
    if (batchResults.length === 0) {
      toast.error("No batch results to export yet.");
      return;
    }

    try {
      const providers = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id));
      let csvContent = "";
      
      const headers = [
        "Prompt",
        "Autonomous Winner ID",
        "Winner Provider",
        "Winning Reason",
        "Comparison Summary"
      ];

      providers.forEach(p => {
        headers.push(`${p.name} Response`);
        headers.push(`${p.name} Latency (s)`);
        headers.push(`${p.name} Word Count`);
      });

      const escapeCSVField = (val: any) => {
        if (val === undefined || val === null) return '""';
        let str = String(val);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      };

      csvContent += headers.map(escapeCSVField).join(",") + "\r\n";

      batchResults.forEach(item => {
        const winner = item.evaluation?.winner;
        const summary = item.evaluation?.comparisonSummary || "";
        
        const row = [
          item.prompt,
          winner?.modelId || "N/A",
          winner?.provider || "N/A",
          winner?.reason || "N/A",
          summary
        ];

        providers.forEach(p => {
          const res = item.results.find((r: any) => r.provider === p.provider && r.modelId === p.modelId);
          if (res) {
            row.push(res.text || "");
            row.push((res.latency / 1000).toFixed(2));
            row.push(String(res.wordCount || 0));
          } else {
            row.push("N/A");
            row.push("0.00");
            row.push("0");
          }
        });

        csvContent += row.map(escapeCSVField).join(",") + "\r\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${bot.name.replace(/\s+/g, '_')}_model_comparison_batch.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Batch results comparison exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Export failed: ${err.message || err}`);
    }
  };

  // Suggestions depending on Bot context
  const suggestionPrompts = [
    `Hi! Introduce yourself in your native character.`,
    `How would you handle a disappointed customer asking for a refund?`,
    `Explain your primary value proposition in exactly three bullet points.`,
  ];

  const handleSaveKeys = async () => {
    localStorage.setItem('compare_key_gemini', keys.geminiKey);
    localStorage.setItem('compare_key_openai', keys.openaiKey);
    localStorage.setItem('compare_key_anthropic', keys.anthropicKey);
    localStorage.setItem('compare_key_groq', keys.groqKey);
    localStorage.setItem('compare_key_deepseek', keys.deepseekKey);
    
    try {
      await dbService.updateBot(bot.id, {
        compareKeys: keys
      });
      toast.success('API Keys saved securely in database and browser storage.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update keys in database, saved locally in browser.');
    }
    
    setIsKeysConfigOpen(false);
  };

  const handleToggleModel = (modelId: string) => {
    setSelectedModelIds(prev => {
      if (prev.includes(modelId)) {
        if (prev.length <= 1) {
          toast.error('Select at least one model to run.');
          return prev;
        }
        return prev.filter(id => id !== modelId);
      } else {
        if (prev.length >= 4) {
          toast.error('You can compare a maximum of 4 models in parallel.');
          return prev;
        }
        return [...prev, modelId];
      }
    });
  };

  const handleCompare = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a query/prompt to compare models.');
      return;
    }

    // Check if selected models have keys
    const missingKeys = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id) && m.requiresKey && !keys[m.keyName] && !serverKeysStatus[m.keyName]);
    if (missingKeys.length > 0) {
      toast.error(`Please provide API keys for: ${missingKeys.map(m => m.name).join(', ')}`);
      setIsKeysConfigOpen(true);
      return;
    }

    setComparing(true);
    setResults([]);
    setEvaluation(null);

    const activeModels = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id));
    const configs = activeModels.map(m => ({
      provider: m.provider,
      modelId: m.modelId,
      apiKey: keys[m.keyName] || undefined
    }));

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          systemInstruction: `You are ${bot.name}.\nTone: ${bot.tone}.\nContext:\n${bot.context}\n\nStay strictly in character and adhere to configurations.`,
          configs
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResults(data.results || []);
      setEvaluation(data.evaluation || null);
      toast.success('Comparison completed successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(`Error comparing models: ${error.message || 'Server error'}`);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Description Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Dual-Testing Playground
            </span>
            <h2 className="text-2xl font-bold text-white">Compare AI Model Responses</h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              Simulate and compare how different models represent <strong className="text-zinc-200">{bot.name}</strong>'s persona. Add custom third-party keys to execute and test models concurrently!
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsKeysConfigOpen(!isKeysConfigOpen)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-sm font-bold text-white transition-all cursor-pointer shadow-md shrink-0"
          >
            <Key className="w-4.5 h-4.5 text-zinc-400" />
            <span>Manage API Keys</span>
            {isKeysConfigOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>

        {/* API Keys Drawer */}
        <AnimatePresence>
          {isKeysConfigOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-zinc-800/80"
            >
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" /> API Keys Configuration
                </h3>
                <p className="text-xs text-zinc-500">
                  These keys are saved <strong>only locally</strong> inside your browser's persistent state. They are strictly forwarded to API requests from our sandbox proxy and never stored permanently on our backend database.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OpenAI key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">OpenAI API Key (GPT models)</label>
                    <div className="relative">
                      <input 
                        type={showKeys.openaiKey ? "text" : "password"}
                        value={keys.openaiKey}
                        onChange={e => setKeys({ ...keys, openaiKey: e.target.value })}
                        placeholder="sk-or-your-openai-key"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-650 focus:border-indigo-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, openaiKey: !showKeys.openaiKey })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showKeys.openaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Anthropic key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Anthropic API Key (Claude models)</label>
                    <div className="relative">
                      <input 
                        type={showKeys.anthropicKey ? "text" : "password"}
                        value={keys.anthropicKey}
                        onChange={e => setKeys({ ...keys, anthropicKey: e.target.value })}
                        placeholder="sk-ant-..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-650 focus:border-indigo-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, anthropicKey: !showKeys.anthropicKey })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showKeys.anthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Groq key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Groq API Key (Llama models)</label>
                    <div className="relative">
                      <input 
                        type={showKeys.groqKey ? "text" : "password"}
                        value={keys.groqKey}
                        onChange={e => setKeys({ ...keys, groqKey: e.target.value })}
                        placeholder="gsk-..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-650 focus:border-indigo-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, groqKey: !showKeys.groqKey })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showKeys.groqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* DeepSeek key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">DeepSeek API Key (DeepSeek Chat)</label>
                    <div className="relative">
                      <input 
                        type={showKeys.deepseekKey ? "text" : "password"}
                        value={keys.deepseekKey}
                        onChange={e => setKeys({ ...keys, deepseekKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-650 focus:border-indigo-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, deepseekKey: !showKeys.deepseekKey })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showKeys.deepseekKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional Gemini key */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-400">Gemini Pro API Key (Optional)</label>
                    <div className="relative">
                      <input 
                        type={showKeys.geminiKey ? "text" : "password"}
                        value={keys.geminiKey}
                        onChange={e => setKeys({ ...keys, geminiKey: e.target.value })}
                        placeholder="Leave empty to use built-in free sandbox preview key"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:border-indigo-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, geminiKey: !showKeys.geminiKey })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showKeys.geminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsKeysConfigOpen(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-805 rounded-xl text-zinc-400 hover:text-white font-bold text-xs border border-zinc-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveKeys}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Save Key Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Model Selection grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Settings2 className="w-4.5 h-4.5 text-indigo-400" />
          <span>I. Select Models to Compare (Up to 4)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {AVAILABLE_MODELS.map(model => {
            const isSelected = selectedModelIds.includes(model.id);
            const hasKey = !model.requiresKey || !!keys[model.keyName] || !!serverKeysStatus[model.keyName];
            return (
              <button
                type="button"
                key={model.id}
                onClick={() => handleToggleModel(model.id)}
                className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between gap-4 ${
                  isSelected 
                    ? "bg-indigo-600/5 border-indigo-600/50 shadow-inner" 
                    : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800/80"
                }`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    model.provider === 'gemini' ? 'bg-indigo-500/15 text-indigo-400' :
                    model.provider === 'openai' ? 'bg-emerald-500/15 text-emerald-400' :
                    model.provider === 'anthropic' ? 'bg-amber-500/15 text-amber-400' :
                    model.provider === 'groq' ? 'bg-purple-500/15 text-purple-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {model.provider}
                  </span>
                </div>

                <div className="space-y-1.5 mt-1.5 pr-8">
                  <h4 className="font-bold text-white text-sm">{model.name}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed truncate-2-lines line-clamp-2">{model.desc}</p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-zinc-600 code font-mono">{model.modelId.slice(0, 14)}...</span>
                  
                  {model.requiresKey && !hasKey ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-wide">
                      <Key className="w-3 h-3" /> Key Needed
                    </span>
                  ) : model.requiresKey && serverKeysStatus[model.keyName] && !keys[model.keyName] ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25 uppercase tracking-wide animate-pulse">
                      ⚡ Server Active
                    </span>
                  ) : isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompter Panel */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Play className="w-4.5 h-4.5 text-indigo-400" />
          <span>II. Submit Test Request</span>
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          
          {/* Tabs header */}
          <div className="flex border-b border-zinc-800 pb-3 gap-6">
            <button
              type="button"
              onClick={() => {
                if (batchRunning) {
                  toast.error("Cannot switch tab while batch evaluation is active!");
                  return;
                }
                setCompareTab('single');
              }}
              className={cn(
                "pb-2 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer",
                compareTab === 'single' ? "text-indigo-400 border-b border-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Single Query Sandbox
            </button>
            <button
              type="button"
              onClick={() => {
                if (comparing) {
                  toast.error("Cannot switch tab while single query is computing!");
                  return;
                }
                setCompareTab('batch');
              }}
              className={cn(
                "pb-2 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-1.5",
                compareTab === 'batch' ? "text-indigo-400 border-b border-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <GitCompare className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.3)] animate-pulse" />
              <span>Batch CSV Comparison</span>
            </button>
          </div>

          {compareTab === 'single' ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 font-mono tracking-wide uppercase">Your Sandbox Query</label>
                  <span className="text-xs text-zinc-500 font-semibold">{prompt.length} / 1000 chars</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="What should we ask the models? E.g., How do you react to customers wanting custom system setups?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-200 placeholder-zinc-650 min-h-[100px] h-[120px] focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600/30"
                />
              </div>

              {/* Preset Prompts helpers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Suggested test starters:</span>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map((sg, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setPrompt(sg)}
                      className="p-2 py-1.5 text-xs bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-all text-left truncate max-w-full cursor-pointer font-medium"
                    >
                      {sg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800/60">
                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className={`px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:text-white/40 text-white rounded-2xl font-bold flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95 ${
                    comparing && 'pointer-events-none'
                  }`}
                >
                  {comparing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Computing responses concurrently...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Compare AI Responses ({selectedModelIds.length} models)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Batch setup option */}
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CSV Drag zone */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 font-mono tracking-wide uppercase block">I. Upload Prompts List</label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="p-3 bg-zinc-900 group-hover:bg-indigo-600/10 rounded-xl text-zinc-400 group-hover:text-indigo-400 transition-all">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-200">Click to upload prompts CSV</p>
                        <p className="text-xs text-zinc-500">Supports columns header named "Prompt", or a simple list line by line.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLoadDemoPrompts}
                        className="p-1 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4 text-indigo-400" />
                        <span>Load Demo Prompts List</span>
                      </button>
                      {batchPrompts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearBatch}
                          className="p-1 px-3 bg-zinc-950 hover:bg-rose-950/20 border border-zinc-850 hover:border-rose-950 text-zinc-400 hover:text-rose-450 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                          <span>Clear List ({batchPrompts.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Manual Query insertion */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 font-mono tracking-wide uppercase block">II. Add Custom Entry</label>
                    <div className="bg-zinc-950/30 border border-zinc-850 rounded-2xl p-5 space-y-4">
                      <textarea
                        value={newManualPrompt}
                        onChange={e => setNewManualPrompt(e.target.value)}
                        placeholder="Type a separate prompt to include in the sequence..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 h-[72px] focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600/30"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddManualPrompt}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-zinc-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Queue Prompt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch list displays */}
                {batchPrompts.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-800/60 pt-5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-400 font-mono uppercase tracking-wide">Prompts Queue ({batchPrompts.length})</span>
                      <span className="text-zinc-550">Runs in sequence.</span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-850/75 rounded-2xl max-h-[140px] overflow-y-auto divide-y divide-zinc-900 p-2">
                      {batchPrompts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 text-xs transition-all hover:bg-zinc-905 rounded-lg">
                          <span className="text-zinc-500 font-mono font-bold w-6 shrink-0">#{idx + 1}</span>
                          <span className="text-zinc-300 font-medium flex-1 truncate pr-4">{p}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchPrompt(idx)}
                            className="p-1 text-zinc-600 hover:text-rose-450 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive progression states */}
                <div className="border-t border-zinc-800/60 pt-5">
                  {batchRunning ? (
                    <div className="bg-zinc-950 border border-indigo-950/60 p-6 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-indigo-400 font-semibold flex items-center gap-2 animate-pulse">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                          Executing Multi-Model Comparison concurrently...
                        </span>
                        <span className="text-zinc-450 font-bold">{batchProgress + 1} / {batchPrompts.length} Prompts Run</span>
                      </div>
                      
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300 shadow-sm" 
                          style={{ width: `${((batchProgress) / batchPrompts.length) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-start gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-zinc-550 block font-mono text-[9px] uppercase tracking-wider">Evaluating Prompt:</span>
                          <p className="text-zinc-300 font-semibold italic truncate max-w-[520px]">"{batchPrompts[batchProgress]}"</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStopBatch}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/25 cursor-pointer transition-all"
                        >
                          Stop Batch
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-zinc-950/40 p-3 px-5 rounded-2xl border border-zinc-850">
                      <div className="text-xs text-zinc-500 font-medium leading-relaxed">
                        {batchPrompts.length === 0 
                          ? "Load demo test starters or drag & drop standard CSV files above." 
                          : `Ready to initiate seq evaluations of ${batchPrompts.length} prompts over ${selectedModelIds.length} models.`}
                      </div>
                      <button
                        onClick={handleRunBatchCompare}
                        disabled={batchPrompts.length === 0}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-650 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:pointer-events-none"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Compare Prompts Sequence ({batchPrompts.length})</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </div>
      </div>

      {/* Single Loading State */}
      {comparing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedModelIds.map(id => {
            const m = AVAILABLE_MODELS.find(model => model.id === id);
            return (
              <div key={id} className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6 space-y-4 animate-pulse min-h-[220px]">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-zinc-850 rounded w-1/2" />
                  <div className="h-3.5 bg-zinc-850 rounded w-12" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-zinc-850/60 rounded" />
                  <div className="h-3 bg-zinc-850/60 rounded w-5/6" />
                  <div className="h-3 bg-zinc-850/60 rounded w-2/3" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Analytics Board */}
      {!batchRunning && compareTab === 'batch' && batchResults.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Batch Model Evaluation Insights</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Summary metrics compiled across the complete parsed batch runs sequence ({batchResults.length} evaluations).
              </p>
            </div>
            
            <button
              onClick={handleExportBatchResults}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export Batch Results to CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Winningest model */}
            <div className="bg-zinc-950/60 border border-zinc-850 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block font-mono">Autonomous Batch Winner</span>
                <span className="text-xs text-zinc-400 block mt-1 leading-relaxed">Most winning model inside this prompt batch sequence evaluation.</span>
              </div>
              
              <div className="pt-2">
                {batchStats && Object.keys(batchStats.wins).length > 0 ? (
                  (() => {
                    const sorted = Object.entries(batchStats.wins).sort((a,b) => b[1] - a[1]);
                    const winnerId = sorted[0][0];
                    const winnerWins = sorted[0][1];
                    const modelName = AVAILABLE_MODELS.find(m => `${m.provider}-${m.modelId}` === winnerId)?.name || winnerId;
                    
                    return sorted[0][1] > 0 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-yellow-350">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{modelName}</h4>
                          <span className="text-xs text-indigo-400 font-bold font-mono uppercase">Won {winnerWins} / {batchResults.length} prompts ({Math.round((winnerWins/batchResults.length)*100)}%)</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs italic">Evaluator ratings tied across runs.</span>
                    );
                  })()
                ) : (
                  <span className="text-zinc-500 text-xs italic">Awaiting evaluations.</span>
                )}
              </div>
            </div>

            {/* Speeds */}
            <div className="bg-zinc-950/60 border border-zinc-850 p-5 rounded-2xl space-y-3 col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block font-mono">Comparative Average Latency (s)</span>
              
              <div className="space-y-2.5 text-xs">
                {selectedModelIds.map(id => {
                  const m = AVAILABLE_MODELS.find(model => model.id === id);
                  if (!m) return null;
                  const key = `${m.provider}-${m.modelId}`;
                  const avgTime = batchStats?.avgLatency[key] || 0;
                  const avgWords = batchStats?.avgWordCount[key] || 0;
                  
                  return (
                    <div key={id} className="flex items-center gap-4">
                      <span className="text-zinc-400 font-bold w-32 truncate">{m.name}</span>
                      <div className="flex-1 h-2.5 bg-zinc-900 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${Math.min(100, (avgTime / 3000) * 100)}%` }}
                        />
                      </div>
                      <span className="text-zinc-200 font-mono font-bold w-16 text-right">{(avgTime / 1000).toFixed(2)}s</span>
                      <span className="text-zinc-500 font-mono w-16 text-right text-[10px]">{avgWords} wds</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive dropdown picker to inspect prompt results */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold text-zinc-400 font-mono uppercase block">Inspect Prompt Results Details Below</label>
            
            <div className="flex gap-2 flex-wrap max-h-[140px] overflow-y-auto pt-1">
              {batchResults.map((item, idx) => {
                const isSelected = selectedBatchIndex === idx;
                const wins = item.evaluation?.winner;
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBatchIndex(idx)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs text-left max-w-xs transition-all flex items-center gap-2 cursor-pointer",
                      isSelected 
                        ? "bg-indigo-600 border-indigo-500 text-white font-bold" 
                        : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    <span className="font-mono text-[10px] bg-black/20 font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="truncate flex-1 font-medium">{item.prompt}</span>
                    {wins && wins.provider && wins.provider !== "None" && (
                      <span className={cn(
                        "text-[9px] px-1 py-0.5 rounded font-bold uppercase",
                        isSelected ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-400"
                      )}>
                        {wins.provider}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Side-by-Side Results Content & Evals */}
      {!comparing && !batchRunning && (
        (() => {
          const activeResults = compareTab === 'single' ? results : (batchResults[selectedBatchIndex]?.results || []);
          const activeEvaluation = compareTab === 'single' ? evaluation : (batchResults[selectedBatchIndex]?.evaluation || null);
          const activePromptName = compareTab === 'single' ? prompt : (batchResults[selectedBatchIndex]?.prompt || '');
          
          if (activeResults.length === 0) return null;

          return (
            <div className="space-y-8">
              {/* Display prompt selected context header in batch */}
              {compareTab === 'batch' && (
                <div className="p-5 bg-gradient-to-r from-indigo-950/25 to-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block font-mono">Inspected Prompt Details</span>
                    <p className="text-zinc-200 text-sm font-semibold italic">"{activePromptName}"</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    Prompt {selectedBatchIndex + 1} of {batchResults.length}
                  </span>
                </div>
              )}

              {/* AI Evaluator Verdict Dashboard Option */}
              {activeEvaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 space-y-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                  <div className="flex items-start md:items-center gap-4 border-b border-indigo-500/10 pb-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                      <Trophy className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        System Evaluator Verdict: <span className="text-indigo-400 font-extrabold uppercase font-mono text-xs tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded-full inline-block">{activeEvaluation.winner?.provider} ({activeEvaluation.winner?.modelId})</span>
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1">Autonomous evaluation comparing responses based on persona alignment, depth, and formatting.</p>
                    </div>
                  </div>

                  {/* Specific Reason */}
                  {activeEvaluation.winner?.reason && (
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 space-y-3">
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Winning Reason
                      </p>
                      <p className="text-zinc-300 text-sm leading-relaxed">{activeEvaluation.winner.reason}</p>
                    </div>
                  )}

                  {/* Comparison table / metrics */}
                  {activeEvaluation.ratings && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeEvaluation.ratings.map((rating: any, index: number) => {
                        return (
                          <div key={index} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
                            <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{rating.provider}</span>
                                <h4 className="font-extrabold text-white text-xs truncate max-w-[130px]">{rating.modelId}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-550 block font-bold font-mono">SCORE</span>
                                <span className="text-indigo-450 font-black text-lg">{rating.overallScore}/10</span>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="space-y-1">
                                <div className="flex justify-between text-zinc-450">
                                  <span>Tone Alignment</span>
                                  <span className="font-mono font-bold">{rating.toneRating}/10</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${rating.toneRating * 10}%` }} />
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-zinc-450">
                                  <span>Quality & Accuracy</span>
                                  <span className="font-mono font-bold">{rating.qualityRating}/10</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${rating.qualityRating * 10}%` }} />
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-zinc-455">
                                  <span>Clarity & Structure</span>
                                  <span className="font-mono font-bold">{rating.formatRating}/10</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${rating.formatRating * 10}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Pros/Cons */}
                            <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs">
                              {rating.pros && rating.pros.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-450 block">Pros:</span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
                                    {rating.pros.map((pro: string, pi: number) => (
                                      <li key={pi}>{pro}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeEvaluation.comparisonSummary && (
                    <div className="text-xs text-zinc-450 leading-relaxed border-t border-indigo-500/10 pt-4 flex gap-1.5">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                      <p>{activeEvaluation.comparisonSummary}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Respective Side by Side Output Grid layout */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  <span>III. Model Response Results Side-by-Side</span>
                </h3>
                
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(3, activeResults.length)} gap-6`}>
                  {activeResults.map((res: any, index: number) => {
                    const modelDef = AVAILABLE_MODELS.find(m => m.provider === res.provider && m.modelId === res.modelId);
                    const isWinner = activeEvaluation?.winner?.provider === res.provider && activeEvaluation?.winner?.modelId === res.modelId;
                    
                    let latencyColor = "text-emerald-400 bg-emerald-500/10 border-emerald-550/20";
                    if (res.latency > 2500) {
                      latencyColor = "text-rose-450 bg-rose-500/10 border-rose-500/20";
                    } else if (res.latency > 1500) {
                      latencyColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    }

                    return (
                      <div 
                        key={index} 
                        className={`bg-zinc-900 border rounded-[1.8rem] flex flex-col min-h-[400px] overflow-hidden relative shadow-lg ${
                          isWinner ? "border-indigo-500 shadow-indigo-600/5 ring-1 ring-indigo-500/35" : "border-zinc-800"
                        }`}
                      >
                        {isWinner && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white font-extrabold text-[9px] px-3.5 py-1 uppercase rounded-bl-xl tracking-wider flex items-center gap-1 z-10 shadow-sm shadow-indigo-600/40">
                            <Trophy className="w-3 h-3 text-white" />
                            <span>WINNER</span>
                          </div>
                        )}

                        {/* Column Header */}
                        <div className="p-6 border-b border-zinc-850 bg-zinc-900/40 space-y-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                res.provider === 'gemini' ? 'bg-indigo-500/20 text-indigo-300' :
                                res.provider === 'openai' ? 'bg-emerald-500/20 text-emerald-300' :
                                res.provider === 'anthropic' ? 'bg-amber-500/20 text-amber-300' :
                                res.provider === 'groq' ? 'bg-purple-500/20 text-purple-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {res.provider}
                              </span>
                              {!res.apiKey && res.provider === 'gemini' && (
                                <span className="text-[9px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850 tracking-wide font-mono">PREVIEW</span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-white text-base mt-2">{modelDef?.name || res.modelId}</h4>
                          </div>

                          {/* Header metrics row */}
                          <div className="flex items-center flex-wrap gap-2 text-[10px] font-semibold text-zinc-500 font-mono">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${latencyColor}`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Latency: {(res.latency / 1000).toFixed(2)}s</span>
                            </div>
                            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                              <FileText className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{res.wordCount || 0} words</span>
                            </div>
                          </div>
                        </div>

                        {/* Content Segment */}
                        <div className="p-6 flex-1 text-sm leading-relaxed overflow-y-auto max-h-[480px] text-zinc-300 bg-zinc-950/20">
                          {res.status === 'success' ? (
                            <div className="markdown-body select-text">
                              <Markdown>{res.text}</Markdown>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 text-rose-450 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <span className="font-bold text-xs font-mono">Model invocation failed</span>
                                <p className="text-xs leading-relaxed text-zinc-450">{res.text}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
