import React, { useState } from 'react';
import { 
  Bot as BotIcon, 
  Sparkles, 
  Settings2, 
  Check, 
  Target, 
  Heart, 
  HelpCircle, 
  MessageSquare, 
  Code, 
  Globe, 
  BookOpen, 
  Briefcase, 
  Bookmark, 
  Info,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { Bot } from '../types';
import { dbService } from '../services/dbService';
import { toast } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  desc: string;
  badge?: string;
  tier: 'Standard' | 'Advanced' | 'Powerhouse';
}

const ALWAYS_AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-flash', name: 'Gemini 3.5 Flash', provider: 'Google', desc: 'Default recommended model. Outstanding speed, multi-lingual capabilities, and balanced reasoning. Best for general-purpose text.', tier: 'Standard', badge: 'Recommended' },
  { id: 'gemini-pro', name: 'Gemini 3.1 Pro', provider: 'Google', desc: 'Deep analytical capabilities, ideal for handling complex multi-step reasoning, coding help, and heavy document processing.', tier: 'Advanced' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', desc: 'Fast client-friendly lightweight model with excellent conversational intelligence.', tier: 'Standard' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', desc: 'OpenAI flagship model. Powerful reasoning, smart structured outputs, and excellent safety metrics.', tier: 'Advanced' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Superb writing style, flawless structured instructions adherence, and superior algorithmic logic.', tier: 'Advanced' },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', desc: 'Exceptional speed and precise tone controls. Outstanding for direct short-form Q&A workflows.', tier: 'Standard' },
  { id: 'llama-groq', name: 'Llama 3.3 70B', provider: 'Meta (Groq)', desc: 'Ultra low-latency responses based on high-performance open weights models.', tier: 'Powerhouse' },
  { id: 'deepseek-chat', name: 'DeepSeek V3 Chat', provider: 'DeepSeek', desc: 'High intelligence tier designed for scientific analysis and intense code optimization.', tier: 'Powerhouse' },
];

interface PurposeOption {
  id: string;
  label: string;
  icon: any;
  description: string;
  systemPromptModifier: string;
}

const PURPOSE_TEMPLATES: PurposeOption[] = [
  { 
    id: 'customer-service', 
    label: 'Customer Support', 
    icon: HelpCircle,
    description: 'Polite, resolution-oriented assistant. Excels at troubleshooting and referencing FAQs from the knowledge base.',
    systemPromptModifier: 'You are configured for Customer Support. Prioritize finding direct answers inside the Knowledge Base. Keep the user calm, acknowledge frustrations, and clearly lay out step-by-step solutions.'
  },
  { 
    id: 'sales-lead', 
    label: 'Sales & Lead Gen', 
    icon: Target,
    description: 'Engaging, friendly, and persuasive assistant. Focuses on introducing products and collecting customer/lead parameters.',
    systemPromptModifier: 'You are configured for Sales & Lead Generation. Be proactive, highlight key advantages clearly and enthusiastically, and look for opportunities to ask if they would like to be connected to our team.'
  },
  { 
    id: 'edu-tutor', 
    label: 'Education & Tutor', 
    icon: BookOpen,
    description: 'Patient tutor that breaks down complex scientific, historical, or logical topics step-by-step for a learner.',
    systemPromptModifier: 'You are configured as an Educational Tutor. Do not just output the answers directly. Ask probing questions, explain core principles first, and encourage active critical thinking.'
  },
  { 
    id: 'developer-coding', 
    label: 'Developer & Tech Support', 
    icon: Code,
    description: 'Strict, concise programming helper. Generates bug-free, clean code with brief, actionable explanations.',
    systemPromptModifier: 'You are configured for technical code engineering. Use precise specifications, write beautiful and safe Code blocks with clear syntax highlighting, and analyze optimization edge cases carefully.'
  },
  { 
    id: 'creative-copy', 
    label: 'Creative Copywriter', 
    icon: Sparkles,
    description: 'Inspirational assistant with great vocabulary. Excellent for slogans, marketing updates, and engaging emails.',
    systemPromptModifier: 'You are configured for Creative Content Generation. Use colorful analogies, dynamic pacing, catchy headlines, and persuasive structure.'
  },
  { 
    id: 'personal-assistant', 
    label: 'Personal AI Companion', 
    icon: Heart,
    description: 'Friendly general-purpose life coordinator. Helps with scheduling, summarizing documents, and listing daily items.',
    systemPromptModifier: 'You are configured as a Personal AI Companion. Stay highly responsive, casual, organized, and helpful across all general categories.'
  },
  { 
    id: 'custom', 
    label: 'Custom / Other Purpose', 
    icon: Settings2,
    description: 'Define your own special business goal or narrow workflow instructions below.',
    systemPromptModifier: ''
  }
];

interface Props {
  bot: Bot;
  onSaved?: () => void;
}

