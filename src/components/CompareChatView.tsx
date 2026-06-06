import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot as BotIcon, 
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
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';

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

  const [isInstructionEditing, setIsInstructionEditing] = useState<boolean>(false);

  // Local storage credentials
  const [keys, setKeys] = useState({
    geminiKey: localStorage.getItem('compare_key_gemini') || '',
    openaiKey: localStorage.getItem('compare_key_openai') || '',
    anthropicKey: localStorage.getItem('compare_key_anthropic') || '',
    groqKey: localStorage.getItem('compare_key_groq') || '',
    deepseekKey: localStorage.getItem('compare_key_deepseek') || '',
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isKeysConfigOpen, setIsKeysConfigOpen] = useState(false);
  const [copiedResponseIds, setCopiedResponseIds] = useState<Record<string, boolean>>({});
  
  const [isModelChooserCollapsed, setIsModelChooserCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPromptGeneratorOpen, setIsPromptGeneratorOpen] = useState(false);
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
    <div className="w-full h-full flex bg-[#050505] animate-fade-in font-sans overflow-hidden relative">
      
      {/* Mobile Sidebar Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-20 transition-opacity animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat History Sidebar */}
      <div className={cn(
        "bg-[#111b21] border-r border-[#222e35] h-full flex flex-col transition-all duration-300 shrink-0 z-30",
        // Desktop responsive:
        isSidebarOpen ? "md:w-[280px]" : "md:w-0 md:overflow-hidden md:border-r-0",
        // Mobile responsive absolute slide-out drawer:
        "fixed md:static inset-y-0 left-0 w-[280px]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#222e35] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00e676]" />
            <span className="font-extrabold text-[#fafafa] tracking-widest text-[10.5px] uppercase select-none">
              Chat History
            </span>
          </div>
          {/* Mobile close button */}
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-zinc-450 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-[#222e35]/30">
          <button
            type="button"
            onClick={handleAddNewSession}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/15 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] select-none cursor-pointer"
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
                    ? activeBot ? `bg-[#202c33] border-l-2 border-${colorName}-500 text-white font-semibold` : "bg-[#202c33] border-l-2 border-[#00a884] text-white font-semibold" 
                    : "hover:bg-[#202c33]/40 text-zinc-400 hover:text-zinc-200"
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
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-xs text-white max-w-[170px] outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSessionTitle(session.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-[#111b21] cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSessionId(null)}
                      className="p-1 text-zinc-400 hover:text-zinc-350 rounded hover:bg-[#111b21] cursor-pointer"
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
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                        title="Rename Chat"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 cursor-pointer"
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
            "p-3.5 border-b flex items-center justify-between text-white shrink-0 shadow-sm relative overflow-hidden transition-all duration-300",
            activeBot ? `bg-[#121c22]/95 border-${colorName}-500/10` : "bg-[#202c33] border-[#222e35]"
          )}>
            {activeBot && (
              <div className={cn("absolute inset-0 opacity-[0.06] pointer-events-none", theme.glow)} />
            )}
            <div className="flex items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850/60 transition-colors cursor-pointer shrink-0"
                title="Toggle Sidebar History"
              >
                <Menu className={cn("w-5 h-5", activeBot ? theme.text : "text-emerald-400")} />
              </button>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[#fafafa] relative shadow-md shrink-0 transition-all",
                activeBot ? theme.bg : "bg-[#00a884]"
              )}>
                <GitCompare className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 rounded-full border-inherit" title="Live Arena Connected" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-xs">
                  <span>{activeSession.title || 'General Q&A'}</span>
                </h4>
                <p className="text-[11px] flex items-center gap-1 opacity-90 font-medium select-none">
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0", activeBot ? theme.glow : "bg-[#00e676]")} />
                  <span className={activeBot ? theme.text : "text-[#00e676]"}>{selectedModelIds.length} models responding live</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              {chatHistory.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  {isConfirmingClear ? (
                    <div className="flex items-center gap-2 bg-red-950/40 px-2.5 py-1.5 rounded-xl border border-red-900/40 animate-fade-in">
                      <span className="text-[10px] text-red-300 font-semibold select-none mr-1">Reset?</span>
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
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-[#2a2a2a] text-zinc-300 font-medium text-[10px] rounded cursor-pointer transition-colors outline-none"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-trigger-reset-chat"
                      onClick={handleClearChat}
                      className="px-3 py-1.5 bg-red-950/25 border border-red-550 text-red-400 hover:bg-red-950/45 hover:text-red-300 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold transition-all cursor-pointer active:scale-[0.98] shadow-md shadow-red-950/30 select-none outline-none ring-1 ring-red-500/30"
                      title="Reset Comparative Playground"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Reset Chat</span>
                    </button>
                  )}
                </div>
              )}

              <button 
                onClick={() => {
                  setIsInstructionEditing(!isInstructionEditing);
                  setIsKeysConfigOpen(false);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-bold border transition-all cursor-pointer active:scale-95 select-none relative z-10",
                  isInstructionEditing 
                    ? activeBot ? `${theme.badge} border-${colorName}-500/25` : "bg-[#00a884]/15 border-[#00a884]/40 text-[#00e676]" 
                    : "bg-zinc-850/40 border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white"
                )}
                title="Customize default workspace system instruction for LLM Arena"
              >
                <Brain className="w-3.5 h-3.5 text-[#00e676]" />
                <span>Configure Persona Prompt</span>
                {isInstructionEditing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button 
                onClick={() => {
                  setIsKeysConfigOpen(!isKeysConfigOpen);
                  setIsInstructionEditing(false);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-bold border transition-all cursor-pointer active:scale-95 select-none relative z-10",
                  isKeysConfigOpen 
                    ? activeBot ? `${theme.badge} border-${colorName}-500/25` : "bg-amber-500/15 border-amber-500/40 text-amber-300" 
                    : "bg-zinc-850/40 border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white"
                )}
                title="Configure custom Provider credentials side-by-side"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Configure API Keys</span>
                {isKeysConfigOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Expandable Workspace System instruction drawer */}
          <AnimatePresence>
            {isInstructionEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#111b21] border-b border-[#222e35] p-4 space-y-2.5 overflow-hidden shrink-0 shadow-lg z-10"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn("w-4 h-4", activeBot ? theme.text : "text-[#00e676]")} />
                    <h5 className="text-[11px] font-extrabold text-zinc-200 uppercase tracking-widest">Arena-Wide System Prompt Instructions</h5>
                  </div>
                  <span className={cn(
                    "text-[9px] font-semibold px-2 py-0.5 rounded-full select-none border",
                    activeBot 
                      ? `${theme.badge} border-${colorName}-500/20` 
                      : "text-[#00a884] bg-[#00a884]/10 border border-[#00a884]/20"
                  )}>
                    APP-WIDE PRESET
                  </span>
                </div>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder="E.g., You are a strict Python expert. Review logic and answer only in complete code..."
                  rows={2}
                  className={cn(
                    "w-full bg-[#202c33] border rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none transition-all placeholder-zinc-700 text-left font-sans resize-y",
                    activeBot ? `border-zinc-800/80 focus:border-${colorName}-500` : "border-zinc-800/80 focus:border-[#00a884]"
                  )}
                />
                <p className="text-[10px] text-zinc-500 italic">This instruction is injected live across all selected LLMs during comparative evaluations. Does not change your saved bot assistant configuration files.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expandable API Keys Configuration drawer */}
          <AnimatePresence>
            {isKeysConfigOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#111b21] border-b border-[#222e35] p-5 space-y-4 overflow-hidden shrink-0 shadow-lg z-10 text-white relative px-5 py-5"
              >
                {/* Visual grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-extrabold text-[#fafafa] uppercase tracking-widest flex items-center gap-1.5 font-sans">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      <span>Custom API Keys Settings</span>
                    </h5>
                    <p className="text-[10.5px] text-zinc-400">Keys are saved locally in your browser sandbox. Leave a field blank to route via the secure backend defaults.</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                    <span className="text-[9px] bg-emerald-500/10 text-[#00e676] border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full select-none">
                      🔒 SECURE END-TO-END
                    </span>
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
                        toast.success("All locally cached provider keys cleared!");
                      }}
                      className="text-[9px] text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 px-2.5 py-1 rounded duration-150 transition-all cursor-pointer font-bold outline-none"
                    >
                      Clear All Keys
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
                  {[
                    { key: 'geminiKey' as const, label: 'Gemini AI', desc: 'Google Cloud Platform', color: 'border-cyan-500/20 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30' },
                    { key: 'openaiKey' as const, label: 'OpenAI', desc: 'GPT models', color: 'border-[#00a884]/20 focus-within:border-[#00a884]/70 focus-within:ring-1 focus-within:ring-[#00a884]/30' },
                    { key: 'anthropicKey' as const, label: 'Anthropic', desc: 'Claude models', color: 'border-orange-500/20 focus-within:border-orange-500/70 focus-within:ring-1 focus-within:ring-orange-500/30' },
                    { key: 'groqKey' as const, label: 'Groq Cloud', desc: 'Llama models', color: 'border-pink-500/20 focus-within:border-pink-500/70 focus-within:ring-1 focus-within:ring-pink-500/30' },
                    { key: 'deepseekKey' as const, label: 'DeepSeek', desc: 'Analytical DeepSeek V3', color: 'border-indigo-500/20 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30' },
                  ].map((field) => {
                    const hasKey = !!keys[field.key];
                    const isVisible = !!showKeys[field.key];
                    
                    return (
                      <div key={field.key} className="bg-[#1e2a30]/65 border border-[#2c3d46]/75 hover:border-zinc-700/60 p-3 rounded-2xl space-y-2 transition-all">
                        <div className="flex items-center justify-between min-w-0">
                          <div>
                            <span className="text-[10.5px] font-extrabold text-zinc-150 block">{field.label}</span>
                            <span className="text-[9px] text-zinc-500 block leading-tight">{field.desc}</span>
                          </div>
                          
                          <span className={cn(
                            "text-[8.5px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-tight",
                            hasKey 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                              : "bg-[#202c33]/80 text-zinc-550 border border-transparent"
                          )}>
                            {hasKey ? "CUSTOM" : "SYSTEM DEFAULT"}
                          </span>
                        </div>
                        
                        <div className={cn("flex items-center gap-1.5 bg-[#202c33] border rounded-xl px-2.5 py-1.5 shadow-inner grow transition-all duration-300", field.color)}>
                          <input
                            type={isVisible ? "text" : "password"}
                            value={keys[field.key]}
                            onChange={(e) => handleKeyChange(field.key, e.target.value)}
                            placeholder={hasKey ? "•••••••••••••••••" : "Using system config..."}
                            className="flex-1 bg-transparent border-none text-[10px] text-zinc-150 outline-none placeholder-zinc-650 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeys(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                            className="text-zinc-500 hover:text-zinc-300 shortcut outline-none p-0.5 cursor-pointer shrink-0"
                            title={isVisible ? "Hide API Key" : "Show API Key"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Chat Logs Area with WhatsApp Wallpaper pattern */}
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 relative bg-[#0b141a]"
            style={{
              backgroundImage: `radial-gradient(circle at 10% 20%, ${getBackdropRgba(activeBot?.themeColor)} 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.02) 0%, transparent 60%)`,
              backgroundColor: '#0b141a'
            }}
          >
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col justify-center py-6">
                
                {/* Landing welcome panel */}
                <div className="text-center p-4 max-w-2xl mx-auto space-y-4">
                  <div className={cn(
                    "inline-flex w-12 h-12 rounded-2xl items-center justify-center shadow-md border",
                    activeBot ? `${theme.badge} border-${colorName}-500/20` : "bg-emerald-500/10 border-emerald-500/20"
                  )}>
                    <Sparkles className={cn("w-6 h-6", activeBot ? theme.text : "text-[#00a884]")} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#fafafa] tracking-tight">AI Group Chat comparative Arena</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Observe performance differences between model sets live. Select your active models above and send a message.
                    </p>
                  </div>
                </div>

                {/* Grid of suggest questions */}
                <div className="max-w-3xl mx-auto mt-8 px-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {STARTER_PROMPTS.map((spr, si) => {
                    const StarterIcon = spr.icon;
                    return (
                      <button
                        key={si}
                        onClick={() => handleSendMessage(undefined, spr.body)}
                        className="p-4 rounded-2xl text-left border transition-all duration-300 group cursor-pointer relative shadow-sm border-zinc-800 bg-[#111b21]/65 hover:bg-[#202c33]/70 hover:border-emerald-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn("text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-lg", spr.color)}>
                            {spr.badge}
                          </span>
                          <span className="w-6 h-6 rounded-lg bg-zinc-900/80 flex items-center justify-center border transition-all text-zinc-500 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400">
                            <StarterIcon className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{spr.title}</h4>
                        <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
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
                  
                  {/* User Speech Segment (Styled like right-aligned WhatsApp chat bubble) */}
                  {turn.sender === 'user' ? (
                    <div className="flex items-start justify-end gap-1.5 max-w-[85%] sm:max-w-[70%] ml-auto animate-fade-in relative">
                      <div className={cn(
                        "rounded-2xl rounded-tr-none px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed select-text font-sans relative pr-14 pb-4.5 break-words w-auto min-w-[120px] max-w-full text-white border-l-4 transition-all duration-300",
                        activeBot ? `${bubbleStyle.bubbleBg} ${bubbleStyle.bubbleBorder}` : "bg-[#005c4b]/95 border-[#00a884]/30"
                      )}>
                        {/* Rotated bubble corner tail */}
                        <div className={cn(
                          "absolute top-0 -right-1 w-3.5 h-3.5 rotate-45 transform origin-top-right rounded-br-sm -z-0 transition-colors duration-300",
                          activeBot ? bubbleStyle.bubbleTail : "bg-[#005c4b]"
                        )} />
                        
                        {/* Attachments rendering */}
                        {turn.attachments && turn.attachments.length > 0 && (
                          <div className="mb-2.5 flex flex-col gap-2 shrink-0 select-none max-w-sm pointer-events-auto">
                            {turn.attachments.map((attach) => (
                              <div key={attach.id} className={cn(
                                "flex items-center gap-2.5 p-2 rounded-xl text-xs text-zinc-100 shadow-sm border transition-all duration-300",
                                activeBot ? `${bubbleStyle.attachBg} ${bubbleStyle.attachBorder}` : "bg-[#00483a] border-[#00705a]/45"
                              )}>
                                {attach.dataUrl ? (
                                  <img 
                                    src={attach.dataUrl} 
                                    alt={attach.name} 
                                    className={cn(
                                      "w-10 h-10 object-cover rounded border transition-colors duration-300",
                                      activeBot ? bubbleStyle.attachBorder : "border-[#005c4b]"
                                    )} 
                                    referrerPolicy="no-referrer" 
                                  />
                                ) : (
                                  <FileText className={cn("w-6 h-6 shrink-0 transition-colors duration-300", activeBot ? bubbleStyle.fileText : "text-emerald-400")} />
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-bold truncate text-[11px] text-white">
                                    {attach.name}
                                  </div>
                                  <div className="text-[9px] text-zinc-300">
                                    {(attach.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content text */}
                        <span className="relative z-10 leading-snug">{turn.content}</span>
                        {/* Embedded timestamp with checkmarks */}
                        <span className="absolute bottom-1 right-2 text-[9px] text-zinc-100/70 font-mono select-none flex items-center gap-1">
                          <span>{getFormattedTime(turn.timestamp)}</span>
                          <CheckCheck className={cn("w-3.5 h-3.5 transition-colors duration-300", activeBot ? bubbleStyle.checkColor : "text-[#53bdeb]")} />
                        </span>
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#1e2a30] border border-[#2c3d46] rounded-2xl shrink-0 shadow-sm">
                              <div className="flex flex-wrap items-center gap-1.5 scrollbar-none w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => setActiveTurnTabs(p => ({ ...p, [turn.id]: 'grid' }))}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none cursor-pointer active:scale-95",
                                    currentTab === 'grid' 
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-[#00a884] text-white shadow-sm font-extrabold" 
                                      : "text-zinc-300 hover:text-white hover:bg-[#202c33]/60 font-semibold"
                                  )}
                                >
                                  <span>📊 Comparison Grid</span>
                                  {filteredResponses.length < modelResponses.length && (
                                    <span className={cn(
                                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                                      activeBot ? theme.badge : "bg-emerald-500/20 text-emerald-400"
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
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-[#00a884] text-white shadow-sm font-extrabold" 
                                      : "text-zinc-300 hover:text-white hover:bg-[#202c33]/60 font-semibold"
                                  )}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>🤖 AI Suggestion Advisor</span>
                                </button>
 
                                <button
                                  type="button"
                                  onClick={() => setActiveTurnTabs(p => ({ ...p, [turn.id]: 'split' }))}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none cursor-pointer active:scale-95",
                                    currentTab === 'split' 
                                      ? activeBot ? `${theme.bg} text-white shadow-sm font-extrabold` : "bg-[#00a884] text-white shadow-sm font-extrabold" 
                                      : "text-zinc-300 hover:text-white hover:bg-[#202c33]/60 font-semibold"
                                  )}
                                >
                                  <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                                  <span>⚖️ Dual Split Workspace</span>
                                </button>
                              </div>

                              {/* Toggle board filter within Grid Tab */}
                              {currentTab === 'grid' && modelResponses.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                                  <span className="text-[10px] uppercase font-black text-zinc-350 select-none mr-1">Choose Models:</span>
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
                                            ? activeBot ? `${theme.badge} border-${colorName}-500/25` : "bg-[#005c4b]/30 border-[#00a884]/45 text-[#00e676]" 
                                            : "bg-[#202c33]/65 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
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
                                  <div className="p-12 text-center rounded-2xl border border-zinc-900 bg-[#111b21] w-full">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
                                    <h5 className="text-sm font-bold text-white">No Models Selected</h5>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">Please select at least one AI model from the switchboard helper above to inspect its comparative output result.</p>
                                    <button
                                      type="button"
                                      onClick={() => setVisibleModelFilters(p => ({ ...p, [turn.id]: modelResponses.map(r => r.modelId) }))}
                                      className={cn(
                                        "mt-4 px-3 py-1.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer",
                                        activeBot ? `${theme.bg} ${theme.hoverBg}` : "bg-[#00a884] hover:bg-[#00c99e]"
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
                                            "border rounded-2xl p-4 flex flex-col justify-between transition-all duration-350 shadow-md group relative hover:-translate-y-0.5 text-white min-w-0 pr-4 pb-24",
                                            cn(
                                              "bg-[#202c33] border-zinc-900/60", 
                                              isUserPreferred && "border-amber-500/40 bg-[#25241b] shadow-[0_4px_16px_rgba(245,158,11,0.04)]",
                                              (!isUserPreferred && isWinner) && "border-emerald-500/40 bg-[#112320]"
                                            )
                                          )}
                                        >
                                          
                                          {/* Speech bubble pointer */}
                                          <div className={cn(
                                            "absolute top-0 -left-1 w-3.5 h-3.5 rotate-45 transform origin-top-left rounded-bl-sm -z-0",
                                            isUserPreferred ? "bg-[#25241b]" : (isWinner ? "bg-[#112320]" : "bg-[#202c33]")
                                          )} />

                                          <div className="relative z-10 w-full">
                                            
                                            {/* Card header */}
                                            <div className="flex items-center justify-between border-b border-zinc-900/40 pb-2.5 mb-3.5 shrink-0">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={cn(
                                                  "text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest font-mono shrink-0",
                                                  resp.provider === 'gemini' && "bg-blue-500/10 text-blue-400 border border-blue-500/15",
                                                  resp.provider === 'openai' && "bg-emerald-500/10 text-[#00a884] border border-emerald-500/15",
                                                  resp.provider === 'anthropic' && "bg-orange-500/10 text-orange-400 border border-orange-500/15",
                                                  resp.provider === 'groq' && "bg-pink-500/10 text-pink-400 border border-pink-500/15",
                                                  resp.provider === 'deepseek' && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
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
                                                  className="p-1 rounded bg-zinc-950/40 border border-zinc-900 hover:bg-zinc-900/60 hover:text-white transition-all text-zinc-400 cursor-pointer active:scale-95"
                                                >
                                                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                                
                                                {isUserPreferred && (
                                                  <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-amber-400 bg-amber-950 border border-amber-500/20 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                                    ⭐ CHOSEN BEST
                                                  </span>
                                                )}
                                                {!isUserPreferred && isWinner && (
                                                  <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-[#fafafa] bg-emerald-500/90 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                                    WINNER
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Card body markdown */}
                                            {resp.error ? (
                                              <div className="bg-red-950/20 text-red-400 text-[11px] p-2.5 rounded-xl border border-red-500/10 flex items-start gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                                <span className="font-mono">{resp.error}</span>
                                              </div>
                                            ) : (
                                              <div className="prose prose-invert prose-xs max-w-none text-zinc-300 text-xs overflow-x-hidden leading-relaxed break-words scrollbar-none font-sans select-text">
                                                <Markdown>{resp.content}</Markdown>
                                              </div>
                                            )}

                                          </div>

                                          {/* Embedded actions bar at bottom */}
                                          <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2.5 pt-2 border-t border-zinc-900/35">
                                            
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
                                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                                  : "bg-zinc-950/15 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                                              )}
                                            >
                                              <span>{isUserPreferred ? "★ Preferred Outcome Selected" : "☆ Choose Model Result as Best"}</span>
                                            </button>

                                            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
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
                                                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
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
                                  <div className="rounded-2xl p-5 border shadow-md bg-[#182229] border-emerald-500/25 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border bg-[#005c4b]/30 border-emerald-500/30 text-[#00a884]">
                                        <Trophy className="w-5 h-5 text-emerald-400 animate-bounce" />
                                      </div>
                                      <div>
                                        <span className="font-extrabold uppercase tracking-widest text-[9.5px] text-[#00e676] block">
                                          🏆 AI RECOMMENDED BEST MODEL
                                        </span>
                                        <h4 className="text-white font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                                          <span>{turn.evaluation.winner.provider?.toUpperCase()}</span>
                                          <span className="text-xs text-zinc-400">({turn.evaluation.winner.modelId})</span>
                                        </h4>
                                      </div>
                                    </div>
                                    <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed pt-2 border-t border-zinc-800/40 italic">
                                      "{turn.evaluation.winner.reason}"
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-8 text-center rounded-2xl bg-[#111b21] border border-zinc-850">
                                    <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                    <h5 className="text-sm font-bold text-zinc-300">Evaluating Multi-model Outputs</h5>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">AI is synthesizing metrics to declare the best response. Send a query first.</p>
                                  </div>
                                )}

                                {/* RATING SCORES METER GRID */}
                                {turn.evaluation?.ratings && turn.evaluation.ratings.length > 0 ? (
                                  <div className="bg-[#111b21] p-5 rounded-2xl border border-zinc-850 space-y-4">
                                    <h4 className="text-xs font-extrabold text-[#00a884] uppercase tracking-widest flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                      <span>Model Scorecard Synthesizer Matrix</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                      {turn.evaluation.ratings.map(rating => {
                                        const scorePercent = (rating.overallScore || 0) * 10;
                                        return (
                                          <div key={`${rating.provider}-${rating.modelId}`} className="bg-[#202c33]/50 p-4 rounded-xl border border-zinc-850 space-y-2.5">
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span className="font-extrabold text-zinc-100 truncate text-xs">{rating.provider.toUpperCase()} <span className="text-zinc-500 font-normal">({rating.modelId})</span></span>
                                              </div>
                                              <span className="font-mono text-xs text-[#00e676] font-extrabold">{rating.overallScore?.toFixed(1) || '0.0'} / 10.0</span>
                                            </div>

                                            {/* Progress meter */}
                                            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00a884] transition-all duration-300"
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
                                  <div className="bg-[#111b21] p-5 rounded-2xl border border-zinc-850 w-full">
                                    <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-[#00a884] block mb-1">Synthesizer Evaluation Summary</span>
                                    <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed select-text">{turn.evaluation.comparisonSummary}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {currentTab === 'split' && (
                              <div className="space-y-4 animate-fade-in w-full">
                                
                                {/* SELECTORS HEADBOARD */}
                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111b21] p-4 rounded-2xl border border-zinc-850 w-full">
                                  <div className="flex flex-wrap items-center gap-3.5">
                                    <div className="flex items-center gap-2 bg-[#202c33] px-3 py-1.5 rounded-xl border border-zinc-800">
                                      <span className="text-[10px] font-extrabold tracking-wide text-zinc-450 uppercase">Model A:</span>
                                      <select
                                        value={activeA}
                                        onChange={e => setSplitModelA(p => ({ ...p, [turn.id]: e.target.value }))}
                                        className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
                                      >
                                        {modelResponses.map(r => (
                                          <option key={r.modelId} value={r.modelId} className="bg-[#111b21] text-zinc-200 font-bold">{r.modelName}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div className="text-zinc-650 text-xs font-extrabold font-mono uppercase">VS</div>

                                    <div className="flex items-center gap-2 bg-[#202c33] px-3 py-1.5 rounded-xl border border-zinc-800">
                                      <span className="text-[10px] font-extrabold tracking-wide text-[#00a884] uppercase">Model B:</span>
                                      <select
                                        value={activeB}
                                        onChange={e => setSplitModelB(p => ({ ...p, [turn.id]: e.target.value }))}
                                        className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
                                      >
                                        {modelResponses.map(r => (
                                          <option key={r.modelId} value={r.modelId} className="bg-[#111b21] text-zinc-200 font-bold">{r.modelName}</option>
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
                                    <div className="bg-[#202c33] border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between relative text-white pb-24">
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
                                              className="p-1 rounded bg-zinc-950/45 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            {preferredModels[turn.id] === respA.modelId && (
                                              <span className="text-[8px] bg-amber-500/95 border border-amber-400/20 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide shrink-0">PREFERRED</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="prose prose-invert prose-xs text-xs text-zinc-300 leading-relaxed font-sans max-w-none select-text">
                                          <Markdown>{respA.content}</Markdown>
                                        </div>
                                      </div>

                                      <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2 pt-2 border-t border-zinc-900/20">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreferredModels(p => ({ ...p, [turn.id]: respA.modelId }));
                                            toast.success(`Marked ${respA.modelName} as preferred response!`);
                                          }}
                                          className={cn(
                                            "w-full py-1.5 rounded-xl border text-[9px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center gap-1.5",
                                            preferredModels[turn.id] === respA.modelId
                                              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                              : "bg-zinc-950/15 border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-zinc-200"
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
                                    <div className="bg-[#202c33]/30 border border-zinc-900 text-zinc-400 text-xs italic flex items-center justify-center p-8 rounded-2xl h-40">
                                      Please select Model A from options above.
                                    </div>
                                  )}

                                  {/* Model B Column */}
                                  {respB ? (
                                    <div className="bg-[#202c33] border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between relative text-white pb-24">
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
                                              className="p-1 rounded bg-zinc-950/45 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            {preferredModels[turn.id] === respB.modelId && (
                                              <span className="text-[8px] bg-amber-500/95 border border-amber-400/20 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide shrink-0">PREFERRED</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="prose prose-invert prose-xs text-xs text-zinc-300 leading-relaxed font-sans max-w-none select-text">
                                          <Markdown>{respB.content}</Markdown>
                                        </div>
                                      </div>

                                      <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-2 pt-2 border-t border-zinc-900/20">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreferredModels(p => ({ ...p, [turn.id]: respB.modelId }));
                                            toast.success(`Marked ${respB.modelName} as preferred response!`);
                                          }}
                                          className={cn(
                                            "w-full py-1.5 rounded-xl border text-[9px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center gap-1.5",
                                            preferredModels[turn.id] === respB.modelId
                                              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                              : "bg-zinc-950/15 border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-zinc-200"
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
                                    <div className="bg-[#202c33]/30 border border-zinc-900 text-zinc-400 text-xs italic flex items-center justify-center p-8 rounded-2xl h-40">
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
                    <div key={m.id} className="border bg-[#202c33] border-zinc-900/60 rounded-2xl p-4 space-y-3 animate-pulse relative">
                      <div className="absolute top-0 -left-1 w-3.5 h-3.5 rotate-45 transform origin-top-left rounded-bl-sm bg-[#202c33]" />
                      
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
              activeBot ? `bg-[#121c22]/95 border-${colorName}-500/10` : "bg-[#111b21] border-[#222e35]/60",
              isDragging 
                ? activeBot ? `border-${colorName}-500 bg-[#18262f]` : "border-[#00a884]/80 bg-[#152026]"
                : "",
              attachments.length > 0 ? "pb-5" : ""
            )}
          >
            {activeBot && (
              <div className={cn("absolute inset-0 opacity-[0.06] pointer-events-none", theme.glow)} />
            )}
            {/* Quick Interactive Model Chooser panel exactly as requested above the input box */}
            {isModelChooserCollapsed ? (
                <div 
                  onClick={() => setIsModelChooserCollapsed(false)} 
                  className="max-w-5xl mx-auto mb-3 bg-[#182229]/95 py-2 px-4 border border-[#2c3d46]/85 rounded-xl hover:bg-[#1f2b34] hover:border-[#384e5a] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg select-none group animate-fade-in text-white animate-fade-in relative z-10"
                >
                  <div className="flex items-center gap-2.5 min-w-0" onClick={(e) => e.stopPropagation()}>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", activeBot ? theme.glow : "bg-[#00e676]")}></span>
                      <span className={cn("relative inline-flex rounded-full h-2 w-2", activeBot ? theme.glow : "bg-[#00a884]")}></span>
                    </span>
                    <div className="flex items-center gap-3.5 flex-wrap min-w-0">
                      {/* For What Purpose / Focus Mode Dropdown */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10.5px] font-black text-zinc-150 uppercase tracking-widest">Purpose:</span>
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(!isDropdownOpen);
                              setIsModelDropdownOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 bg-[#202c33]/95 border pl-2.5 pr-7 py-1 rounded-xl text-[10.5px] font-black uppercase tracking-wide cursor-pointer font-mono outline-none focus:ring-1 focus:ring-[#00e676]/30 transition-all shadow-sm relative border-zinc-650 hover:border-zinc-500",
                              (selectedPurposeId || 'default') === 'default' ? "bg-[#005c4b]/30 border-[#00a884]/45 text-[#00ff88]" :
                              (selectedPurposeId || 'default') === 'coding' ? "bg-blue-500/20 border-blue-505/35 text-blue-300" :
                              (selectedPurposeId || 'default') === 'image' ? "bg-rose-500/20 border-rose-505/35 text-rose-300" :
                              (selectedPurposeId || 'default') === 'content' ? "bg-purple-500/20 border-purple-505/35 text-purple-300" :
                              (selectedPurposeId || 'default') === 'reasoning' ? "bg-amber-500/20 border-amber-505/35 text-amber-300" :
                              (selectedPurposeId || 'default') === 'speed' ? "bg-cyan-500/20 border-cyan-505/35 text-cyan-300" :
                              "bg-[#202c33]/90 text-[#00ff88]"
                            )}
                          >
                            <span className="flex items-center gap-1 truncate max-w-[110px]">
                              <span>{AI_PURPOSES.find(p => p.id === (selectedPurposeId || 'default'))?.emoji || '💬'}</span>
                              <span>{AI_PURPOSES.find(p => p.id === (selectedPurposeId || 'default'))?.name || 'Default'}</span>
                            </span>
                            <span className="w-2"></span>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-400">
                              <ChevronDown className={cn("w-3 h-3 transition-transform", isDropdownOpen && "rotate-180")} />
                            </div>
                          </button>

                          {isDropdownOpen && (
                            <>
                              {/* Backdrop to capture outside taps & clicks */}
                              <div 
                                className="fixed inset-0 z-40 bg-black/15" 
                                onClick={() => setIsDropdownOpen(false)}
                              />
                              <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl bg-[#1e2a30] border border-[#2c3d46] shadow-2xl py-1 z-50 animate-fade-in text-white divide-y divide-[#2a3942]/45">
                                {AI_PURPOSES.map(p => {
                                  const isSelected = (selectedPurposeId || 'default') === p.id;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => {
                                        handlePurposeSelect(p.id || 'default');
                                        setIsDropdownOpen(false);
                                      }}
                                      className={cn(
                                        "w-full text-left px-3.5 py-2.5 text-[11px] font-bold flex items-center justify-between hover:bg-[#2c3d46] active:bg-[#374c58] transition-all first:rounded-t-xl last:rounded-b-xl",
                                        isSelected ? "text-[#00e676] bg-[#005c4b]/15" : "text-zinc-200"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm select-none">{p.emoji}</span>
                                        <span className="tracking-wide select-none">{p.name}</span>
                                      </div>
                                      {isSelected && <span className="text-[10px] text-[#00e676] font-bold select-none">✓</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* AI Model Section Dropdown */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10.5px] font-black text-zinc-150 uppercase tracking-widest">AI Models:</span>
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsModelDropdownOpen(!isModelDropdownOpen);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-1.5 bg-[#202c33]/95 border border-zinc-650 hover:border-zinc-500 pl-2.5 pr-7 py-1 rounded-xl text-[10.5px] font-black uppercase tracking-wide cursor-pointer font-mono text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-sm relative"
                          >
                            <span className="flex items-center gap-1 truncate max-w-[110px]">
                              🤖 {selectedModelIds.length} Channels
                            </span>
                            <span className="w-2"></span>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-300">
                              <ChevronDown className={cn("w-3 h-3 transition-transform", isModelDropdownOpen && "rotate-180")} />
                            </div>
                          </button>

                          {isModelDropdownOpen && (
                            <>
                              {/* Backdrop to capture outside clicks */}
                              <div 
                                className="fixed inset-0 z-40 bg-black/15" 
                                onClick={() => setIsModelDropdownOpen(false)}
                              />
                              <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl bg-[#1e2a30] border border-[#2c3d46] shadow-2xl py-1.5 z-50 animate-fade-in text-white divide-y divide-[#2a3942]/45">
                                <div className="px-3.5 py-2 text-[8.5px] uppercase tracking-widest text-zinc-400 font-extrabold">
                                  Toggle Active AI Channels
                                </div>
                                <div className="max-h-56 overflow-y-auto py-1 divide-y divide-zinc-800/25">
                                  {AVAILABLE_MODELS.map(m => {
                                    const active = selectedModelIds.includes(m.id);
                                    return (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleModelToggle(m.id)}
                                        className="w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#2c3d46] active:bg-[#374c58] transition-all"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className={cn(
                                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                                            active ? "bg-[#00a884] border-[#00a884] text-white" : "border-zinc-700 bg-transparent"
                                          )}>
                                            {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                                          </div>
                                          <div className="truncate">
                                            <div className="text-[10px] font-bold text-zinc-100 truncate">{m.name}</div>
                                            <div className="text-[8px] text-zinc-500 font-mono tracking-wider">{m.provider}</div>
                                          </div>
                                        </div>
                                        {m.requiresKey && !keys[m.keyName] && (
                                          <span className="text-[7px] bg-red-950/45 text-red-400 px-1 py-0.5 rounded border border-red-500/20 font-bold shrink-0 font-mono">
                                            ⚠ NO KEY
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#00a884] group-hover:text-[#00c99e] shrink-0 self-end sm:self-auto leading-none">
                    <span>Advanced Tuning</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto mb-3.5 bg-[#182229] p-4 rounded-2xl border border-[#2c3d46]/90 shadow-2xl animate-fade-in text-white max-h-[290px] xs:max-h-[370px] sm:max-h-[470px] md:max-h-[58vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-850">
                  {/* Header with Preset Quick-controls & counters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#222e35]/65">
                    <div className="flex items-center gap-2.5 select-none">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00a884] animate-pulse shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[11px] tracking-wider uppercase font-extrabold text-[#00a884]">
                          Goal Selection Console
                        </span>
                        <span className="text-[9.5px] text-zinc-400 font-medium">
                          Select your primary task focus. Best suited AI models will automatically cooperate side-by-side.
                        </span>
                      </div>
                    </div>
                    
                    {/* Active model counter badge and collapse triggers */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span className="bg-[#005c4b]/35 border border-[#00a884]/35 px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-[#00e676] tracking-wide font-mono shadow-inner select-none">
                        🎯 {selectedModelIds.length} Active Channels
                      </span>

                      <button 
                        type="button" 
                        onClick={() => {
                          setIsModelChooserCollapsed(true);
                          toast.info("Collapsed Selection Console. Tap the active models bar to expand again.");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202c33] hover:bg-[#2c3d46] border border-[#2c3d46]/70 rounded-xl text-[10px] font-black text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                      >
                        <span>Collapse</span>
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Choose Your Action Goal: */}
                  <div className="mb-4.5 select-none">
                    <span className="text-[9px] font-extrabold uppercase text-zinc-400 tracking-widest mb-2 block select-none">
                      1. For what purpose do you want to use the AI models?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
                      {AI_PURPOSES.map(p => {
                        const isSelected = matchedPurpose?.id === p.id;
                        const IconComponent = p.icon;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePurposeSelect(p.id)}
                            className={cn(
                              "p-3 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 text-white active:scale-95 relative overflow-hidden group min-h-[110px]",
                              isSelected 
                                ? "bg-gradient-to-br border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20 " + p.bannerColor
                                : "bg-[#202c33]/40 border-zinc-900/60 hover:border-zinc-800 hover:bg-[#202c33]/70 text-zinc-300"
                            )}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className={cn(
                                "w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all shadow-sm shrink-0",
                                isSelected 
                                  ? "bg-[#00e676] text-[#0b141a]" 
                                  : "bg-zinc-950/60 text-zinc-400 group-hover:text-zinc-200"
                              )}>
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              
                              {/* Selection tick dot */}
                              <div className={cn(
                                "w-3 h-3 rounded-full border flex items-center justify-center text-[7px] text-white shrink-0 font-bold",
                                isSelected ? "bg-[#00e676] border-[#00e676] text-[#0b141a]" : "border-zinc-700 bg-zinc-950/40"
                              )}>
                                {isSelected && "✓"}
                              </div>
                            </div>

                            <div className="mt-1">
                              <span className="font-extrabold text-[10.5px] block leading-snug group-hover:text-white truncate">
                                {p.emoji} {p.name.split(" / ")[0]}
                              </span>
                              <span className="text-[8.5px] text-zinc-400 font-medium leading-normal mt-0.5 block line-clamp-2">
                                {p.desc}
                              </span>
                            </div>

                            {/* Micro recommended block line */}
                            <div className="text-[7.5px] text-zinc-500 font-mono mt-0.5 border-t border-zinc-805/30 pt-1 flex items-center justify-between w-full font-sans">
                              <span>Cooperating:</span>
                              <span className={cn("font-bold", isSelected ? "text-emerald-400" : "text-zinc-400")}>{p.recommendedModelIds.length} models</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Manual Custom Override Switches */}
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#222e35]/40 mt-3 select-none">
                    <span className="text-[9px] font-extrabold uppercase text-zinc-400 tracking-widest">
                      2. Optional Model Overrides (Fine-tune your cooperative group)
                    </span>
                    
                    {!matchedPurpose && (
                      <span className="text-[8.5px] text-[#00e676] bg-emerald-500/10 border border-emerald-500/35 px-1.5 py-0.2 rounded font-mono shadow-sm select-none">
                        ⚙️ CUSTOM Suite Mode
                      </span>
                    )}
                  </div>

                  {/* The Models grid grouped by tier/provider cleanly */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-full">
                    {AVAILABLE_MODELS.map(m => {
                      const active = selectedModelIds.includes(m.id);
                      const missingKey = m.requiresKey && !keys[m.keyName];
                      
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleModelToggle(m.id)}
                          className={cn(
                            "p-2.5 rounded-xl text-left border transition-all duration-200 cursor-pointer select-none active:scale-95 flex flex-col justify-between gap-1 h-full relative overflow-hidden group",
                            active 
                              ? m.provider === 'gemini' ? "bg-blue-950/20 border-blue-500/40 text-blue-200 ring-1 ring-blue-500/20" :
                                m.provider === 'openai' ? "bg-emerald-950/20 border-emerald-500/40 text-[#53dfa3] ring-1 ring-emerald-500/20" :
                                m.provider === 'anthropic' ? "bg-orange-950/20 border-orange-500/35 text-orange-200 ring-1 ring-orange-500/20" :
                                m.provider === 'groq' ? "bg-pink-950/20 border-pink-500/35 text-pink-200 ring-1 ring-pink-500/20" :
                                "bg-cyan-950/20 border-cyan-500/35 text-cyan-200 ring-1 ring-cyan-500/20"
                              : "bg-[#202c33]/45 border-zinc-900/60 text-zinc-550 hover:text-zinc-300 hover:border-zinc-800"
                          )}
                          title={m.desc || ''}
                        >
                          {/* Provider Stamp Badge decoration inside card */}
                          <span className={cn(
                            "absolute top-0.5 right-1.5 text-[7.5px] font-mono font-extrabold uppercase tracking-widest pointer-events-none",
                            active ? "opacity-60 text-current" : "opacity-25 text-zinc-650"
                          )}>
                            {m.provider}
                          </span>

                          {/* Model title and selection checkbox mimic */}
                          <div className="flex items-center gap-2 w-full mt-0.5">
                            <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                              active
                                ? m.provider === 'gemini' ? "bg-blue-500 border-blue-400 text-white" :
                                  m.provider === 'openai' ? "bg-[#00a884] border-[#53dfa3] text-white" :
                                  m.provider === 'anthropic' ? "bg-orange-500 border-orange-400 text-white" :
                                  m.provider === 'groq' ? "bg-pink-500 border-pink-400 text-white" :
                                  "bg-cyan-500 border-cyan-400 text-white"
                                : "border-zinc-700 bg-zinc-950/40"
                            )}>
                              {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                            </div>
                            <span className={cn(
                              "text-[11px] font-black truncate pr-4 text-zinc-50 transition-colors",
                              active ? "text-zinc-50" : "text-zinc-400 group-hover:text-zinc-300"
                            )}>{m.name}</span>
                          </div>

                          {/* Short description and key status row */}
                          <div className="flex items-center justify-between mt-1.5 w-full border-t border-zinc-850/30 pt-1.5 font-sans">
                            <span className={cn(
                              "text-[8.5px] font-semibold block truncate max-w-[70%]",
                              active ? "text-zinc-400" : "text-zinc-600 group-hover:text-zinc-500"
                            )}>
                              {m.desc?.split(',')[0] || m.provider}
                            </span>
                            
                            {missingKey ? (
                              <span className="text-[7.5px] bg-red-950/40 text-red-400 px-1 py-0.5 rounded border border-red-500/25 font-bold shrink-0 font-mono transition-all" title="Requires custom credential. Enter key in credential box.">
                                ⚠ NO KEY
                              </span>
                            ) : (
                              <span className={cn(
                                "text-[7px] border rounded px-1 shrink-0 font-mono font-extrabold leading-none py-0.5 select-none tracking-tight",
                                active 
                                  ? "bg-emerald-500/10 border-emerald-500/35 text-[#00e676]" 
                                  : "bg-zinc-950/40 border-zinc-900/60 text-zinc-600"
                              )}>
                                READY
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Informative fallback tip line */}
                  <div className="mt-3 text-[9.5px] text-zinc-400 font-medium select-none bg-[#0b141a]/50 p-2.5 rounded-xl border border-zinc-900 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 shrink-0 text-xs shadow-sm">💡</span>
                    <span>
                      <strong>Default Fallback:</strong> If you do not choose a specific goal or override any toggles, the system automatically defaults to general answering (using Gemini 3.5 Flash & GPT-4o Mini) to process any question you ask.
                    </span>
                  </div>
                </div>
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
              <div className="max-w-5xl mx-auto mb-3 bg-[#1e2d35] border border-[#2c3d46]/70 p-3 rounded-2xl flex flex-wrap gap-2 animate-fade-in shadow-inner max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pointer-events-auto">
                {attachments.map((attach) => (
                  <div 
                    key={attach.id} 
                    className="relative group flex items-center gap-2 bg-[#2a3942] border border-zinc-700/60 pl-2.5 pr-8 py-1.5 rounded-xl text-xs text-zinc-200 max-w-[200px] select-none hover:border-zinc-600 transition-colors"
                  >
                    {attach.dataUrl ? (
                      <img 
                        src={attach.dataUrl} 
                        alt={attach.name} 
                        className="w-6 h-6 object-cover rounded border border-zinc-800" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <FileText className={cn("w-5 h-5 shrink-0", activeBot ? theme.text : "text-emerald-400")} />
                    )}
                    <span className="truncate pr-1 font-semibold">{attach.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== attach.id))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer active:scale-95 outline-none"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 max-w-5xl mx-auto">
              {/* WhatsApp Pillow Input bar */}
              <div className="flex-1 flex items-center bg-[#202c33] rounded-full px-4 py-1 flex-row min-w-0">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-white mr-3 active:scale-95 cursor-pointer shrink-0 outline-none" 
                  title="Attach media files (Drag & Drop also supported)"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
                <input
                  type="text"
                  disabled={generating}
                  placeholder={isDragging ? "Drop your files here!" : "Type a message comparing multiple AI models..."}
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm text-zinc-100 outline-none placeholder-zinc-500 disabled:opacity-50 min-w-0"
                />
              </div>

              {/* Instant Prompt Rephrase & AI Prompt Generator Hub */}
              <div id="prompt-generator-wrapper" className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPromptGeneratorOpen(!isPromptGeneratorOpen)}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md shrink-0 border outline-none",
                    isPromptGeneratorOpen 
                      ? activeBot ? `${theme.text} bg-[#2c3d46] border-emerald-500` : "bg-[#005c4b]/40 border-[#00a884] text-[#00e676]" 
                      : isRephrasing 
                        ? "bg-amber-600/20 text-amber-400 border-amber-500/20 animate-pulse" 
                        : "bg-[#202c33] border-zinc-800 hover:bg-[#2b3a42] text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:border-transparent cursor-pointer"
                  )}
                  title="Open AI Prompt Engineering & Optimizer Hub"
                >
                  <Sparkles className={cn("w-4.5 h-4.5", isRephrasing && "animate-spin")} />
                </button>

                {/* Animated AI Prompt Generator Panel */}
                <AnimatePresence>
                  {isPromptGeneratorOpen && (
                    <>
                      {/* Backdrop overlay to close click-outside */}
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => setIsPromptGeneratorOpen(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 15 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="absolute right-0 bottom-full mb-3.5 w-96 max-w-[calc(100vw-32px)] bg-[#1e2a30]/98 border border-[#2c3d46] hover:border-amber-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-5 z-40 text-white select-none overflow-hidden transition-all duration-300"
                      >
                        {/* 1. Futuristic Grid cybernetic overlay for AI animations */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-45" />
                        
                        {/* 2. Floating AI neural nodes inside cards */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.25, 0.1] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-500/10 blur-xl"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08], y: [-15, 15, -15] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 left-5 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl"
                          />
                        </div>

                        {/* Sparkle scanning beam animation when rephrasing */}
                        {isRephrasing && (
                          <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: "150%" }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent pointer-events-none"
                          />
                        )}

                        {/* Top Accent Glowing Line */}
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-500 to-[#00a884] opacity-80" />

                        {/* Panel Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#2c3d46]/70 relative z-10">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-sm shrink-0">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-[11px] font-black text-zinc-100 uppercase tracking-widest flex items-center gap-1">
                                AI Prompt Generator
                              </h4>
                              <p className="text-[9px] text-zinc-400 leading-none mt-0.5">Augment & engineer raw prompts</p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setIsPromptGeneratorOpen(false)}
                            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-4 relative z-10">
                          {/* Part A: Style modifiers */}
                          <div>
                            <span className="text-[8.5px] uppercase font-black tracking-widest text-[#00e676] block mb-2">Enhancement Persona</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { style: 'standard', name: 'Refined LLM', emoji: '⚙️', desc: 'Default high-fidelity output' },
                                { style: 'creative', name: 'Creative Spark', emoji: '🎨', desc: 'Adds vivid prose & depth' },
                                { style: 'logical', name: 'Rigorous Logic', emoji: '🧠', desc: 'Step-by-step reasoning' },
                                { style: 'speed', name: 'Executive Short', emoji: '⚡', desc: 'Ultra-concise, raw data' }
                              ].map(item => (
                                <button
                                  key={item.style}
                                  type="button"
                                  onClick={() => setSelectedGeneratorStyle(item.style as any)}
                                  className={cn(
                                    "p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 group/item active:scale-95",
                                    selectedGeneratorStyle === item.style
                                      ? "bg-[#005c4b]/20 border-[#00a884]/65 text-[#00ff88] shadow-sm font-extrabold"
                                      : "bg-[#202c33]/45 border-[#2c3d46]/75 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500"
                                  )}
                                >
                                  <div className="flex items-center gap-1 text-[10.5px] font-bold">
                                    <span>{item.emoji}</span>
                                    <span>{item.name}</span>
                                  </div>
                                  <div className="text-[8.5px] text-zinc-450 mt-0.5 line-clamp-1 group-hover/item:text-zinc-350">{item.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Part B: Fast Prompt Archetype/Templates */}
                          <div>
                            <span className="text-[8.5px] uppercase font-black tracking-widest text-amber-400 block mb-2">Quick Craft Templates</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-850">
                              {PROMPT_TEMPLATES.map((tmpl, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    const nextPrompt = tmpl.prompt + (inputMessage.trim() ? inputMessage.trim() : "[Explain quantum physics clearly]");
                                    setInputMessage(nextPrompt);
                                    toast.success(`Injected archetype template: "${tmpl.name}"`, { icon: tmpl.emoji });
                                  }}
                                  className="w-full text-left p-2 rounded-xl bg-[#202c33]/30 hover:bg-[#202c33]/80 border border-[#2c3d46]/45 hover:border-zinc-500 transition-all cursor-pointer group flex items-start gap-2.5"
                                >
                                  <span className="text-xs bg-[#2c3d46]/60 p-1 rounded group-hover:scale-110 duration-200 transition-transform shrink-0">{tmpl.emoji}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-extrabold text-zinc-200 group-hover:text-white transition-colors">{tmpl.name}</div>
                                    <div className="text-[8.5px] text-zinc-450 truncate group-hover:text-zinc-350">{tmpl.desc}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Part C: Main action trigger button */}
                          <div className="pt-3.5 border-t border-[#2c3d46]/50">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!inputMessage.trim()) {
                                  toast.error("Please draft a quick draft prompt in the input bar first!", { id: "no-draft" });
                                  return;
                                }
                                await handleGeneratorTrigger(selectedGeneratorStyle);
                              }}
                              disabled={isRephrasing}
                              className={cn(
                                "w-full py-2.5 rounded-xl uppercase text-[10px] font-black tracking-widest transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5",
                                isRephrasing
                                  ? "bg-amber-600/20 text-amber-300 border border-amber-500/25 animate-pulse cursor-wait"
                                  : "bg-gradient-to-r from-amber-500 via-amber-600 to-[#00a884] hover:from-amber-400 hover:to-[#00c99e] text-white font-black shadow-lg"
                              )}
                            >
                              {isRephrasing ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                  <span>Engineering AI Prompt...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-100" />
                                  <span>Transform Prompt & Optimize</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Send button styled authentically as a circle */}
              <button
                type="submit"
                disabled={(!inputMessage.trim() && attachments.length === 0) || generating}
                className={cn(
                  "w-11 h-11 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 disabled:shadow-none relative z-10",
                  activeBot 
                    ? `${theme.bg} ${theme.hoverBg} disabled:bg-zinc-800 disabled:text-zinc-550` 
                    : "bg-[#00a884] hover:bg-[#00c99e] disabled:bg-[#202c33] disabled:text-zinc-500"
                )}
                title={inputMessage.trim() || attachments.length > 0 ? "Send message to models" : "Microphone input (mocked)"}
              >
                {inputMessage.trim() || attachments.length > 0 ? (
                  <Send className="w-4.5 h-4.5" />
                ) : (
                  <Mic className="w-4.5 h-4.5 text-zinc-400" />
                )}
              </button>
            </div>
            
            {/* Auxiliary Info label */}
            <div className={cn(
              "flex items-center justify-between mt-2 max-w-5xl mx-auto px-4 text-[9px] uppercase tracking-wider font-extrabold select-none relative z-10",
              activeBot ? theme.text : "text-[#00a884]"
            )}>
              <span className="flex items-center gap-1">
                <Sparkles className={cn("w-3 h-3", activeBot ? theme.text : "text-[#00e676]")} />
                <span>Broadcasting live to {selectedModelIds.length} model channels</span>
              </span>
              <span className="text-zinc-650 font-mono tracking-widest uppercase">Enter to sendMessage</span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
