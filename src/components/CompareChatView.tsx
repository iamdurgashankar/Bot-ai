import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot as BotIcon, 
  Settings,
  Send, 
  Trash2, 
  Clock, 
  Trophy, 
  Sparkles, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Code, 
  Copy, 
  Check, 
  Compass, 
  HelpCircle, 
  FileText, 
  Paperclip, 
  Smile, 
  Mic, 
  MoreVertical, 
  CheckCheck, 
  Phone, 
  Video, 
  Search, 
  User,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  PenTool,
  Image as ImageIcon,
  Menu,
  Plus,
  Edit3,
  X,
  MessageSquare,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import { PromptOptimizer } from './PromptOptimizer';

// Theme helper mapping bot theme color presets
const getThemeColorConfig = (bgClass?: string) => {
  const defaults = {
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-500',
    border: 'border-indigo-500',
    ring: 'focus:ring-indigo-500/30',
    text: 'text-indigo-300',
    textHover: 'hover:text-indigo-200',
    borderMute: 'border-indigo-505/20',
    bgLight: 'bg-indigo-950/20',
    bgMute: 'bg-indigo-950/10',
    glow: 'bg-indigo-500',
    badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30 font-bold',
    // Light theme variants for the configuration drawer
    lightLabel: 'text-indigo-700',
    lightActiveBadge: 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm',
    lightCheckboxActive: 'bg-indigo-600 border-indigo-600 text-white',
    lightAccentText: 'text-indigo-600',
    lightActiveInput: 'border-indigo-500/20 focus-within:border-indigo-600/60',
    lightApiCardBg: 'bg-indigo-50/30 border-indigo-500/15 hover:border-indigo-500/30',
    lightConsoleTitle: 'text-indigo-950',
    lightConsoleBorder: 'border-indigo-500/15',
    lightActiveBtn: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-800 shadow-sm',
    lightConsoleGlow: 'text-indigo-500',
    lightConsoleBg: 'border-indigo-505/15 shadow-indigo-505/5'
  };
  
  if (!bgClass) return defaults;
  
  const cleanClass = bgClass.trim();
  if (cleanClass.includes('indigo')) {
    return defaults;
  }
  if (cleanClass.includes('emerald') || cleanClass.includes('green')) {
    return {
      bg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-500',
      border: 'border-emerald-500',
      ring: 'focus:ring-emerald-500/30',
      text: 'text-emerald-300',
      textHover: 'hover:text-emerald-200',
      borderMute: 'border-emerald-500/20',
      bgLight: 'bg-emerald-950/20',
      bgMute: 'bg-emerald-950/10',
      glow: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30 font-bold',
      lightLabel: 'text-emerald-700',
      lightActiveBadge: 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm',
      lightCheckboxActive: 'bg-emerald-600 border-emerald-600 text-white',
      lightAccentText: 'text-emerald-600',
      lightActiveInput: 'border-emerald-500/20 focus-within:border-emerald-600/60',
      lightApiCardBg: 'bg-emerald-50/30 border-emerald-500/15 hover:border-emerald-500/30',
      lightConsoleTitle: 'text-emerald-950',
      lightConsoleBorder: 'border-emerald-500/15',
      lightActiveBtn: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 shadow-sm',
      lightConsoleGlow: 'text-emerald-550',
      lightConsoleBg: 'border-emerald-505/15 shadow-emerald-505/5'
    };
  }
  if (cleanClass.includes('rose') || cleanClass.includes('red')) {
    return {
      bg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-500',
      border: 'border-rose-500',
      ring: 'focus:ring-rose-500/30',
      text: 'text-rose-300',
      textHover: 'hover:text-rose-200',
      borderMute: 'border-rose-500/20',
      bgLight: 'bg-rose-950/20',
      bgMute: 'bg-rose-950/10',
      glow: 'bg-rose-500',
      badge: 'bg-rose-500/20 text-rose-200 border-rose-500/30 font-bold',
      lightLabel: 'text-rose-700',
      lightActiveBadge: 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm',
      lightCheckboxActive: 'bg-rose-600 border-rose-600 text-white',
      lightAccentText: 'text-rose-600',
      lightActiveInput: 'border-rose-500/20 focus-within:border-rose-600/60',
      lightApiCardBg: 'bg-rose-50/30 border-rose-500/15 hover:border-rose-500/30',
      lightConsoleTitle: 'text-rose-950',
      lightConsoleBorder: 'border-rose-500/15',
      lightActiveBtn: 'bg-rose-500/10 border-rose-500/40 text-rose-800 shadow-sm',
      lightConsoleGlow: 'text-rose-500',
      lightConsoleBg: 'border-rose-505/15 shadow-rose-505/5'
    };
  }
  if (cleanClass.includes('amber') || cleanClass.includes('yellow') || cleanClass.includes('orange')) {
    return {
      bg: 'bg-amber-600',
      hoverBg: 'hover:bg-amber-500',
      border: 'border-amber-500',
      ring: 'focus:ring-amber-500/30',
      text: 'text-amber-300',
      textHover: 'hover:text-amber-200',
      borderMute: 'border-amber-500/20',
      bgLight: 'bg-amber-950/20',
      bgMute: 'bg-amber-950/10',
      glow: 'bg-amber-500',
      badge: 'bg-amber-500/20 text-amber-200 border-amber-500/30 font-bold',
      lightLabel: 'text-amber-700',
      lightActiveBadge: 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm',
      lightCheckboxActive: 'bg-amber-700 border-amber-700 text-white',
      lightAccentText: 'text-amber-605',
      lightActiveInput: 'border-amber-500/20 focus-within:border-amber-600/60',
      lightApiCardBg: 'bg-amber-50/30 border-amber-500/15 hover:border-amber-500/30',
      lightConsoleTitle: 'text-amber-950',
      lightConsoleBorder: 'border-amber-500/15',
      lightActiveBtn: 'bg-amber-500/10 border-amber-500/40 text-amber-805 shadow-sm',
      lightConsoleGlow: 'text-amber-500',
      lightConsoleBg: 'border-amber-505/15 shadow-amber-505/5'
    };
  }
  if (cleanClass.includes('purple') || cleanClass.includes('violet')) {
    return {
      bg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-500',
      border: 'border-purple-500',
      ring: 'focus:ring-purple-500/30',
      text: 'text-purple-300',
      textHover: 'hover:text-purple-200',
      borderMute: 'border-purple-500/20',
      bgLight: 'bg-purple-950/20',
      bgMute: 'bg-purple-950/10',
      glow: 'bg-purple-500',
      badge: 'bg-purple-500/20 text-purple-200 border-purple-500/30 font-bold',
      lightLabel: 'text-purple-700',
      lightActiveBadge: 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm',
      lightCheckboxActive: 'bg-purple-600 border-purple-600 text-white',
      lightAccentText: 'text-purple-600',
      lightActiveInput: 'border-purple-500/20 focus-within:border-purple-600/60',
      lightApiCardBg: 'bg-purple-50/30 border-purple-500/15 hover:border-purple-500/30',
      lightConsoleTitle: 'text-purple-950',
      lightConsoleBorder: 'border-purple-500/15',
      lightActiveBtn: 'bg-purple-500/10 border-purple-500/40 text-purple-800 shadow-sm',
      lightConsoleGlow: 'text-purple-500',
      lightConsoleBg: 'border-purple-505/15 shadow-purple-505/5'
    };
  }
  if (cleanClass.includes('sky') || cleanClass.includes('blue')) {
    return {
      bg: 'bg-sky-600',
      hoverBg: 'hover:bg-sky-500',
      border: 'border-sky-500',
      ring: 'focus:ring-sky-500/30',
      text: 'text-sky-300',
      textHover: 'hover:text-sky-200',
      borderMute: 'border-sky-500/20',
      bgLight: 'bg-sky-950/20',
      bgMute: 'bg-sky-950/10',
      glow: 'bg-sky-500',
      badge: 'bg-sky-500/20 text-sky-200 border-sky-500/30 font-bold',
      lightLabel: 'text-sky-700',
      lightActiveBadge: 'bg-sky-50 border-sky-400 text-sky-700 shadow-sm',
      lightCheckboxActive: 'bg-sky-600 border-sky-600 text-white',
      lightAccentText: 'text-sky-600',
      lightActiveInput: 'border-sky-500/20 focus-within:border-sky-600/60',
      lightApiCardBg: 'bg-sky-50/30 border-sky-500/15 hover:border-sky-500/30',
      lightConsoleTitle: 'text-sky-950',
      lightConsoleBorder: 'border-sky-500/15',
      lightActiveBtn: 'bg-sky-500/10 border-sky-500/40 text-sky-800 shadow-sm',
      lightConsoleGlow: 'text-sky-500',
      lightConsoleBg: 'border-sky-505/15 shadow-sky-505/5'
    };
  }
  
  const match = cleanClass.match(/bg-([a-z]+)-(\d+)/);
  if (match) {
    const color = match[1];
    return {
      bg: cleanClass,
      hoverBg: `hover:bg-${color}-500`,
      border: `border-${color}-500`,
      ring: `focus:ring-${color}-500/30`,
      text: `text-${color}-300`,
      textHover: `hover:text-${color}-200`,
      borderMute: `border-${color}-550/20`,
      bgLight: `bg-${color}-950/20`,
      bgMute: `bg-${color}-950/10`,
      glow: `bg-${color}-500`,
      badge: `bg-${color}-500/20 text-${color}-200 border-${color}-500/30 font-bold`,
      lightLabel: `text-${color}-700`,
      lightActiveBadge: `bg-${color}-50 border-${color}-400 text-${color}-700 shadow-sm`,
      lightCheckboxActive: `bg-${color}-600 border-${color}-600 text-white`,
      lightAccentText: `text-${color}-600`,
      lightActiveInput: `border-${color}-500/20 focus-within:border-${color}-600/60`,
      lightApiCardBg: `bg-${color}-50/30 border-${color}-500/15 hover:border-${color}-500/30`,
      lightConsoleTitle: `text-${color}-950`,
      lightConsoleBorder: `border-${color}-500/15`,
      lightActiveBtn: `bg-${color}-500/10 border-${color}-500/40 text-${color}-800 shadow-sm`,
      lightConsoleGlow: `text-${color}-500`,
      lightConsoleBg: `border-${color}-505/15 shadow-${color}-505/5`
    };
  }
  
  return defaults;
};