export const ModelAndPurposeConfig: React.FC<Props> = ({ bot, onSaved }) => {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    bot.configuredModels || ['gemini-flash']
  );
  const [purpose, setPurpose] = useState<string>(
    bot.botPurpose || 'custom'
  );
  const [purposeCustom, setPurposeCustom] = useState<string>(
    bot.botPurposeCustom || ''
  );
  const [saving, setSaving] = useState(false);

  const handleToggleModel = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        // Prevent disabling if it's the last one
        if (prev.length <= 1) {
          toast.error("Please keep at least one target AI model selected!");
          return prev;
        }
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dbService.updateBot(bot.id, {
        configuredModels: selectedModels,
        botPurpose: purpose,
        botPurposeCustom: purposeCustom
      });
      toast.success("Model & Purpose configurations synchronized successfully!");
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save Model & Purpose configurations.");
    } finally {
      setSaving(false);
    }
  };

  const selectedPurposeObj = PURPOSE_TEMPLATES.find(p => p.id === purpose);

  return (
    <div className="space-y-8 pb-16">
      {/* Overview Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Models &amp; Purpose Configuration</h3>
            <p className="text-zinc-500 text-sm mt-1">
              Select which AI models the bot can utilize to fulfill goals, and define the primary use-case purpose to inject custom steering prompts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Model Choice and Use-Case Selection */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Bot Purpose selection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
              <Target className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-white text-lg">Define Bot Use Case &amp; Purpose</h4>
            </div>

            <p className="text-sm text-zinc-400">
              Aligning your bot with a purpose template automatically pre-configures custom behavior prefixes for more robust responses.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PURPOSE_TEMPLATES.map((item) => {
                const Icon = item.icon;
                const isSelected = purpose === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPurpose(item.id);
                      if (item.id !== 'custom') {
                        setPurposeCustom('');
                      }
                    }}
                    className={cn(
                      "p-5 rounded-2xl border text-left flex gap-4 transition-all hover:border-indigo-500/45 cursor-pointer",
                      isSelected 
                        ? "bg-indigo-600/5 border-indigo-600 shadow-lg" 
                        : "bg-zinc-950/40 border-zinc-800 text-zinc-400"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl shrink-0",
                      isSelected ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isSelected ? "text-indigo-400" : "text-zinc-500")}>
                        {isSelected ? "Selected" : "Template"}
                      </p>
                      <h5 className="font-bold text-sm text-white">{item.label}</h5>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom/Optional Goals Input */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {purpose === 'custom' ? 'Describe Specific Custom Purpose Instructions' : 'Additional Specialty Directives / Brand Rules (Optional)'}
              </label>
              <textarea
                value={purposeCustom}
                onChange={e => setPurposeCustom(e.target.value)}
                placeholder={purpose === 'custom' 
                  ? "Describe precisely what the user expects this bot to do (e.g. 'Act as a professional French translator that highlights key vocabulary grammar at the end of the response')..."
                  : "Add specific instructions, e.g., 'Never mention pricing', 'Speak in short punchy bullet points', 'Sign off as support crew'..."
                }
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Model Checklist */}
          <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-white text-lg">Select Configured AI Models</h4>
            </div>

            <p className="text-sm text-zinc-400">
              Check all models authorized to serve requests for this bot. If multiple models are selected, testing playground and external components can parallel-benchmark or run fallbacks safely.
            </p>

            <div className="space-y-4">
              {ALWAYS_AVAILABLE_MODELS.map((item) => {
                const isChecked = selectedModels.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleModel(item.id)}
                    className={cn(
                      "p-5 rounded-2xl border flex items-start gap-4 transition-all cursor-pointer select-none",
                      isChecked 
                        ? "bg-zinc-950/80 border-indigo-500/40" 
                        : "bg-zinc-950/20 border-zinc-900/65 opacity-60 hover:opacity-90"
                    )}
                  >
                    <div className="pt-1 shrink-0">
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-700 bg-transparent"
                      )}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] bg-zinc-900/90 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800">
                          {item.provider}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          item.tier === 'Standard' && 'bg-zinc-800 text-zinc-400',
                          item.tier === 'Advanced' && 'bg-blue-500/10 text-blue-400 border border-blue-500/10',
                          item.tier === 'Powerhouse' && 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                        )}>
                          {item.tier}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic System Prompt Compiler Preview */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-6">
            <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-800/80 pb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h5 className="font-bold text-sm uppercase tracking-wider text-white">System Prompt Preview</h5>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Below is an assembled preview of how your system instruction inputs are packaged by the database middleware service for the Gemini model prior to runtime querying.
            </p>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-4 font-mono text-[11px] text-zinc-400 leading-relaxed select-none max-h-[400px] overflow-y-auto">
              <div>
                <span className="text-indigo-400 font-bold block mb-1">// Base Bot Character &amp; Tone</span>
                <span className="block italic text-zinc-500">"You are {bot.name}. Tone: {bot.tone}."</span>
              </div>

              {selectedPurposeObj && selectedPurposeObj.id !== 'custom' && (
                <div>
                  <span className="text-indigo-400 font-bold block mb-1">// Bot Purpose Alignment</span>
                  <span className="block text-zinc-300">"{selectedPurposeObj.systemPromptModifier}"</span>
                </div>
              )}

              {purposeCustom && (
                <div>
                  <span className="text-indigo-400 font-bold block mb-1">// Purpose Directives / Sub-Goals</span>
                  <span className="block text-zinc-300">"{purposeCustom}"</span>
                </div>
              )}

              <div>
                <span className="text-indigo-400 font-bold block mb-1">// Base Instructions Context</span>
                <span className="block text-zinc-300">"{bot.context}"</span>
              </div>

              <div className="border-t border-zinc-800/50 pt-3 text-[10px] text-zinc-600 flex items-center justify-between">
                <span>Total compiled instructions blocks</span>
                <span className="bg-zinc-900 px-2 py-0.5 rounded font-bold text-zinc-400">Active</span>
              </div>
            </div>

            {/* Configured Models Overview */}
            <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800/80 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Authorized Models ({selectedModels.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedModels.map(id => {
                  const m = ALWAYS_AVAILABLE_MODELS.find(x => x.id === id);
                  return (
                    <span key={id} className="text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold px-2 py-1 rounded">
                      {m?.name || id}
                    </span>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Synchronizing...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