// User bubble style helper
const getUserBubbleStyle = (themeColor?: string) => {
  const defaults = {
    bubbleBg: 'bg-[#005c4b]/95',
    bubbleTail: 'bg-[#005c4b]',
    bubbleBorder: 'border-[#00a884]/30',
    attachBg: 'bg-[#00483a]',
    attachBorder: 'border-[#00705a]/45',
    checkColor: 'text-[#53bdeb]',
    fileText: 'text-emerald-400',
  };

  if (!themeColor) return defaults;
  const tc = themeColor.toLowerCase();

  if (tc.includes('indigo')) {
    return {
      bubbleBg: 'bg-[#312e81]/95', // Indigo 900
      bubbleTail: 'bg-[#312e81]',
      bubbleBorder: 'border-indigo-500/35',
      attachBg: 'bg-[#1e1b4b]', // Indigo 950
      attachBorder: 'border-indigo-500/25',
      checkColor: 'text-indigo-200',
      fileText: 'text-indigo-300',
    };
  }
  if (tc.includes('emerald') || tc.includes('green')) {
    return {
      bubbleBg: 'bg-[#064e3b]/95', // Emerald 900
      bubbleTail: 'bg-[#064e3b]',
      bubbleBorder: 'border-emerald-500/35',
      attachBg: 'bg-[#022c22]', // Emerald 950
      attachBorder: 'border-emerald-500/25',
      checkColor: 'text-emerald-200',
      fileText: 'text-emerald-300',
    };
  }
  if (tc.includes('rose') || tc.includes('red')) {
    return {
      bubbleBg: 'bg-[#881337]/95', // Rose 900
      bubbleTail: 'bg-[#881337]',
      bubbleBorder: 'border-rose-500/35',
      attachBg: 'bg-[#4c0519]', // Rose 950
      attachBorder: 'border-rose-500/25',
      checkColor: 'text-rose-200',
      fileText: 'text-rose-300',
    };
  }
  if (tc.includes('amber') || tc.includes('yellow') || tc.includes('orange')) {
    return {
      bubbleBg: 'bg-[#78350f]/95', // Amber 900
      bubbleTail: 'bg-[#78350f]',
      bubbleBorder: 'border-amber-500/35',
      attachBg: 'bg-[#451a03]', // Amber 950
      attachBorder: 'border-amber-500/25',
      checkColor: 'text-amber-200',
      fileText: 'text-amber-300',
    };
  }
  if (tc.includes('purple') || tc.includes('violet')) {
    return {
      bubbleBg: 'bg-[#581c87]/95', // Purple 900
      bubbleTail: 'bg-[#581c87]',
      bubbleBorder: 'border-purple-500/35',
      attachBg: 'bg-[#3b0764]', // Purple 950
      attachBorder: 'border-purple-500/25',
      checkColor: 'text-purple-200',
      fileText: 'text-purple-300',
    };
  }
  if (tc.includes('sky') || tc.includes('blue')) {
    return {
      bubbleBg: 'bg-[#0c4a6e]/95', // Sky 900
      bubbleTail: 'bg-[#0c4a6e]',
      bubbleBorder: 'border-sky-500/35',
      attachBg: 'bg-[#082f49]', // Sky 950
      attachBorder: 'border-sky-500/25',
      checkColor: 'text-sky-200',
      fileText: 'text-sky-300',
    };
  }

  // Fallback map color based on tailwind class extraction
  const match = tc.match(/bg-([a-z]+)-(\d+)/);
  if (match) {
    const color = match[1];
    return {
      bubbleBg: `bg-${color}-950/95`,
      bubbleTail: `bg-${color}-950`,
      bubbleBorder: `border-${color}-500/35`,
      attachBg: `bg-${color}-950/60`,
      attachBorder: `border-${color}-500/25`,
      checkColor: `text-${color}-200`,
      fileText: `text-${color}-350`,
    };
  }

  return defaults;
};

// Backdrop backdrop gradient helper
const getBackdropRgba = (themeColor?: string) => {
  if (!themeColor) return 'rgba(0, 168, 132, 0.05)';
  const tc = themeColor.toLowerCase();
  if (tc.includes('indigo')) return 'rgba(99, 102, 241, 0.05)';
  if (tc.includes('emerald') || tc.includes('green')) return 'rgba(16, 185, 129, 0.05)';
  if (tc.includes('rose') || tc.includes('red')) return 'rgba(244, 63, 94, 0.05)';
  if (tc.includes('amber') || tc.includes('yellow') || tc.includes('orange')) return 'rgba(245, 158, 11, 0.05)';
  if (tc.includes('purple') || tc.includes('violet')) return 'rgba(168, 85, 247, 0.05)';
  if (tc.includes('sky') || tc.includes('blue')) return 'rgba(14, 165, 233, 0.05)';
  
  // Try to parse some layout color
  const match = tc.match(/bg-([a-z]+)-(\d+)/);
  if (match) {
    const color = match[1];
    if (color === 'sky' || color === 'blue') return 'rgba(14, 165, 233, 0.05)';
    if (color === 'rose' || color === 'red') return 'rgba(244, 63, 94, 0.05)';
    if (color === 'emerald' || color === 'green') return 'rgba(16, 185, 129, 0.05)';
    if (color === 'indigo') return 'rgba(99, 102, 241, 0.05)';
    if (color === 'purple' || color === 'violet') return 'rgba(168, 85, 247, 0.05)';
    if (color === 'amber' || color === 'yellow' || color === 'orange') return 'rgba(245, 158, 11, 0.05)';
  }
  return 'rgba(0, 168, 132, 0.05)';
};

// Tailwind class merger utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

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

export interface PromptTemplate {
  name: string;
  emoji: string;
  desc: string;
  prompt: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: "Roleplaying Scholar",
    emoji: "🎓",
    desc: "Act as an elite domain authority & academic scholar, grounding all claims.",
    prompt: "Act as an elite domain authority and academic scholar. Analyze the topic with rigorous detail, citing foundational logic and explaining any nuances step-by-step: "
  },
  {
    name: "Code Architect",
    emoji: "💻",
    desc: "Refine code prompts with separation of concerns, clean styles, and types.",
    prompt: "You are a senior software architect. Rewrite this to follow the highest industry standard patterns, prioritizing complete modularity, type safety, security, and clean documentation. Here is the context: "
  },
  {
    name: "Bento Structure",
    emoji: "🍱",
    desc: "Formulate answers in highly readable bento blocks, sections, and tables.",
    prompt: "Structure the response into clear, modular sections using markdown bold headings, bulleted lists, and neat tables for data. Ensure maximum visual scannability: "
  },
  {
    name: "Socratic Teacher",
    emoji: "🦉",
    desc: "Guide through guided discovery, testing assumptions along the way.",
    prompt: "Act as a patient Socratic mentor. Lead me through a guided discovery process, breaking down assumptions and asking 2 targeted questions at the end to deepen my understanding: "
  },
  {
    name: "Creative Spark",
    emoji: "✨",
    desc: "Expand the text with rich vocabulary, vivid illustrations, and style.",
    prompt: "Infuse high-fidelity creativity, vivid analogies, elegant prose, and stylized presentation into the following: "
  }
];

export interface AIPurpose {
  id: string;
  name: string;
  emoji: string;
  icon: React.ComponentType<any>;
  desc: string;
  shortDesc: string;
  recommendedModelIds: string[];
  bannerColor: string;
}

export const AI_PURPOSES: AIPurpose[] = [
  {
    id: 'default',
    name: 'Default / General Q&A',
    emoji: '💬',
    icon: HelpCircle,
    desc: 'Answering regular questions, chat sessions, and explaining general concepts',
    shortDesc: 'Answers questions clearly and directly with low-latency model layers',
    recommendedModelIds: ['gemini-flash', 'gpt-4o-mini'],
    bannerColor: 'from-[#005c4b]/30 to-emerald-950/20 text-[#00e676]'
  },
  {
    id: 'coding',
    name: 'Coding & Developer',
    emoji: '💻',
    icon: Code,
    desc: 'Writing production algorithms, refactoring functions, and resolving critical software bugs',
    shortDesc: 'Enables high-intelligence code-completion pipelines (Claude, DeepSeek & Gemini)',
    recommendedModelIds: ['gemini-flash', 'gpt-4o-mini', 'claude-sonnet', 'deepseek-chat'],
    bannerColor: 'from-blue-950/40 to-indigo-950/20 text-blue-400'
  },
  {
    id: 'image',
    name: 'Image Design & Vision',
    emoji: '🎨',
    icon: ImageIcon,
    desc: 'Analyzing graphics, UI wireframes, design audits, and processing diagram contexts',
    shortDesc: 'Multi-modal vision and design pipeline with Gemini, GPT-4o & Claude',
    recommendedModelIds: ['gemini-flash', 'gpt-4o', 'claude-sonnet'],
    bannerColor: 'from-rose-950/40 to-[#e91e63]/25 text-rose-400'
  },
  {
    id: 'content',
    name: 'Content & Copywriting',
    emoji: '✍️',
    icon: PenTool,
    desc: 'Copywriting, blog outline drafting, translating dialects, and brainstorming brand marketing copy',
    shortDesc: 'Expressive storytelling and marketing layouts with high-fidelity models',
    recommendedModelIds: ['gemini-flash', 'gpt-4o', 'claude-sonnet'],
    bannerColor: 'from-purple-950/40 to-pink-950/20 text-purple-400'
  },
  {
    id: 'reasoning',
    name: 'Deep Analytical Reasoning',
    emoji: '🧠',
    icon: Brain,
    desc: 'Solving high-complexity science formulas, executing critical analytical reasoning & logical proofing',
    shortDesc: 'Harnesses high-intelligence titans for diagnostic problem solving',
    recommendedModelIds: ['gemini-pro', 'gpt-4o', 'claude-sonnet', 'deepseek-chat'],
    bannerColor: 'from-amber-950/40 to-orange-950/20 text-amber-400'
  },
  {
    id: 'speed',
    name: 'Rapid Low-Latency Burst',
    emoji: '⚡',
    icon: Zap,
    desc: 'Delivering microsecond speeds using high-throughput responsive models',
    shortDesc: 'Best for lightweight chats, low-latency lookups, and rapid brainstorming',
    recommendedModelIds: ['gemini-flash', 'gpt-4o-mini', 'claude-haiku', 'llama-groq'],
    bannerColor: 'from-cyan-950/40 to-teal-950/20 text-cyan-400'
  }
];

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  content?: string;
}

interface ChatTurn {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  modelResponses?: Array<{
    modelId: string;
    modelName: string;
    provider: string;
    content: string;
    latency?: number;
    wordCount?: number;
    error?: string;
  }>;
  evaluation?: {
    winner?: {
      provider?: string;
      modelId?: string;
      reason?: string;
    };
    ratings?: Array<{
      provider: string;
      modelId: string;
      toneRating: number;
      qualityRating: number;
      formatRating: number;
      overallScore: number;
      pros?: string[];
      cons?: string[];
    }>;
    comparisonSummary?: string;
  };
}

const STARTER_PROMPTS = [
  { 
    title: "Optimize Code Block", 
    body: "Write a high-performance generic TypeScript debounce function with custom leading/trailing edge constraints and clean documentation.",
    badge: "Engineering",
    icon: Code,
    color: "text-blue-400 bg-blue-500/10"
  },
  { 
    title: "SaaS Brand Strategy", 
    body: "List 5 unique, ultra-short, memorable brand name ideas for an AI coding workflow assistant, along with direct domain name concepts.",
    badge: "Marketing",
    icon: Compass,
    color: "text-emerald-400 bg-emerald-500/10"
  },
  { 
    title: "Refactor Critical Email", 
    body: "Politely rephrase this harsh client email: 'We completely hate this draft. It lacks style and breaks our core database flow regularly. Fix it by tomorrow or we cancel.'",
    badge: "Communication",
    icon: BotIcon,
    color: "text-amber-400 bg-amber-500/10"
  },
  { 
    title: "Explain Complex Topic", 
    body: "Explain quantum superposition clearly to a 10-year-old child using an interactive analogy of a spinning magical coin.",
    badge: "Education",
    icon: HelpCircle,
    color: "text-purple-400 bg-purple-500/10"
  }
];

interface ChatSession {
  id: string;
  title: string;
  chatHistory: ChatTurn[];
  selectedModelIds: string[];
  selectedPurposeId: string;
  systemInstruction: string;
  createdAt: number;
}

export const CompareChatView: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat_sessions_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            chatHistory: (s.chatHistory || []).map((turn: any) => ({
              ...turn,
              timestamp: turn.timestamp ? new Date(turn.timestamp) : new Date(),
            }))
          }));
        }
      } catch (e) {
        console.error("Failed to parse saved chat sessions v2", e);
      }
    }
    const defaultSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: 'General Q&A',
      chatHistory: [],
      selectedModelIds: ['gemini-flash', 'gpt-4o-mini'],
      selectedPurposeId: 'default',
      systemInstruction: 'You are a helpful assistant. Formulate precise, objective, and well-structured answers.',
      createdAt: Date.now()
    };
    return [defaultSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || '';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === currentSessionId) || sessions[0] || {
    id: 'fallback',
    title: 'New Chat',
    chatHistory: [],
    selectedModelIds: ['gemini-flash', 'gpt-4o-mini'],
    selectedPurposeId: 'default',
    systemInstruction: 'You are a helpful assistant. Formulate precise, objective, and well-structured answers.'
  };

  const chatHistory = activeSession.chatHistory;
  const selectedModelIds = activeSession.selectedModelIds;
  const selectedPurposeId = activeSession.selectedPurposeId;
  const systemInstruction = activeSession.systemInstruction;

  const setChatHistory = (updater: ChatTurn[] | ((prev: ChatTurn[]) => ChatTurn[])) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          const nextHistory = typeof updater === 'function' ? updater(s.chatHistory) : updater;
          
          let nextTitle = s.title;
          if (s.title === 'New Chat' || s.title === 'General Q&A' || s.title === '' || s.title === 'General Q&A...') {
            const firstUserTurn = nextHistory.find(t => t.sender === 'user');
            if (firstUserTurn) {
              const text = firstUserTurn.content;
              nextTitle = text.length > 25 ? text.substring(0, 25).trim() + '...' : text.trim();
            }
          }

          return { ...s, chatHistory: nextHistory, title: nextTitle };
        }
        return s;
      });
      localStorage.setItem('chat_sessions_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const setSelectedModelIds = (updater: string[] | ((prev: string[]) => string[])) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          const nextVal = typeof updater === 'function' ? updater(s.selectedModelIds) : updater;
          return { ...s, selectedModelIds: nextVal };
        }
        return s;
      });
      localStorage.setItem('chat_sessions_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const setSelectedPurposeId = (val: string) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, selectedPurposeId: val };
        }
        return s;
      });
      localStorage.setItem('chat_sessions_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const setSystemInstruction = (val: string) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, systemInstruction: val };
        }
        return s;
      });
      localStorage.setItem('chat_sessions_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddNewSession = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: 'New Chat',
      chatHistory: [],
      selectedModelIds: ['gemini-flash', 'gpt-4o-mini'],
      selectedPurposeId: 'default',
      systemInstruction: 'You are a helpful assistant. Formulate precise, objective, and well-structured answers.',
      createdAt: Date.now()
    };
    setSessions(prev => {
      const next = [newSession, ...prev];
      localStorage.setItem('chat_sessions_v2', JSON.stringify(next));
      return next;
    });
    setCurrentSessionId(newSession.id);
    toast.success("Created new conversation thread!", {
      icon: "💬"
    });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      toast.error("You must keep at least one active conversation thread!");
      return;
    }
    setConfirmingDeleteId(sessionId);
  };

  const performDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) {
      toast.error("You must keep at least one active conversation thread!");
      return;
    }
    const nextSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(nextSessions);
    localStorage.setItem('chat_sessions_v2', JSON.stringify(nextSessions));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(nextSessions[0].id);
    }
    setConfirmingDeleteId(null);
    toast.success("Conversation thread removed.");
  };

  const startEditingSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveSessionTitle = (sessionId: string) => {
    if (!editingTitle.trim()) {
      toast.error("Thread title cannot be empty!");
      return;
    }
    setSessions(prev => {
      const next = prev.map(s => s.id === sessionId ? { ...s, title: editingTitle.trim() } : s);
      localStorage.setItem('chat_sessions_v2', JSON.stringify(next));
      return next;
    });
    setEditingSessionId(null);
    toast.success("Conversation renamed.");
  };

  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  // Local storage credentials
  const [keys, setKeys] = useState({
    geminiKey: localStorage.getItem('compare_key_gemini') || '',
    openaiKey: localStorage.getItem('compare_key_openai') || '',
    anthropicKey: localStorage.getItem('compare_key_anthropic') || '',
    groqKey: localStorage.getItem('compare_key_groq') || '',
    deepseekKey: localStorage.getItem('compare_key_deepseek') || '',
  });

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
      .catch(err => console.warn("Failed to fetch server credentials status:", err));
  }, []);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedResponseIds, setCopiedResponseIds] = useState<Record<string, boolean>>({});
  const [isPromptGeneratorOpen, setIsPromptGeneratorOpen] = useState(false);
  const [isPromptOptimizerOpen, setIsPromptOptimizerOpen] = useState(false);
  const [selectedGeneratorStyle, setSelectedGeneratorStyle] = useState<'standard' | 'creative' | 'logical' | 'speed'>('standard');

  const matchedPurpose = AI_PURPOSES.find(p => {
    if (p.recommendedModelIds.length !== selectedModelIds.length) return false;
    return p.recommendedModelIds.every(id => selectedModelIds.includes(id));
  });

  const handlePurposeSelect = (purposeId: string) => {
    setSelectedPurposeId(purposeId);
    const purposeObj = AI_PURPOSES.find(p => p.id === purposeId);
    if (purposeObj) {
      setSelectedModelIds(purposeObj.recommendedModelIds);
      toast.success(`Goal configured: ${purposeObj.emoji} ${purposeObj.name}! Recommended models auto-configured side-by-side.`, {
        icon: "🎯"
      });
    } else {
      setSelectedModelIds(AVAILABLE_MODELS.map(m => m.id));
      setSelectedPurposeId('');
      toast.info("Custom mix configuration enabled.", {
        icon: "✨"
      });
    }
  };
  const [preferredModels, setPreferredModels] = useState<Record<string, string>>({});
  const [activeTurnTabs, setActiveTurnTabs] = useState<Record<string, 'grid' | 'advisor' | 'split'>>({});
  const [splitModelA, setSplitModelA] = useState<Record<string, string>>({});
  const [splitModelB, setSplitModelB] = useState<Record<string, string>>({});
  const [visibleModelFilters, setVisibleModelFilters] = useState<Record<string, string[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

  const { bots } = useAppStore();
  const activeBot = bots[0];
  const theme = getThemeColorConfig(activeBot?.themeColor);
  const colorName = activeBot?.themeColor ? (activeBot.themeColor.split('-')[1] || 'indigo') : 'indigo';
  const bubbleStyle = getUserBubbleStyle(activeBot?.themeColor);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, generating]);

  useEffect(() => {
    const freshKeys = {
      geminiKey: localStorage.getItem('compare_key_gemini') || '',
      openaiKey: localStorage.getItem('compare_key_openai') || '',
      anthropicKey: localStorage.getItem('compare_key_anthropic') || '',
      groqKey: localStorage.getItem('compare_key_groq') || '',
      deepseekKey: localStorage.getItem('compare_key_deepseek') || '',
    };
    setKeys(prev => {
      if (
        prev.geminiKey !== freshKeys.geminiKey ||
        prev.openaiKey !== freshKeys.openaiKey ||
        prev.anthropicKey !== freshKeys.anthropicKey ||
        prev.groqKey !== freshKeys.groqKey ||
        prev.deepseekKey !== freshKeys.deepseekKey
      ) {
        return freshKeys;
      }
      return prev;
    });
  }, []);

  const handleKeyChange = (field: keyof typeof keys, value: string) => {
    const updatedKeys = { ...keys, [field]: value };
    setKeys(updatedKeys);
    
    const storageKey = `compare_key_${field.replace('Key', '')}`;
    localStorage.setItem(storageKey, value);
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
  };

  const applyPreset = (preset: 'balanced' | 'flagships' | 'fast' | 'all') => {
    let ids: string[] = [];
    if (preset === 'balanced') {
      ids = ['gemini-flash', 'gpt-4o-mini'];
    } else if (preset === 'flagships') {
      ids = ['gemini-pro', 'gpt-4o', 'claude-sonnet'];
    } else if (preset === 'fast') {
      ids = ['gemini-flash', 'gpt-4o-mini', 'claude-haiku'];
    } else if (preset === 'all') {
      ids = AVAILABLE_MODELS.map(m => m.id);
    }
    setSelectedModelIds(ids);
    toast.success(`Preset loaded: ${preset.toUpperCase()}`);
  };

  const handleClearChat = () => {
    setIsConfirmingClear(true);
  };

  const performClearChat = () => {
    if (sessions.length > 1) {
      const nextSessions = sessions.filter(s => s.id !== currentSessionId);
      setSessions(nextSessions);
      localStorage.setItem('chat_sessions_v2', JSON.stringify(nextSessions));
      setCurrentSessionId(nextSessions[0].id);
      setIsConfirmingClear(false);
      toast.success("Chat thread deleted and removed from history!");
    } else {
      const newSessionId = Math.random().toString(36).substring(7);
      const freshSession: ChatSession = {
        id: newSessionId,
        title: 'General Q&A',
        chatHistory: [],
        selectedModelIds: ['gemini-flash', 'gpt-4o-mini'],
        selectedPurposeId: 'default',
        systemInstruction: 'You are a helpful assistant. Formulate precise, objective, and well-structured answers.',
        createdAt: Date.now()
      };
      setSessions([freshSession]);
      localStorage.setItem('chat_sessions_v2', JSON.stringify([freshSession]));
      setCurrentSessionId(newSessionId);
      setIsConfirmingClear(false);
      toast.success("Chat thread deleted and reset to a fresh workspace!");
    }
  };

  const processFiles = (filesList: File[]) => {
    filesList.forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAttachment: ChatAttachment = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: isImage ? result : undefined,
          content: !isImage && file.size < 1024 * 1024 ? result : undefined,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const copyToClipboard = (text: string, responseKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponseIds(prev => ({ ...prev, [responseKey]: true }));
    toast.success("Response copied into workspace clipboard!");
    setTimeout(() => {
      setCopiedResponseIds(prev => ({ ...prev, [responseKey]: false }));
    }, 2000);
  };

  const handleRephrasePrompt = async () => {
    if (!inputMessage.trim()) {
      toast.error("Please type or draft a prompt first, then click to optimize and rephrase it!");
      return;
    }
    
    setIsRephrasing(true);
    const toastId = toast.loading("Rephrasing and optimizing prompt with Gemini...");
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputMessage }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to rephrase prompt");
      }
      
      const data = await response.json();
      if (data.text) {
        setInputMessage(data.text.trim());
        toast.success("Prompt optimized and polished successfully!", { id: toastId });
      } else {
        throw new Error("No rephrased text returned");
      }
    } catch (error) {
      console.error("Error rephrasing prompt:", error);
      toast.error("Error optimizing/rephrasing. Please try again or check your API key.", { id: toastId });
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleGeneratorTrigger = async (style: 'standard' | 'creative' | 'logical' | 'speed') => {
    if (!inputMessage.trim()) return;
    
    setIsRephrasing(true);
    const toastId = toast.loading("Invoking Gemini prompt engineering optimization engine...");
    
    let customInstruction = "You are an expert prompt engineer. Your goal is to improve, expand, polish, or rephrase the user's input prompt so that LLM/AI models can answer it with maximum clarity, depth, and precision.";
    if (style === 'creative') {
      customInstruction += " Infuse high-fidelity creativity, beautiful descriptive prose, imaginative analogies, and vivid descriptive parameters into the response, making it highly artistic and engaging, while preserving primary intents.";
    } else if (style === 'logical') {
      customInstruction += " Enforce an explicit, highly rigorous, step-by-step analytical sequence. Outline strict specifications, parameters, output constraints, edge cases, and ask the model to evaluate assumptions systematically.";
    } else if (style === 'speed') {
      customInstruction += " Make the prompt incredibly direct, compact, concise, and dense. Strip all filler, fluff, and wordiness. The output must be optimized for fast, raw data, or extreme executive summary responses.";
    }
    
    customInstruction += " Maintain original user intentions, values, parameters, constraints, and variables, but make the wording beautifully precise, clear, structured, and easy to interpret. Return ONLY the polished final prompt itself, never explain your changes, do not write intro preambles, and do not include quote marks around it.";

    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputMessage, customInstruction }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to optimize prompt");
      }
      
      const data = await response.json();
      if (data.text) {
        setInputMessage(data.text.trim());
        toast.success(`Prompt optimized styled as "${style.toUpperCase()}"!`, { id: toastId });
      } else {
        throw new Error("No rephrased text returned");
      }
    } catch (error) {
      console.error("Error optimising prompt:", error);
      toast.error("Error optimizing/rephrasing prompt. Check backend status.", { id: toastId });
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const targetText = customText || inputMessage;
    if (!targetText.trim() && attachments.length === 0) return;
    
    if (selectedModelIds.length === 0) {
      toast.error("Please toggle at least one active AI model to chat with!");
      return;
    }
    if (generating) return;

    // Validate keys for selected models
    const activeModels = AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id));
    const missingKeys: string[] = [];
    activeModels.forEach(m => {
      if (m.requiresKey && !keys[m.keyName]) {
        missingKeys.push(m.name);
      }
    });

    // We do not block since the user can rely on secure backend fallbacks.
    if (missingKeys.length > 0) {
      console.log(`Relying on server-side key configurations for: ${missingKeys.join(', ')}`);
    }

    setInputMessage('');
    setGenerating(true);

    const userTurn: ChatTurn = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      content: targetText.trim() || `Uploaded ${attachments.length} attachment(s)`,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Clear attachments state for the next message
    setAttachments([]);

    const currentHistory = [...chatHistory, userTurn];
    setChatHistory(currentHistory);

    // System instruction is derived directly from the customizable systemInstruction state hook.

    try {
      let promptToSend = targetText.trim();
      if (currentHistory.length > 1) {
        promptToSend = currentHistory.map(turn => {
          if (turn.sender === 'user') {
            let turnDetails = `User: ${turn.content}`;
            if (turn.attachments && turn.attachments.length > 0) {
              turn.attachments.forEach(att => {
                if (att.content) {
                  turnDetails += `\n[Uploaded Document: "${att.name}"]\nContent:\n${att.content}`;
                } else {
                  turnDetails += `\n[Uploaded Attachment: "${att.name}"]`;
                }
              });
            }
            return turnDetails;
          } else {
            return `Assistant: ${turn.content}`;
          }
        }).join('\n');
      } else if (userTurn.attachments && userTurn.attachments.length > 0) {
        let attachmentDesc = "";
        userTurn.attachments.forEach(att => {
          if (att.content) {
            attachmentDesc += `\n\n[Uploaded Document: "${att.name}" of type ${att.type}]\nContent:\n${att.content}\n\n`;
          } else if (att.type.startsWith('image/')) {
            attachmentDesc += `\n\n[Uploaded Image Attachment: "${att.name}" of type ${att.type}]\n (Note to AI: An image has been specified and visually uploaded to the sandbox envelope. Respond directly and address any text references to it.)\n`;
          } else {
            attachmentDesc += `\n\n[Uploaded File Attachment: "${att.name}" of size ${(att.size / 1024).toFixed(1)} KB]\n`;
          }
        });
        promptToSend = `${promptToSend}${attachmentDesc}`;
      }

      const configs = activeModels.map(m => ({
        provider: m.provider,
        modelId: m.modelId,
        apiKey: keys[m.keyName]
      }));

      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          systemInstruction,
          configs
        })
      });

      if (!response.ok) {
        throw new Error("Local container comparison service failed.");
      }

      const data = await response.json();

      const aiTurn: ChatTurn = {
        id: Math.random().toString(36).substring(7),
        sender: 'system',
        content: data.evaluation?.winner ? `Evaluation Winner: ${data.evaluation.winner.provider}` : '',
        timestamp: new Date(),
        modelResponses: (data.results || []).map((r: any) => {
          const matchedModel = AVAILABLE_MODELS.find(m => m.provider === r.provider && m.modelId === r.modelId);
          return {
            modelId: matchedModel?.id || r.modelId,
            modelName: matchedModel?.name || `${r.provider} (${r.modelId})`,
            provider: r.provider,
            content: r.error ? '' : r.text,
            latency: r.latency,
            wordCount: r.wordCount,
            error: r.error
          };
        }),
        evaluation: data.evaluation
      };

      setChatHistory(prev => [...prev, aiTurn]);
    } catch (err: any) {
      console.error("Comparison request failed:", err);
      toast.error("Failed to run side-by-side models: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const getFormattedTime = (dateObj?: Date) => {
    const d = dateObj ? new Date(dateObj) : new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? d.getHours() % 12 : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  return (
    <div className="w-full h-full flex bg-[#f8fafc] animate-fade-in font-sans overflow-hidden relative">
      
      {/* Mobile Sidebar Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-20 transition-opacity animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat History Sidebar */}
      <div className={cn(
        "bg-white border-r border-slate-200 h-full flex flex-col transition-all duration-300 shrink-0 z-30",
        // Desktop responsive:
        isSidebarOpen ? "md:w-[280px]" : "md:w-0 md:overflow-hidden md:border-r-0",
        // Mobile responsive absolute slide-out drawer:
        "fixed md:static inset-y-0 left-0 w-[280px]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-slate-800 tracking-widest text-[10.5px] uppercase select-none">
              Chat History
            </span>
          </div>
          {/* Mobile close button */}
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-200/60">
          <button
            type="button"
            onClick={handleAddNewSession}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/15 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white font-bold" />
            <span>+ NEW CHAT</span>
          </button>
        </div>

        {/* Session List Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-850 select-none">
          {sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isEditing = editingSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  if (!isEditing) {
                    setCurrentSessionId(session.id);
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all cursor-pointer relative",
                  isActive 
                    ? activeBot ? `bg-slate-100 border-l-2 border-${colorName}-500 text-slate-800 font-bold` : "bg-indigo-50 border-l-2 border-indigo-600 text-indigo-650 font-bold" 
                    : "hover:bg-slate-50 text-slate-500 hover:text-indigo-600 font-medium"
                )}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSessionTitle(session.id);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 max-w-[170px] outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSessionTitle(session.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-750 rounded hover:bg-slate-50 cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSessionId(null)}
                      className="p-1 text-zinc-400 hover:text-zinc-350 rounded hover:bg-[#ffffff] cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : confirmingDeleteId === session.id ? (
                  <div className="flex items-center gap-1.5 w-full justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-red-450 font-black select-none uppercase">Delete thread?</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => performDeleteSession(session.id)}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-extrabold cursor-pointer transition-colors uppercase outline-none"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="px-2 py-0.5 bg-zinc-700 hover:bg-zinc-650 text-zinc-100 rounded text-[10px] font-extrabold cursor-pointer transition-colors uppercase outline-none"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate flex-1 pr-1.5">
                      <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-[#00e676]" : "text-zinc-500")} />
                      <span className="text-xs truncate leading-tight select-text">
                        {session.title || 'Untitled Chat'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => startEditingSession(session, e)}
                        className="p-1 text-slate-400 hover:text-slate-705 rounded hover:bg-slate-100 cursor-pointer"
                        title="Rename Chat"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Chat Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* Chat Wrapper Container with pure WhatsApp dark theme */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Custom Messenger Room Title Sub-Header Bar */}
          <div className={cn(
            "p-3.5 border-b flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden transition-all duration-300 z-10",
            activeBot 
              ? `bg-white/40 border-${colorName}-500/15 backdrop-blur-xl` 
              : "bg-[#f8fafc]/35 border-slate-200/40 backdrop-blur-xl"
          )}>
            {activeBot && (
              <div className={cn("absolute inset-0 opacity-[0.06] pointer-events-none", theme.glow)} />
            )}
            <div className="flex items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 text-slate-550 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
                title="Toggle Sidebar History"
              >
                <Menu className={cn("w-5 h-5", activeBot ? theme.lightAccentText : "text-indigo-600")} />
              </button>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[#fafafa] relative shadow-md shrink-0 transition-all",
                activeBot ? theme.bg : "bg-indigo-650"
              )}>
                <GitCompare className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 rounded-full border-inherit" title="Live Arena Connected" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black tracking-tight text-slate-850 flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-xs">
                  <span>{activeSession.title || 'General Q&A'}</span>
                </h4>
                <p className="text-[11px] flex items-center gap-1 font-semibold select-none">
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0", activeBot ? theme.glow : "bg-indigo-500")} />
                  <span className={activeBot ? theme.lightLabel : "text-indigo-650"}>{selectedModelIds.length} models responding live</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              {chatHistory.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  {isConfirmingClear ? (
                    <div className="flex items-center gap-2 bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200 animate-fade-in">
                      <span className="text-[10px] text-red-700 font-bold select-none mr-1">Reset?</span>
                      <button
                        id="btn-confirm-reset-chat-yes"
                        onClick={performClearChat}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded cursor-pointer transition-colors outline-none"
                      >
                        Yes
                      </button>
                      <button
                        id="btn-confirm-reset-chat-cancel"
                        onClick={() => setIsConfirmingClear(false)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-[10px] rounded cursor-pointer transition-colors outline-none"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-trigger-reset-chat"
                      onClick={handleClearChat}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100/80 border border-red-200/60 text-red-600 hover:text-red-700 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm select-none outline-none"
                      title="Reset Comparative Playground"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-550" />
                      <span>Reset Chat</span>
                    </button>
                  )}
                </div>
              )}

              <button 
                onClick={() => {
                  setIsConfigureOpen(!isConfigureOpen);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10.5px] font-bold border transition-all duration-300 cursor-pointer active:scale-95 select-none relative z-10 shadow-sm",
                  isConfigureOpen 
                    ? activeBot 
                      ? `bg-${colorName}-50 border-${colorName}-200 text-${colorName}-700` 
                      : "bg-indigo-50 border-indigo-200 text-indigo-700" 
                    : activeBot
                      ? `bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-750`
                      : "bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-750"
                )}
                title="Configure LLM Arena Settings (Session Purpose, Active Channels, System Instructions & Credentials)"
              >
                <Settings className={cn("w-3.5 h-3.5 transition-colors animate-spin-slow", isConfigureOpen ? (activeBot ? `text-${colorName}-600` : "text-indigo-600") : "text-slate-500")} />
                <span className="text-slate-750">Configure Arena</span>
                {isConfigureOpen 
                  ? <ChevronUp className="w-3 h-3 text-slate-500" /> 
                  : <ChevronDown className="w-3 h-3 text-slate-400" />
                }
              </button>
            </div>
          </div>

          {/* Expandable Unified Configure Drawer */}
          <AnimatePresence>
            {isConfigureOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "border-b p-5 space-y-4 overflow-hidden shrink-0 shadow-md z-20 text-zinc-900 bg-white relative transition-all duration-500",
                  theme.lightConsoleBg
                )}
              >
                {/* Dynamic premium glowing top line */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-current to-transparent opacity-60 blur-[0.5px] transition-all duration-500",
                  theme.lightConsoleGlow
                )} />

                {/* Subtle tech grid patterns */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />
                
                <div className={cn(
                  "flex items-center justify-between border-b pb-3 relative z-10 transition-colors duration-300",
                  theme.lightConsoleBorder
                )}>
                  <div className="flex items-center gap-2">
                    <Settings className={cn("w-4 h-4 transition-colors", theme.lightAccentText)} />
                    <h5 className={cn(
                      "text-xs font-black uppercase tracking-widest transition-colors duration-300",
                      theme.lightConsoleTitle
                    )}>Arena Configuration Console</h5>
                  </div>
                  <span className="text-[10px] text-zinc-500 italic hidden sm:inline">Customize interactive session parameters, channels, & rules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {/* Left Column: Purpose & Models Selector */}
                  <div className="space-y-4">
                    {/* Purpose Section */}
                    <div className="space-y-1.5">
                      <label className={cn(
                        "text-[10px] font-black uppercase tracking-wider block transition-colors duration-300",
                        theme.lightLabel
                      )}>Session Purpose Mode</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {AI_PURPOSES.map((p) => {
                          const isSelected = (selectedPurposeId || 'default') === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handlePurposeSelect(p.id || 'default')}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border text-[10.5px] font-semibold uppercase text-left transition-all duration-300 cursor-pointer select-none",
                                isSelected
                                  ? theme.lightActiveBadge
                                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-700"
                              )}
                            >
                              <span className="text-sm select-none">{p.emoji}</span>
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Channels Settings */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-wider block transition-colors duration-300",
                          theme.lightLabel
                        )}>Active AI Channels</label>
                        <span className={cn(
                          "text-[10px] font-bold font-mono transition-colors duration-300",
                          theme.lightAccentText
                        )}>
                          {selectedModelIds.length} / {AVAILABLE_MODELS.length} Active
                        </span>
                      </div>
                      <div className={cn(
                        "border rounded-xl p-2 max-h-[170px] overflow-y-auto space-y-1 transition-colors duration-300",
                        theme.lightApiCardBg
                      )}>
                        {AVAILABLE_MODELS.map((m) => {
                          const active = selectedModelIds.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleModelToggle(m.id)}
                              className={cn(
                                "w-full text-left py-1.5 px-2.5 flex items-center justify-between rounded-lg transition-all duration-200 outline-none cursor-pointer",
                                active 
                                  ? activeBot
                                    ? `bg-${colorName}-50 hover:bg-${colorName}-100/60 text-${colorName}-950`
                                    : "bg-emerald-50 hover:bg-emerald-100/60 text-emerald-950"
                                  : "hover:bg-zinc-100 text-zinc-800"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all duration-300",
                                  active 
                                    ? theme.lightCheckboxActive
                                    : "border-zinc-300 bg-white"
                                )}>
                                  {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                                </div>
                                <div className="truncate">
                                  <span className={cn(
                                    "text-[10.5px] font-bold block truncate transition-colors duration-200",
                                    active 
                                      ? activeBot ? `text-${colorName}-950` : "text-emerald-950" 
                                      : "text-zinc-800"
                                  )}>{m.name}</span>
                                  <span className={cn(
                                    "text-[8.5px] font-mono tracking-wider block transition-colors duration-200",
                                    active 
                                      ? activeBot ? `text-${colorName}-700` : "text-emerald-700" 
                                      : "text-zinc-500"
                                  )}>{m.provider}</span>
                                </div>
                              </div>
                              {m.requiresKey && !keys[m.keyName] && !serverKeysStatus[m.keyName] ? (
                                <span className="text-[7px] bg-red-50 text-red-600 px-1 py-0.5 rounded border border-red-200 font-bold font-sans tracking-wide shrink-0">
                                  ⚠ KEY NEEDED
                                </span>
                              ) : m.requiresKey && serverKeysStatus[m.keyName] && !keys[m.keyName] ? (
                                <span className="text-[7.5px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-250 font-black font-sans tracking-tight shrink-0 flex items-center gap-0.5">
                                  ⚡ SERVER ACTIVE
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Persona system instruction and Provider Keys */}
                  <div className="space-y-4">
                    {/* Persona System Instruction */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-wider flex items-center gap-1 select-none transition-colors duration-300",
                          theme.lightLabel
                        )}>
                          <Brain className={cn("w-3.5 h-3.5 transition-colors duration-300", theme.lightAccentText)} />
                          <span>Arena-Wide Instructions (System Prompt)</span>
                        </label>
                        <span className={cn(
                          "text-[9px] font-semibold px-2 py-0.5 rounded-full border select-none transition-colors duration-300",
                          theme.lightActiveBadge
                        )}>
                          APP PRESET LIVE
                        </span>
                      </div>
                      <textarea
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        placeholder="E.g., You are a python genius. Answer logically with complete code blocks only..."
                        rows={3}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none transition-all placeholder-zinc-400 font-sans resize-y duration-300 focus:border-zinc-400 focus:bg-white"
                      />
                    </div>

                    {/* API Keys Configuration */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-wider flex items-center gap-1 select-none transition-colors duration-300",
                          theme.lightLabel
                        )}>
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Provider Custom API Credentials</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem('compare_key_gemini');
                            localStorage.removeItem('compare_key_openai');
                            localStorage.removeItem('compare_key_anthropic');
                            localStorage.removeItem('compare_key_groq');
                            localStorage.removeItem('compare_key_deepseek');
                            setKeys({
                              geminiKey: '',
                              openaiKey: '',
                              anthropicKey: '',
                              groqKey: '',
                              deepseekKey: ''
                            });
                            toast.success("Saved credentials cache cleared!");
                          }}
                          className="text-[9px] hover:text-white px-2 py-0.5 rounded transition-all duration-150 font-bold outline-none cursor-pointer border text-red-600 bg-red-50 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                        >
                          Clear All Keys
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-5 gap-2">
                        {[
                          { key: 'geminiKey' as const, label: 'Gemini', color: 'border-zinc-200 focus-within:border-zinc-400' },
                          { key: 'openaiKey' as const, label: 'OpenAI', color: 'border-zinc-200 focus-within:border-zinc-400' },
                          { key: 'anthropicKey' as const, label: 'Anthropic', color: 'border-zinc-200 focus-within:border-zinc-400' },
                          { key: 'groqKey' as const, label: 'Groq', color: 'border-zinc-200 focus-within:border-zinc-400' },
                          { key: 'deepseekKey' as const, label: 'DeepSeek', color: 'border-zinc-200 focus-within:border-zinc-400' },
                        ].map((field) => {
                          const hasKey = !!keys[field.key];
                          const isVisible = !!showKeys[field.key];
                          
                          return (
                            <div key={field.key} className={cn(
                              "border p-2 rounded-xl flex flex-col justify-between space-y-1.5 transition-all duration-300",
                              theme.lightApiCardBg
                            )}>
                              <div className="flex items-center justify-between min-w-0">
                                <span className="text-[9.5px] font-bold text-zinc-650 truncate select-none">{field.label}</span>
                                {serverKeysStatus[field.key] && !hasKey && (
                                  <span className="text-[7.5px] text-emerald-600 font-extrabold select-none uppercase tracking-tighter shrink-0 flex items-center gap-0.5 animate-pulse">
                                    ● Server
                                  </span>
                                )}
                              </div>
                              <div className={cn("flex items-center bg-white border rounded-lg px-2 py-1 grow-0 transition-all", field.color)}>
                                <input
                                  type={isVisible ? "text" : "password"}
                                  value={keys[field.key]}
                                  onChange={(e) => handleKeyChange(field.key, e.target.value)}
                                  placeholder={hasKey ? "Key Active" : serverKeysStatus[field.key] ? "Server Active" : "No Key"}
                                  className="w-full bg-transparent border-none text-[8.5px] text-zinc-800 outline-none placeholder-zinc-400 font-mono min-w-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowKeys(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                  className="text-zinc-400 hover:text-zinc-600 outline-none p-0.5 cursor-pointer shrink-0"
                                  title={isVisible ? "Hide Key" : "Show Key"}
                                >
                                  {isVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Ambient Liquid Glass Background Canvas */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" style={{ backgroundColor: '#f8fafc' }}>
            {/* Liquid glass floating organic blobs */}
            <motion.div
              animate={{
                x: [0, 80, -40, 0],
                y: [0, -100, 60, 0],
                scale: [1, 1.35, 0.85, 1],
                rotate: [0, 120, 240, 360],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 left-10 w-[450px] h-[450px] rounded-full blur-[110px]"
              style={{
                background: `radial-gradient(circle, ${getBackdropRgba(activeBot?.themeColor).replace('0.05', '0.34')} 0%, rgba(99, 102, 241, 0.06) 70%, transparent 100%)`
              }}
            />
            <motion.div
              animate={{
                x: [0, -90, 50, 0],
                y: [0, 80, -100, 0],
                scale: [1, 0.8, 1.2, 1],
                rotate: [360, 240, 120, 0],
              }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 right-10 w-[550px] h-[550px] rounded-full blur-[120px]"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(99, 102, 241, 0.08) 75%, transparent 100%)'
              }}
            />
            <motion.div
              animate={{
                x: [0, 50, -50, 0],
                y: [0, 60, 80, 0],
                scale: [0.9, 1.15, 0.8, 0.9],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[90px]"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.16) 0%, rgba(245, 158, 11, 0.12) 65%, transparent 100%)'
              }}
            />
            
            {/* Satin Sheen Reflection Layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/35 via-transparent to-white/45 opacity-90 mix-blend-overlay" />
            
            {/* Ultra-subtle wet gloss dynamic light line */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_42%,#ffffff_50%,transparent_58%)] opacity-[0.035] bg-[size:250%_250%] animate-[pulse_10s_infinite]" />
          </div>

          {/* Interactive Chat Logs Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-300 relative z-10 bg-transparent">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col justify-center py-6">
                
                {/* Landing welcome panel - Upgraded to modern responsive Glassmorphism */}
                <div className="relative overflow-hidden glass-effect rounded-3xl p-8 sm:p-12 text-center border border-indigo-100/50 max-w-2xl mx-auto flex flex-col items-center justify-center shadow-lg">
                  {/* Ambient background accent glow blobs */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className={cn(
                      "absolute -top-12 -left-12 w-44 h-44 rounded-full blur-[55px] opacity-20 transition-all",
                      activeBot ? theme.glow : "bg-indigo-500/20"
                    )} />
                    <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-[60px] opacity-20" />
                  </div>

                  <div className="relative z-10 space-y-5">
                    <div className={cn(
                      "inline-flex w-14 h-14 rounded-2xl items-center justify-center shadow-md border transition-all duration-300 transform hover:scale-105",
                      activeBot ? `${theme.badge} border-${colorName}-500/20` : "bg-indigo-50 border-indigo-100 text-indigo-600"
                    )}>
                      <Sparkles className={cn("w-7 h-7", activeBot ? theme.lightAccentText : "text-indigo-600")} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        {activeBot ? `Chat with ${activeBot.name}` : "Multimodal AI Comparison"}
                      </h2>
                      <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                        Ask a question and see how different leading language models process and respond to your query. Compare their responses side-by-side to find the best fit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid of suggest questions */}
                <div className="max-w-3xl mx-auto mt-8 px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {STARTER_PROMPTS.map((spr, si) => {
                    const StarterIcon = spr.icon;
                    return (
                      <button
                        key={si}
                        onClick={() => handleSendMessage(undefined, spr.body)}
                        className="p-5.5 rounded-2xl text-left border transition-all duration-300 group cursor-pointer relative shadow-sm border-slate-150 bg-white/70 hover:bg-white hover:border-indigo-400 hover:scale-[1.01] hover:shadow-md hover:shadow-indigo-500/5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={cn("text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-lg", spr.color)}>
                            {spr.badge}
                          </span>
                          <span className="w-6.5 h-6.5 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-150 transition-all text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600">
                            <StarterIcon className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{spr.title}</h4>
                        <p className="text-[11px] text-slate-550 group-hover:text-slate-700 mt-1 line-clamp-2 leading-relaxed font-semibold">
                          {spr.body}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              chatHistory.map((turn, i) => (
                <div key={turn.id || i} className="space-y-5">
                  
                  {/* User Speech Segment */}
                  {turn.sender === 'user' ? (
                    <div className="flex items-start justify-end gap-1.5 max-w-[85%] sm:max-w-[70%] ml-auto animate-fade-in relative group">
                      <div className={cn(
                        "rounded-[20px] rounded-br-[6px] px-5 py-3 text-[13px] sm:text-sm shadow-sm leading-relaxed select-text font-medium relative break-words w-auto min-w-[120px] max-w-full transition-all duration-300",
                        activeBot ? `${bubbleStyle.bubbleBg} text-white` : "bg-indigo-600 text-white"
                      )}>
                        
                        {/* Attachments rendering */}
                        {turn.attachments && turn.attachments.length > 0 && (
                          <div className="mb-2.5 flex flex-col gap-2 shrink-0 select-none max-w-sm pointer-events-auto">
                            {turn.attachments.map((attach) => (
                              <div key={attach.id} className={cn(
                                "flex items-center gap-2.5 p-2 rounded-xl text-xs text-zinc-100 border border-white/10 bg-white/10 transition-all duration-300 shadow-sm blur-0"
                              )}>
                                {attach.dataUrl ? (
                                  <img 
                                    src={attach.dataUrl} 
                                    alt={attach.name} 
                                    className="w-10 h-10 object-cover rounded shadow-sm border border-white/5" 
                                    referrerPolicy="no-referrer" 
                                  />
                                ) : (
                                  <FileText className="w-6 h-6 shrink-0 text-white/80" />
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-semibold truncate text-[11px] text-white">
                                    {attach.name}
                                  </div>
                                  <div className="text-[9px] text-white/50">
                                    {(attach.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content text */}
                        <div className="relative z-10 leading-snug whitespace-pre-wrap">{turn.content}</div>
                        {/* Embedded timestamp with checkmarks */}
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-white/60 font-mono select-none">
                          <span>{getFormattedTime(turn.timestamp)}</span>
                          <CheckCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    
                    /* AI Evaluation & Comparative Multitarget Output Thread */
                    <div className="space-y-5 animate-fade-in w-full max-w-7xl mx-auto">
                      
                      {/* SUB-WORKSPACE INTERACTIVE TABS */}
                      {(() => {
                        const currentTab = activeTurnTabs[turn.id] || 'grid';
                        const allowedModelIds = visibleModelFilters[turn.id] || turn.modelResponses?.map(r => r.modelId) || [];
                        const filteredResponses = turn.modelResponses?.filter(r => allowedModelIds.includes(r.modelId)) || [];
                        const modelResponses = turn.modelResponses || [];
                        
                        // Default chosen models for side-by-side split screen comparisons
                        const activeA = splitModelA[turn.id] || modelResponses[0]?.modelId || '';
                        const activeB = splitModelB[turn.id] || modelResponses[1]?.modelId || '';
                        const respA = modelResponses.find(r => r.modelId === activeA);
                        const respB = modelResponses.find(r => r.modelId === activeB);

                        return (
                          <div className="space-y-4">
                            
                            {/* Tabs Switcher Navigation Bar */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white/70 border border-slate-200/55 rounded-2xl shrink-0 shadow-sm backdrop-blur-md">
                              <div className="flex flex-wrap items-center gap-1.5 scrollbar-none w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => setActiveTurnTabs(p => ({ ...p, [turn.id]: 'grid' }))}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none cursor-pointer active:scale-95",
                                    currentTab === 'grid' 
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-indigo-600 text-white shadow-sm font-extrabold" 
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold"
                                  )}
                                >
                                  <span>📊 Comparison Grid</span>
                                  {filteredResponses.length < modelResponses.length && (
                                    <span className={cn(
                                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                                      activeBot ? theme.badge : "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    )}>
                                      {filteredResponses.length}/{modelResponses.length}
                                    </span>
                                  )}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => setActiveTurnTabs(p => ({ ...p, [turn.id]: 'advisor' }))}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none cursor-pointer active:scale-95",
                                    currentTab === 'advisor' 
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-indigo-600 text-white shadow-sm font-extrabold" 
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold"
                                  )}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                  <span>🤖 AI Suggestion Advisor</span>
                                </button>
 
                                <button
                                  type="button"
                                  onClick={() => setActiveTurnTabs(p => ({ ...p, [turn.id]: 'split' }))}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none cursor-pointer active:scale-95",
                                    currentTab === 'split' 
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-indigo-600 text-white shadow-sm font-extrabold" 
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold"
                                  )}
                                >
                                  <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>⚖️ Dual Split Workspace</span>
                                </button>
                              </div>

                              {/* Toggle board filter within Grid Tab */}
                              {currentTab === 'grid' && modelResponses.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                                  <span className="text-[10px] uppercase font-black text-slate-500 select-none mr-1">Choose Models:</span>
                                  {modelResponses.map(mr => {
                                    const isChecked = allowedModelIds.includes(mr.modelId);
                                    return (
                                      <button
                                        key={mr.modelId}
                                        type="button"
                                        onClick={() => {
                                          const next = isChecked 
                                            ? allowedModelIds.filter(id => id !== mr.modelId) 
                                            : [...allowedModelIds, mr.modelId];
                                          setVisibleModelFilters(p => ({ ...p, [turn.id]: next }));
                                        }}
                                        className={cn(
                                          "px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer active:scale-95",
                                          isChecked 
                                            ? activeBot ? `${theme.lightActiveBadge}` : "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                            : "bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-900 hover:border-slate-300"
                                        )}
                                        title={`Toggle ${mr.modelName}`}
                                      >
                                        {mr.modelName.replace("3.5", "").replace("3.1", "").replace("Chat", "")}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* TAB WORKSPACE CONTENT PANELS */}
                            {currentTab === 'grid' && (
                              <div className="space-y-4 animate-fade-in w-full">
                                
                                {/* If there are no results checked */}
                                {filteredResponses.length === 0 ? (
                                  <div className="p-12 text-center rounded-2xl border border-zinc-900 bg-zinc-950 w-full">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
                                    <h5 className="text-sm font-bold text-white">No Models Selected</h5>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">Please select at least one AI model from the switchboard helper above to inspect its comparative output result.</p>
                                    <button
                                      type="button"
                                      onClick={() => setVisibleModelFilters(p => ({ ...p, [turn.id]: modelResponses.map(r => r.modelId) }))}
                                      className={cn(
                                        "mt-4 px-3 py-1.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer",
                                        activeBot ? `${theme.bg} ${theme.hoverBg}` : "bg-indigo-650 hover:bg-indigo-550"
                                      )}
                                    >
                                      Display All Models
                                    </button>
                                  </div>
                                ) : (
                                  <div className={cn(
                                    "grid gap-4 transition-all duration-300 w-full",
                                    filteredResponses.length === 1 && "grid-cols-1 max-w-3xl mx-auto",
                                    filteredResponses.length === 2 && "grid-cols-1 md:grid-cols-2",
                                    filteredResponses.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                  )}>
                                    {filteredResponses.map((resp, idx) => {
                                      const isWinner = turn.evaluation?.winner?.modelId === resp.modelId || 
                                                       (turn.evaluation?.winner?.provider === resp.provider && 
                                                        AVAILABLE_MODELS.find(m => m.id === resp.modelId)?.modelId === turn.evaluation?.winner?.modelId);
                                      const isUserPreferred = preferredModels[turn.id] === resp.modelId;
                                      const responseKey = `${turn.id}-${resp.modelId}-${idx}`;
                                      const isCopied = !!copiedResponseIds[responseKey];

                                      const tagGroupColors = 
                                        resp.provider === 'gemini' ? 'text-blue-400' :
                                        resp.provider === 'openai' ? 'text-[#00a884]' :
                                        resp.provider === 'anthropic' ? 'text-orange-400' :
                                        resp.provider === 'groq' ? 'text-pink-400' :
                                        'text-cyan-400';

                                      return (
                                        <div 
                                          key={resp.modelId || idx}
                                          className={cn(
                                            "border rounded-[20px] rounded-tl-[6px] p-5 flex flex-col justify-between transition-all duration-350 shadow-sm group relative hover:-translate-y-0.5 text-slate-800 min-w-0 pb-28",
                                            cn(
                                              "bg-white/85 border-slate-200/60", 
                                              isUserPreferred && "border-amber-400 bg-amber-50/50 shadow-[0_4px_16px_rgba(245,158,11,0.04)]",
                                              (!isUserPreferred && isWinner) && "border-emerald-300 bg-emerald-50/50"
                                            )
                                          )}
                                        >
                                          
                                          <div className="relative z-10 w-full">
                                            
                                            {/* Card header */}
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5 shrink-0">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={cn(
                                                  "text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest font-mono shrink-0",
                                                  resp.provider === 'gemini' && "bg-blue-50 text-blue-600 border border-blue-200/60",
                                                  resp.provider === 'openai' && "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
                                                  resp.provider === 'anthropic' && "bg-orange-50 text-orange-600 border border-orange-200/60",
                                                  resp.provider === 'groq' && "bg-pink-50 text-pink-600 border border-pink-200/60",
                                                  resp.provider === 'deepseek' && "bg-cyan-50 text-cyan-600 border border-cyan-200/60"
                                                )}>
                                                  {resp.provider}
                                                </span>
                                                <h5 className={cn("text-xs font-extrabold truncate", tagGroupColors)} title={resp.modelName}>
                                                  {resp.modelName}
                                                </h5>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={() => copyToClipboard(resp.content, responseKey)}
                                                  title="Copy response body"
                                                  className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-all text-slate-500 cursor-pointer active:scale-95"
                                                >
                                                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                                
                                                {isUserPreferred && (
                                                  <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-amber-700 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                                    ⭐ CHOSEN BEST
                                                  </span>
                                                )}
                                                {!isUserPreferred && isWinner && (
                                                  <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-[#fafafa] bg-emerald-500 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                                    WINNER
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Card body markdown */}
                                            {resp.error ? (
                                              <div className="bg-red-50 text-red-700 text-[11px] p-2.5 rounded-xl border border-red-200/60 flex items-start gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                                <span className="font-mono">{resp.error}</span>
                                              </div>
                                            ) : (
                                              <div className="prose prose-xs max-w-none text-slate-700 text-xs overflow-x-hidden leading-relaxed break-words scrollbar-none font-sans select-text">
                                                <Markdown>{resp.content}</Markdown>
                                              </div>
                                            )}

                                          </div>

                                          {/* Embedded actions bar at bottom */}
                                          <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2.5 pt-2 border-t border-slate-150">
                                            
                                            {/* "Select as Preferred" interactive element */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPreferredModels(p => ({ ...p, [turn.id]: resp.modelId }));
                                                toast.success(`Chosen outcome: marked ${resp.modelName} as the preferred answer!`);
                                              }}
                                              className={cn(
                                                "w-full py-1.5 rounded-xl border text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center gap-1.5",
                                                isUserPreferred
                                                  ? "bg-amber-50 border-amber-300 text-amber-700"
                                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all font-bold"
                                              )}
                                            >
                                              <span>{isUserPreferred ? "★ Preferred Outcome Selected" : "☆ Choose Model Result as Best"}</span>
                                            </button>

                                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                                              <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-0.5">
                                                  <Clock className="w-2.5 h-2.5" /> {resp.latency ? `${(resp.latency / 1000).toFixed(2)}s` : 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-0.5">
                                                  <FileText className="w-2.5 h-2.5" /> {resp.wordCount || 0}w
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center gap-1 select-none pr-0.5">
                                                <span>{getFormattedTime(turn.timestamp)}</span>
                                                {isWinner ? (
                                                  <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                ) : (
                                                  <Check className="w-3 h-3" />
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {currentTab === 'advisor' && (
                              <div className="space-y-4 animate-fade-in max-w-4xl mx-auto w-full">
                                
                                {/* WINNER CARD PANEL */}
                                {turn.evaluation?.winner ? (
                                  <div className="rounded-2xl p-5 border shadow-sm bg-indigo-50/70 border-indigo-200/80 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border bg-indigo-100/60 border-indigo-200/60 text-indigo-600">
                                        <Trophy className="w-5 h-5 text-indigo-600 animate-bounce" />
                                      </div>
                                      <div>
                                        <span className="font-extrabold uppercase tracking-widest text-[9.5px] text-indigo-650 block">
                                          🏆 AI RECOMMENDED BEST MODEL
                                        </span>
                                        <h4 className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                                          <span>{turn.evaluation.winner.provider?.toUpperCase()}</span>
                                          <span className="text-xs text-slate-500">({turn.evaluation.winner.modelId})</span>
                                        </h4>
                                      </div>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pt-2 border-t border-indigo-100/60 font-semibold italic">
                                      "{turn.evaluation.winner.reason}"
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-8 text-center rounded-2xl bg-zinc-950/65 border border-zinc-900">
                                    <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                    <h5 className="text-sm font-bold text-zinc-300">Evaluating Multi-model Outputs</h5>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">AI is synthesizing metrics to declare the best response. Send a query first.</p>
                                  </div>
                                )}

                                {/* RATING SCORES METER GRID */}
                                {turn.evaluation?.ratings && turn.evaluation.ratings.length > 0 ? (
                                  <div className="bg-zinc-950/85 p-5 rounded-2xl border border-zinc-850 space-y-4">
                                    <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                      <span>Model Scorecard Synthesizer Matrix</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                      {turn.evaluation.ratings.map(rating => {
                                        const scorePercent = (rating.overallScore || 0) * 10;
                                        return (
                                          <div key={`${rating.provider}-${rating.modelId}`} className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-2.5">
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                <span className="font-extrabold text-zinc-100 truncate text-xs">{rating.provider.toUpperCase()} <span className="text-zinc-500 font-normal">({rating.modelId})</span></span>
                                              </div>
                                              <span className="font-mono text-xs text-indigo-400 font-extrabold">{rating.overallScore?.toFixed(1) || '0.0'} / 10.0</span>
                                            </div>

                                            {/* Progress meter */}
                                            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                                                style={{ width: `${scorePercent}%` }}
                                              />
                                            </div>

                                            {/* Scoring parameters breakdown */}
                                            <div className="grid grid-cols-3 gap-1 bg-zinc-950/20 p-2 rounded-lg text-[9px] font-mono text-zinc-400 text-center">
                                              <div>Tone: <span className="font-bold text-zinc-100">{rating.toneRating?.toFixed(1) || 'N/A'}</span></div>
                                              <div>Accuracy: <span className="font-bold text-zinc-100">{rating.qualityRating?.toFixed(1) || 'N/A'}</span></div>
                                              <div>Format: <span className="font-bold text-zinc-100">{rating.formatRating?.toFixed(1) || 'N/A'}</span></div>
                                            </div>

                                            {/* Dynamic Pros & Cons detailed lists */}
                                            <div className="grid grid-cols-1 gap-3 pt-2.5 border-t border-zinc-900/35">
                                              {rating.pros && rating.pros.length > 0 && (
                                                <div className="space-y-1">
                                                  <span className="text-[8px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1">🟢 Key Strengths</span>
                                                  <div className="flex flex-col gap-1 pl-1.5">
                                                    {rating.pros.map((p, pIdx) => (
                                                      <span key={pIdx} className="text-[10px] text-zinc-300 leading-normal block select-text">✦ {p}</span>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                              {rating.cons && rating.cons.length > 0 && (
                                                <div className="space-y-1 pt-1.5 border-t border-zinc-900/10">
                                                  <span className="text-[8px] font-extrabold uppercase text-red-400 tracking-wider flex items-center gap-1">🔴 Weakness / Cons</span>
                                                  <div className="flex flex-col gap-1 pl-1.5">
                                                    {rating.cons.map((c, cIdx) => (
                                                      <span key={cIdx} className="text-[10px] text-zinc-400 leading-normal block select-text">✦ {c}</span>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : null}

                                {/* SUMMARY TEXT BANNER */}
                                {turn.evaluation?.comparisonSummary && (
                                  <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-850 w-full">
                                    <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-indigo-400 block mb-1">Synthesizer Evaluation Summary</span>
                                    <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed select-text">{turn.evaluation.comparisonSummary}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {currentTab === 'split' && (
                              <div className="space-y-4 animate-fade-in w-full">
                                
                                {/* SELECTORS HEADBOARD */}
                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/70 p-4 rounded-2xl border border-slate-200/60 w-full shadow-sm backdrop-blur-md">
                                  <div className="flex flex-wrap items-center gap-3.5">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                      <span className="text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">Model A:</span>
                                      <select
                                        value={activeA}
                                        onChange={e => setSplitModelA(p => ({ ...p, [turn.id]: e.target.value }))}
                                        className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                                      >
                                        {modelResponses.map(r => (
                                          <option key={r.modelId} value={r.modelId} className="bg-white text-slate-700 font-bold">{r.modelName}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div className="text-slate-400 text-xs font-extrabold font-mono uppercase">VS</div>

                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                      <span className="text-[10px] font-extrabold tracking-wide text-indigo-600 uppercase">Model B:</span>
                                      <select
                                        value={activeB}
                                        onChange={e => setSplitModelB(p => ({ ...p, [turn.id]: e.target.value }))}
                                        className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                                      >
                                        {modelResponses.map(r => (
                                          <option key={r.modelId} value={r.modelId} className="bg-white text-slate-700 font-bold">{r.modelName}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Metric Deltas Box */}
                                  {respA && respB && (
                                    <div className="text-[10.5px] font-mono text-zinc-400 flex flex-wrap gap-x-4 gap-y-1.5 bg-zinc-950/25 p-2.5 rounded-xl border border-zinc-900/60 items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        <span>⏱️ Latency:</span> 
                                        <span className="text-zinc-100 font-bold">{respA.latency ? `${(respA.latency / 1000).toFixed(2)}s` : 'N/A'}</span> 
                                        <span className="text-zinc-650">vs</span> 
                                        <span className="text-[#00e676] font-bold">{respB.latency ? `${(respB.latency / 1000).toFixed(2)}s` : 'N/A'}</span>
                                      </div>
                                      <div className="w-[1px] h-3 bg-zinc-800 hidden sm:block" />
                                      <div className="flex items-center gap-1">
                                        <span>📝 Size:</span> 
                                        <span className="text-zinc-100 font-bold">{respA.wordCount || 0}w</span> 
                                        <span className="text-zinc-650">vs</span> 
                                        <span className="text-[#00e676] font-bold">{respB.wordCount || 0}w</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* REAL SPLIT VIEW PANELS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  
                                  {/* Model A Column */}
                                  {respA ? (
                                    <div className="bg-white/85 border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between relative text-slate-800 pb-24 backdrop-blur-md">
                                      <div className="w-full">
                                        <div className="flex items-center justify-between border-b border-zinc-900/40 pb-2.5 mb-3">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                            <span className="text-xs font-extrabold text-blue-400 truncate">{respA.modelName}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(respA.content, `${turn.id}-split-A`)}
                                              title="Copy Model A answer"
                                              className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            {preferredModels[turn.id] === respA.modelId && (
                                              <span className="text-[8px] bg-amber-500/95 border border-amber-400/20 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide shrink-0">PREFERRED</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="prose prose-xs text-xs text-slate-700 leading-relaxed font-sans max-w-none select-text">
                                          <Markdown>{respA.content}</Markdown>
                                        </div>
                                      </div>

                                      <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2 pt-2 border-t border-slate-150">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreferredModels(p => ({ ...p, [turn.id]: respA.modelId }));
                                            toast.success(`Marked ${respA.modelName} as preferred response!`);
                                          }}
                                          className={cn(
                                            "w-full py-1.5 rounded-xl border text-[9px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center gap-1.5",
                                            preferredModels[turn.id] === respA.modelId
                                              ? "bg-amber-50 border-amber-300 text-amber-700"
                                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all font-bold"
                                          )}
                                        >
                                          <span>{preferredModels[turn.id] === respA.modelId ? "★ Preferred Choice" : "Select as Best"}</span>
                                        </button>
                                        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                                          <span>Speed: {respA.latency ? `${(respA.latency / 1000).toFixed(2)}s` : 'N/A'}</span>
                                          <span>Count: {respA.wordCount || 0}w</span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-slate-50 border border-slate-200 text-slate-400 text-xs italic flex items-center justify-center p-8 rounded-2xl h-40">
                                      Please select Model A from options above.
                                    </div>
                                  )}

                                  {/* Model B Column */}
                                  {respB ? (
                                    <div className="bg-white/85 border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between relative text-slate-800 pb-24 backdrop-blur-md">
                                      <div className="w-full">
                                        <div className="flex items-center justify-between border-b border-zinc-900/40 pb-2.5 mb-3">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] shrink-0" />
                                            <span className="text-xs font-extrabold text-[#00a884] truncate">{respB.modelName}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(respB.content, `${turn.id}-split-B`)}
                                              title="Copy Model B answer"
                                              className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            {preferredModels[turn.id] === respB.modelId && (
                                              <span className="text-[8px] bg-amber-500/95 border border-amber-400/20 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide shrink-0">PREFERRED</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="prose prose-xs text-xs text-slate-700 leading-relaxed font-sans max-w-none select-text">
                                          <Markdown>{respB.content}</Markdown>
                                        </div>
                                      </div>

                                      <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2 pt-2 border-t border-slate-150">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreferredModels(p => ({ ...p, [turn.id]: respB.modelId }));
                                            toast.success(`Marked ${respB.modelName} as preferred response!`);
                                          }}
                                          className={cn(
                                            "w-full py-1.5 rounded-xl border text-[9px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center gap-1.5",
                                            preferredModels[turn.id] === respB.modelId
                                              ? "bg-amber-50 border-amber-300 text-amber-700"
                                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all font-bold"
                                          )}
                                        >
                                          <span>{preferredModels[turn.id] === respB.modelId ? "★ Preferred Choice" : "Select as Best"}</span>
                                        </button>
                                        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                                          <span>Speed: {respB.latency ? `${(respB.latency / 1000).toFixed(2)}s` : 'N/A'}</span>
                                          <span>Count: {respB.wordCount || 0}w</span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-slate-50 border border-slate-200 text-slate-400 text-xs italic flex items-center justify-center p-8 rounded-2xl h-40">
                                      Please select Model B from options above.
                                    </div>
                                  )}

                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Live Generation Column Skeletons */}
            {generating && (
              <div className="space-y-4">
                <div className="flex items-start justify-end gap-1.5 max-w-[85%] sm:max-w-[70%] ml-auto opacity-50 relative">
                  <div className="rounded-2xl rounded-tr-none px-4 py-2 text-xs shadow-md font-sans pr-14 pb-4.5 break-words w-auto text-white bg-[#005c4b]">
                    <span>Sending query to group...</span>
                  </div>
                </div>
                <div className={cn(
                  "grid gap-4",
                  selectedModelIds.length === 1 && "grid-cols-1 max-w-3xl",
                  selectedModelIds.length === 2 && "grid-cols-1 md:grid-cols-2",
                  selectedModelIds.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {AVAILABLE_MODELS.filter(m => selectedModelIds.includes(m.id)).map(m => (
                    <div key={m.id} className="border bg-zinc-900/65 border-zinc-850 rounded-2xl p-4 space-y-3 animate-pulse relative">
                      <div className="absolute top-0 -left-1 w-3.5 h-3.5 rotate-45 transform origin-top-left rounded-bl-sm bg-zinc-900" />
                      
                      <div className="flex justify-between pb-2 border-b border-zinc-805">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-3.5 bg-zinc-800/40 rounded" />
                          <div className="w-20 h-3.5 bg-zinc-800/40 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2 py-2">
                        <div className="h-3 bg-zinc-800/40 rounded w-[85%]" />
                        <div className="h-3 bg-zinc-800/40 rounded w-[95%]" />
                        <div className="h-3 bg-zinc-800/40 rounded w-[70%]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Messenger input form styled authentically natively (WhatsApp style) */}
          <form 
            onSubmit={(e) => handleSendMessage(e)} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "p-4 shrink-0 relative overflow-visible z-20 transition-all duration-200 border-t",
              activeBot ? "bg-white border-slate-200/80 shadow-md" : "bg-[#f8fafc]/95 border-slate-200/80 backdrop-blur-md shadow-sm",
              isDragging 
                ? activeBot ? `border-${colorName}-400 bg-slate-50` : "border-indigo-400 bg-slate-50"
                : "",
              attachments.length > 0 ? "pb-5" : ""
            )}
          >
            {activeBot && (
              <div className={cn("absolute inset-0 opacity-[0.03] pointer-events-none", theme.glow)} />
            )}
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange} 
            />

            {/* Selected media/file attachments list */}
            {attachments.length > 0 && (
              <div className="max-w-5xl mx-auto mb-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-wrap gap-2 animate-fade-in shadow-inner max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-250 pointer-events-auto">
                {attachments.map((attach) => (
                  <div 
                    key={attach.id} 
                    className="relative group flex items-center gap-2 bg-white border border-slate-200 pl-2.5 pr-8 py-1.5 rounded-xl text-xs text-slate-700 max-w-[200px] select-none hover:border-slate-350 transition-colors"
                  >
                    {attach.dataUrl ? (
                      <img 
                        src={attach.dataUrl} 
                        alt={attach.name} 
                        className="w-6 h-6 object-cover rounded border border-slate-200" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <FileText className={cn("w-5 h-5 shrink-0", activeBot ? theme.lightAccentText : "text-indigo-500")} />
                    )}
                    <span className="truncate pr-1 font-semibold">{attach.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== attach.id))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer active:scale-95 outline-none"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3 max-w-5xl mx-auto">
              {/* Upgraded Modern High-Contrast Input Bar */}
              <div className="flex-1 flex items-end bg-white border border-slate-250 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 rounded-2xl px-5 py-2.5 flex-row min-w-0 transition-all shadow-sm">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-slate-700 mr-3 mb-1 hover:scale-105 active:scale-95 cursor-pointer shrink-0 outline-none transition-transform" 
                  title="Attach media files (Drag & Drop also supported)"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
                <textarea
                  ref={textareaRef}
                  disabled={generating}
                  placeholder={isDragging ? "Drop your files here!" : "Type a message comparing multiple AI models..."}
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                  className="flex-1 bg-transparent py-0.5 text-sm text-slate-800 outline-none placeholder-slate-450 disabled:opacity-50 min-w-0 font-medium resize-none overflow-y-auto"
                />
              </div>

              {/* Instant Prompt Rephrase & AI Prompt Generator Hub */}
              <div id="prompt-generator-wrapper" className="relative shrink-0 flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={handleRephrasePrompt}
                  disabled={isRephrasing}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm shrink-0 border outline-none",
                    isRephrasing 
                      ? "bg-amber-50/50 text-amber-600 border-amber-300 animate-pulse" 
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-amber-600 hover:text-amber-700 disabled:opacity-40 cursor-pointer"
                  )}
                  title="Enhance prompt with AI"
                >
                  <Sparkles className={cn("w-4.5 h-4.5", isRephrasing && "animate-spin")} />
                </button>
              </div>
              
              {/* Send button styled authentically as a circle */}
              <button
                type="submit"
                disabled={(!inputMessage.trim() && attachments.length === 0) || generating}
                className={cn(
                  "mb-1 w-11 h-11 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 disabled:shadow-none relative z-10",
                  activeBot 
                    ? `${theme.bg} ${theme.hoverBg} disabled:bg-slate-100 disabled:text-slate-400` 
                    : "bg-[#00a884] hover:bg-[#00c99e] disabled:bg-slate-100 disabled:text-slate-400"
                )}
                title={inputMessage.trim() || attachments.length > 0 ? "Send message to models" : "Microphone input (mocked)"}
              >
                {inputMessage.trim() || attachments.length > 0 ? (
                  <Send className="w-4.5 h-4.5" />
                ) : (
                  <Mic className="w-4.5 h-4.5 text-slate-400" />
                )}
              </button>
            </div>
            
            {/* Auxiliary Info label */}
            <div className={cn(
              "flex items-center justify-between mt-2 max-w-5xl mx-auto px-4 text-[9px] uppercase tracking-wider font-extrabold select-none relative z-10",
              activeBot ? theme.lightAccentText : "text-[#00a884]"
            )}>
              <span className="flex items-center gap-1">
                <Sparkles className={cn("w-3 h-3", activeBot ? theme.lightAccentText : "text-emerald-600")} />
                <span>Broadcasting live to {selectedModelIds.length} model channels</span>
              </span>
              <span className="text-slate-400 font-mono tracking-widest uppercase">Enter to sendMessage</span>
            </div>
          </form>

        </div>
      </div>

      {/* Slide-out Prompt Optimizer Panel */}
      <AnimatePresence>
        {isPromptOptimizerOpen && (
          <PromptOptimizer
            initialPrompt={inputMessage}
            onApplyPrompt={(optimizedText) => {
              setInputMessage(optimizedText);
              setIsPromptOptimizerOpen(false);
              toast.success("Optimized prompt applied successfully to draft input field!");
            }}
            onClose={() => setIsPromptOptimizerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
