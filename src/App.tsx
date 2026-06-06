import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { 
  Bot as BotIcon, 
  Plus, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Globe,
  Send,
  MessageCircle,
  Zap,
  Image as ImageIcon,
  FileText,
  Users,
  Trash2,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from './services/dbService';
import { Bot, ChatSession, ChatMessage } from './types';
import { cn } from './lib/utils';
import Markdown from 'react-markdown';
import { indexKnowledgeBase } from './services/aiService';
import { Toaster, toast } from 'sonner';

import { ChatWidget } from './components/ChatWidget';
import { ModelCompare } from './components/ModelCompare';
import { CompareChatView } from './components/CompareChatView';
import { ModelAndPurposeConfig } from './components/ModelAndPurposeConfig';
import { RedTeamingSandbox } from './components/RedTeamingSandbox';
import { KnowledgeGraph } from './components/KnowledgeGraph';

// Components
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { user } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const tabs = [
    { id: 'bots', label: 'My Bots', icon: BotIcon },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'redteam', label: 'Red Team', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-[#0a0a0c]/90 backdrop-blur-md border-r border-zinc-900 flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-6 flex items-center justify-between border-b border-zinc-900/30",
        isCollapsed && "flex-col gap-4 px-2"
      )}>
        <div 
          className={cn(
            "flex items-center gap-2.5 text-white font-bold text-xl cursor-pointer transition-all duration-200 shrink-0",
            isCollapsed && "justify-center"
          )} 
          onClick={() => setActiveTab('bots')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Zap className="w-4.5 h-4.5" />
          </div>
          {!isCollapsed && <span className="animate-fade-in tracking-tight font-extrabold text-white">BotAI</span>}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-sm shrink-0 cursor-pointer",
            isCollapsed && "mt-1.5"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      <nav className={cn("flex-1 px-4 py-6 space-y-2.5", isCollapsed && "px-2 flex flex-col items-center")}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={isCollapsed ? tab.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent cursor-pointer",
              isCollapsed ? "justify-center px-1" : "",
              activeTab === tab.id 
                ? "bg-indigo-600/10 text-indigo-400 border-indigo-600/20 shadow-sm" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            )}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{tab.label}</span>}
          </button>
        ))}
      </nav>

      <div className={cn("p-4 border-t border-zinc-900/40", isCollapsed && "px-2")}>
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/20 border border-zinc-900/40",
          isCollapsed && "flex-col items-center gap-4 px-0 py-2 bg-transparent border-none"
        )}>
          <div 
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0"
            title={isCollapsed ? user?.email : undefined}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{user?.plan} Plan</p>
            </div>
          )}
          <button 
            onClick={() => signOut(auth)}
            title={isCollapsed ? "Sign Out" : undefined}
            className={cn(
              "text-zinc-500 hover:text-red-400 transition-colors shrink-0",
              isCollapsed && "p-2 hover:bg-zinc-900/50 rounded-xl"
            )}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, botName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, botName: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Bot</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Are you sure you want to delete <strong className="text-zinc-200">{botName}</strong> permanently? This action cannot be undone and all data will be lost.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-600/10 cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const formatBotDate = (dateValue: any) => {
  if (!dateValue) return '';
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toLocaleDateString();
  }
  if (dateValue.seconds !== undefined) {
    return new Date(dateValue.seconds * 1000).toLocaleDateString();
  }
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? 'Recent' : parsed.toLocaleDateString();
};

const getThemeColorConfig = (bgClass?: string) => {
  const defaults = {
    bg: 'bg-indigo-600',
    text: 'text-indigo-400',
    border: 'hover:border-indigo-500/40',
    glow: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15',
    lightGlow: 'bg-indigo-500/10',
    hoverText: 'group-hover:text-indigo-400'
  };
  
  if (!bgClass) return defaults;
  
  const cleanClass = bgClass.trim();
  if (cleanClass.includes('indigo')) {
    return defaults;
  }
  if (cleanClass.includes('emerald') || cleanClass.includes('green')) {
    return {
      bg: 'bg-emerald-600',
      text: 'text-emerald-400',
      border: 'hover:border-emerald-500/40',
      glow: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
      lightGlow: 'bg-emerald-500/10',
      hoverText: 'group-hover:text-emerald-400'
    };
  }
  if (cleanClass.includes('rose') || cleanClass.includes('red')) {
    return {
      bg: 'bg-rose-600',
      text: 'text-rose-400',
      border: 'hover:border-rose-500/40',
      glow: 'bg-rose-500',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/15',
      lightGlow: 'bg-rose-500/10',
      hoverText: 'group-hover:text-rose-400'
    };
  }
  if (cleanClass.includes('amber') || cleanClass.includes('yellow') || cleanClass.includes('orange')) {
    return {
      bg: 'bg-amber-600',
      text: 'text-amber-400',
      border: 'hover:border-amber-500/40',
      glow: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
      lightGlow: 'bg-amber-500/10',
      hoverText: 'group-hover:text-amber-400'
    };
  }
  if (cleanClass.includes('purple') || cleanClass.includes('violet')) {
    return {
      bg: 'bg-purple-600',
      text: 'text-purple-400',
      border: 'hover:border-purple-500/40',
      glow: 'bg-purple-500',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/15',
      lightGlow: 'bg-purple-500/10',
      hoverText: 'group-hover:text-purple-400'
    };
  }
  if (cleanClass.includes('sky') || cleanClass.includes('blue')) {
    return {
      bg: 'bg-sky-600',
      text: 'text-sky-400',
      border: 'hover:border-sky-500/40',
      glow: 'bg-sky-500',
      badge: 'bg-sky-500/10 text-sky-450 border-sky-500/15',
      lightGlow: 'bg-sky-500/10',
      hoverText: 'group-hover:text-sky-400'
    };
  }
  
  const match = cleanClass.match(/bg-([a-z]+)-(\d+)/);
  if (match) {
    const color = match[1];
    return {
      bg: cleanClass,
      text: `text-${color}-400`,
      border: `hover:border-${color}-500/40`,
      glow: `bg-${color}-505`,
      badge: `bg-${color}-500/10 text-${color}-400 border-${color}-500/15`,
      lightGlow: `bg-${color}-500/10`,
      hoverText: `group-hover:text-${color}-400`
    };
  }
  
  return defaults;
};

const BotCard = ({ bot, onEdit, onDelete }: { bot: Bot, onEdit: (b: Bot) => void, onDelete: (botId: string, botName: string) => void }) => {
  const getBotStatus = (b: Bot) => {
    if (b.telegramEnabled || b.whatsappEnabled) {
      return {
        label: 'Active',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15 shadow-sm',
        dotClassName: 'bg-emerald-400 animate-pulse'
      };
    }
    if (b.telegramToken || b.whatsappAccessToken) {
      return {
        label: 'Disabled',
        className: 'bg-zinc-800/40 text-zinc-400 border-zinc-800/70',
        dotClassName: 'bg-zinc-500'
      };
    }
    return {
      label: 'Draft',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/15 shadow-sm',
      dotClassName: 'bg-amber-400'
    };
  };

  const status = getBotStatus(bot);
  const theme = getThemeColorConfig(bot.themeColor);
  const themeBorderColorClass = theme.text.replace('text-', 'border-');
  const themeBgColorClass = theme.text.replace('text-', 'bg-');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6.5 flex flex-col justify-between h-full transition-all duration-500",
        "bg-[#0e0e11]/60 backdrop-blur-xl border border-zinc-900/90 hover:bg-[#131317]/85",
        theme.border,
        "shadow-[0_12px_40px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:-translate-y-1.5 group"
      )}
    >
      {/* 1. Dynamic Ambient Blur Spot derived from bot theme color */}
      <div className={cn(
        "absolute -right-20 -top-20 w-44 h-44 rounded-full filter blur-3xl opacity-[0.02] group-hover:opacity-[0.16] transition-all duration-700 pointer-events-none",
        theme.glow
      )} />
      
      {/* 2. Floating Synaptic Neural Nodes Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-85 transition-opacity duration-500">
        <motion.span
          animate={{ opacity: [0.1, 0.45, 0.1], y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className={cn("absolute top-1/4 left-1/4 w-1 h-1 rounded-full filter blur-[0.5px]", themeBgColorClass)}
        />
        <motion.span
          animate={{ opacity: [0.15, 0.55, 0.15], y: [4, -4, 4] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/3 w-1.2 h-1.2 bg-zinc-600 rounded-full filter blur-[0.5px]"
        />
        <motion.span
          animate={{ opacity: [0.08, 0.35, 0.08], scale: [0.95, 1.15, 0.95] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 2.2 }}
          className="absolute top-2/3 left-14 w-1.5 h-1.5 bg-emerald-500/60 rounded-full"
        />
      </div>

      {/* 3. Quantum Cybernetic Linear Light Scan Wave */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "240%" }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
        className={cn(
          "absolute inset-x-0 h-[45px] bg-gradient-to-b from-transparent via-indigo-500/[0.035] to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity",
          theme.lightGlow.replace('/10', '/5')
        )}
      />

      {/* Highlight Top Edge Shine */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none group-hover:via-white/10 transition-all duration-500" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        {/* 4. Agent profile icon with dynamic rotational cybernetic aura and breathing neon ring */}
        <div className="relative group/avatar shrink-0">
          {/* External Revolving Cybernetic Halo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className={cn(
              "absolute -inset-1.5 rounded-[20px] border border-dashed opacity-25 group-hover/avatar:scale-105 group-hover:opacity-65 transition-all duration-500",
              themeBorderColorClass
            )}
          />
          {/* Inner Breathing High-energy glow */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className={cn(
              "absolute -inset-1 rounded-2xl blur-[1.5px] pointer-events-none group-hover/avatar:scale-110 group-hover:opacity-55 transition-all duration-500",
              bot.themeColor || "bg-indigo-600"
            )}
          />

          <div className={cn(
            "w-15 h-15 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xl border border-white/5 transition-all duration-500 group-hover:scale-[1.03] select-none relative z-10",
            !bot.profileImage && (bot.themeColor || "bg-indigo-600")
          )}>
            {bot.profileImage ? (
              <img 
                src={bot.profileImage} 
                alt={bot.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <BotIcon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-500" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border font-mono backdrop-blur-md shadow-sm",
            status.className
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClassName)} />
            {status.label}
          </span>
          <div className="flex items-center gap-1.5 bg-zinc-950/40 border border-zinc-800/80 px-3 py-1.5 rounded-xl shrink-0 shadow-inner relative" title="Channel integrations support">
            <MessageCircle className={cn("w-4 h-4 transition-colors duration-300", bot.whatsappEnabled ? "text-emerald-400" : "text-zinc-600")} />
            <Send className={cn("w-4 h-4 transition-colors duration-300", bot.telegramEnabled ? "text-sky-400" : "text-zinc-600")} />
          </div>
        </div>
      </div>
      
      <div className="my-5 relative z-10">
        <h3 className={cn(
          "text-xl font-bold text-white mb-2 leading-snug tracking-tight transition-colors duration-300",
          theme.hoverText
        )}>
          {bot.name}
        </h3>
        <p className="text-zinc-405 text-sm line-clamp-2 font-normal leading-relaxed mb-4 min-h-[40px]">
          {bot.context || "No description provided."}
        </p>

        {/* Dynamic Engine Characteristics details */}
        <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-zinc-900/40">
          <span className={cn(
            "px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest border font-mono select-none",
            bot.thinkingLevel === 'HIGH' 
              ? "bg-purple-500/10 text-purple-400 border-purple-500/15" 
              : bot.thinkingLevel === 'MEDIUM' 
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/15" 
                : "bg-zinc-800/55 text-zinc-400 border-zinc-800/80"
          )}>
            {bot.thinkingLevel || 'LOW'} Reasoning
          </span>
          
          {bot.googleSearchEnabled && (
            <span className="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/15 font-mono flex items-center gap-1 shadow-sm select-none">
              <Globe className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '10s' }} />
              Live Web
            </span>
          )}

          {bot.documentSupportEnabled && (
            <span className="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-550/15 font-mono flex items-center gap-1 shadow-sm select-none">
              Knowledge Base
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50 mt-auto relative z-10">
        <button 
          onClick={() => onEdit(bot)}
          className={cn(
            "text-sm font-semibold flex items-center gap-1.5 cursor-pointer group/btn transition-colors duration-300",
            theme.text,
            "brightness-105 hover:brightness-125"
          )}
        >
          Manage Agent <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bot.id, bot.name);
            }}
            className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer hover:scale-105"
            title="Delete Bot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-medium text-right flex flex-col gap-0.5 leading-tight select-none">
            <div>Created: {formatBotDate(bot.createdAt)}</div>
            {bot.updatedAt && formatBotDate(bot.createdAt) !== formatBotDate(bot.updatedAt) && (
              <div className={cn("font-bold animate-pulse", theme.text)}>Updated: {formatBotDate(bot.updatedAt)}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateBotModal = ({ isOpen, onClose, onCreated }: { isOpen: boolean, onClose: () => void, onCreated: () => void }) => {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    welcomeMessage: 'Hello! How can I help you today?',
    tone: 'Friendly & Professional',
    context: 'You are a helpful assistant.',
    knowledgeBase: '',
    themeColor: 'bg-indigo-600',
    googleSearchEnabled: false,
    thinkingLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
    imageSupportEnabled: false,
    documentSupportEnabled: false,
    profileImage: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const newBot = await dbService.createBot({
        userId: user.uid,
        ...formData,
        whatsappEnabled: false,
        telegramEnabled: false,
      });

      // Index knowledge base if provided
      if (formData.knowledgeBase) {
        await indexKnowledgeBase(newBot.id, formData.knowledgeBase);
      }

      toast.success('Bot created successfully!');
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create bot. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl my-8"
      >
        <div className="p-8 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-white">Create New AI Bot</h2>
          <p className="text-zinc-500 mt-1">Configure your bot's personality and intelligence.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Bot Profile Image Upload */}
          <div className="flex items-center gap-6 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="relative">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage}
                  alt="Preview"
                  className="w-20 h-20 rounded-2xl object-cover border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-500")}>
                  <BotIcon className="w-8 h-8 text-white/50" />
                </div>
              )}
              {formData.profileImage && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, profileImage: '' })}
                  className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-black border border-zinc-800 text-red-500 p-1 rounded-full shadow-md transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-bold text-white">Bot Profile Image</p>
              <p className="text-xs text-zinc-500">Upload a square image as the chatbot avatar.</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, profileImage: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="bot-profile-upload"
              />
              <label
                htmlFor="bot-profile-upload"
                className="inline-block mt-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-indigo-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Upload Image
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bot Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Sales Assistant"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tone / Personality</label>
              <select 
                value={formData.tone}
                onChange={e => setFormData({...formData, tone: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              >
                <option>Friendly & Professional</option>
                <option>Sarcastic & Funny</option>
                <option>Strict & Formal</option>
                <option>Empathetic Support</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Welcome Message</label>
            <input 
              required
              value={formData.welcomeMessage}
              onChange={e => setFormData({...formData, welcomeMessage: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">System Instructions / Base Context</label>
            <textarea 
              required
              value={formData.context}
              onChange={e => setFormData({...formData, context: e.target.value})}
              placeholder="Describe your bot's core identity and instructions..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Knowledge Base (RAG)</label>
            <textarea 
              value={formData.knowledgeBase}
              onChange={e => setFormData({...formData, knowledgeBase: e.target.value})}
              placeholder="Paste large amounts of text, documentation, or FAQs here. We'll chunk and index it for efficient retrieval."
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none"
            />
            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Supports thousands of words. Automatically chunked and indexed.</p>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Advanced Intelligence</h3>
            
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Google Search Grounding</p>
                <p className="text-xs text-zinc-500">Allow bot to search the web for real-time info.</p>
              </div>
              <input 
                type="checkbox"
                checked={formData.googleSearchEnabled}
                onChange={e => setFormData({...formData, googleSearchEnabled: e.target.checked})}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Thinking Level</p>
                <p className="text-xs text-zinc-500">Higher levels improve reasoning but increase latency.</p>
              </div>
              <select 
                value={formData.thinkingLevel}
                onChange={e => setFormData({...formData, thinkingLevel: e.target.value as any})}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Document Analysis</p>
                <p className="text-xs text-zinc-500">Allow bot to read PDFs and text files.</p>
              </div>
              <input 
                type="checkbox"
                checked={formData.documentSupportEnabled}
                onChange={e => setFormData({...formData, documentSupportEnabled: e.target.checked})}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Image Support</p>
                <p className="text-xs text-zinc-500">Allow bot to see and process images.</p>
              </div>
              <input 
                type="checkbox"
                checked={formData.imageSupportEnabled}
                onChange={e => setFormData({...formData, imageSupportEnabled: e.target.checked})}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-zinc-900 py-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-zinc-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Bot'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};



const BotDetail = ({ bot: initialBot, onBack }: { bot: Bot, onBack: () => void }) => {
  const { user, fetchBots } = useAppStore();
  const [bot, setBot] = useState<Bot>(initialBot);
  const [activeTab, setActiveTab] = useState('config');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    context: initialBot.context,
    knowledgeBase: initialBot.knowledgeBase || '',
    googleSearchEnabled: initialBot.googleSearchEnabled || false,
    thinkingLevel: initialBot.thinkingLevel || 'LOW',
    imageSupportEnabled: initialBot.imageSupportEnabled || false,
    documentSupportEnabled: initialBot.documentSupportEnabled || false,
    telegramEnabled: initialBot.telegramEnabled || false,
    telegramToken: initialBot.telegramToken || '',
    whatsappEnabled: initialBot.whatsappEnabled || false,
    whatsappPhoneNumberId: initialBot.whatsappPhoneNumberId || '',
    whatsappAccessToken: initialBot.whatsappAccessToken || '',
    whatsappVerifyToken: initialBot.whatsappVerifyToken || '',
    profileImage: initialBot.profileImage || '',
    configuredModels: initialBot.configuredModels || ['gemini-flash'],
    botPurpose: initialBot.botPurpose || 'custom',
    botPurposeCustom: initialBot.botPurposeCustom || ''
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribeToBot(initialBot.id, (updatedBot) => {
      setBot(updatedBot);
      // Only update editData if user hasn't started typing? 
      // Actually, for simple collab, we'll just let it sync.
      // A better way would be fields-level sync.
    });
    return () => unsubscribe();
  }, [initialBot.id]);

  useEffect(() => {
    if (activeTab === 'logs') {
      setLoading(true);
      dbService.getSessions(bot.id).then(s => {
        setSessions(s);
        setLoading(false);
      });
    }
  }, [activeTab, bot.id]);

  const handleUpdate = async () => {
    setIndexing(true);
    try {
      await dbService.updateBot(bot.id, editData);
      if (editData.knowledgeBase !== bot.knowledgeBase) {
        await indexKnowledgeBase(bot.id, editData.knowledgeBase);
      }
      toast.success('Bot configurations saved and re-indexed.');
      // Removed reload, onSnapshot handles state update
    } catch (err) {
      console.error(err);
      toast.error('Failed to update bot configurations.');
    } finally {
      setIndexing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteBot(bot.id);
      await fetchBots();
      toast.success(`Successfully deleted ${bot.name}.`);
      onBack();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete bot.');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={handleDelete} 
        botName={bot.name} 
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-zinc-850">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack} 
            className="p-2.5 bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg border border-white/5", !bot.profileImage && (bot.themeColor || "bg-indigo-600"))}>
            {bot.profileImage ? (
              <img 
                src={bot.profileImage} 
                alt={bot.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <BotIcon className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">{bot.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-zinc-400 text-xs sm:text-sm">
                Active &bull; Created {formatBotDate(bot.createdAt)}
                {bot.updatedAt && formatBotDate(bot.createdAt) !== formatBotDate(bot.updatedAt) && (
                  <> &bull; Updated {formatBotDate(bot.updatedAt)}</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-500/20 hover:border-red-500/40 bg-red-950/15 hover:bg-red-950/25 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-xs whitespace-nowrap cursor-pointer shrink-0"
            title="Delete Bot Profile"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Delete Bot
          </button>

          <button 
            type="button"
            onClick={() => setIsPreviewOpen(prev => !prev)}
            className={cn(
              "px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer text-xs shrink-0",
              isPreviewOpen 
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/25" 
                : "bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300"
            )}
          >
            <MessageCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            {isPreviewOpen ? 'Hide Preview' : 'Live Preview'}
          </button>
          
          <button 
            onClick={handleUpdate}
            disabled={indexing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 text-xs whitespace-nowrap shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-[0.98]"
          >
            {indexing ? 'Indexing...' : 'Save & Re-index'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 sm:gap-8 border-b border-zinc-850 mb-8 overflow-x-auto pb-[1px] scrollbar-none">
        {['config', 'logs', 'models', 'integrations'].map(tab => (
          <button
            key={tab}
            id={tab === 'models' ? 'models-tab-btn' : undefined}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 px-1 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative cursor-pointer whitespace-nowrap",
              activeTab === tab ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab === 'models' ? 'model & purpose' : tab === 'logs' ? 'chat logs' : tab === 'config' ? 'general config' : tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabUnderline" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        <div className="space-y-8">
          {activeTab === 'config' && (
            <div className="space-y-8 animate-fade-in">
              <div className="glass-effect border border-zinc-800/80 rounded-3xl p-8 space-y-6 shadow-xl">
                {/* Bot Profile Image Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl">
                  <div className="relative shrink-0 mx-auto sm:mx-0">
                    {editData.profileImage ? (
                      <img 
                        src={editData.profileImage}
                        alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover border border-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center border border-zinc-800 bg-zinc-900/60 text-zinc-500")}>
                        <BotIcon className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    {editData.profileImage && (
                      <button
                        type="button"
                        onClick={() => setEditData({ ...editData, profileImage: '' })}
                        className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-black border border-zinc-800 text-red-500 p-1 rounded-full shadow-md transition-all cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 flex-1 text-center sm:text-left">
                    <p className="text-sm font-bold text-white">Bot Profile Image</p>
                    <p className="text-xs text-zinc-400">Upload a square image to represent this agent in chat widgets.</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditData({ ...editData, profileImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="bot-profile-upload-detail"
                    />
                    <label
                      htmlFor="bot-profile-upload-detail"
                      className="inline-block mt-2 px-4 py-2 bg-zinc-900/80 border border-zinc-850 hover:border-indigo-505/55 hover:bg-zinc-850 text-indigo-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Choose Media File
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">System Persona / Instructions</label>
                  <textarea 
                    value={editData.context}
                    onChange={e => setEditData({...editData, context: e.target.value})}
                    rows={3}
                    className="w-full modern-input rounded-2xl p-5 text-zinc-200 leading-relaxed outline-none transition-all resize-none text-sm"
                    placeholder="Describe how the assistant should behave..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Knowledge Base sources (RAG)</label>
                  <textarea 
                    value={editData.knowledgeBase}
                    onChange={e => setEditData({...editData, knowledgeBase: e.target.value})}
                    rows={8}
                    placeholder="Paste context, documentation, or FAQs here to enable RAG..."
                    className="w-full modern-input rounded-2xl p-5 text-zinc-200 leading-relaxed outline-none transition-all resize-none text-sm font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1">Compiled contents are tokenized and semantically queried during conversations.</p>
                </div>

                <div className="pt-2">
                  <KnowledgeGraph 
                    knowledgeBaseText={editData.knowledgeBase} 
                    botName={bot.name || "Assistant Core AI"} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Agent Tone & Temperament</label>
                    <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl px-4 py-3.5 text-zinc-200 text-sm">{bot.tone}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Default Greeting Trigger</label>
                    <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl px-4 py-3.5 text-zinc-200 text-sm truncate">{bot.welcomeMessage}</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect border border-zinc-800/80 rounded-3xl p-8 space-y-6 shadow-xl">
                <h3 className="text-lg font-bold text-white tracking-tight">Cognitive Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-5 bg-zinc-950/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-400" />
                        Google Search Grounds
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Ground agent intelligence with real-time web searches.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editData.googleSearchEnabled}
                        onChange={e => setEditData({...editData, googleSearchEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-zinc-950/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Deliberation Level
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Adjust agent reasoning and decision processing state.</p>
                    </div>
                    <select 
                      value={editData.thinkingLevel}
                      onChange={e => setEditData({...editData, thinkingLevel: e.target.value as any})}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                    >
                      <option value="LOW">Low Latency</option>
                      <option value="MEDIUM">Balanced</option>
                      <option value="HIGH">Deep Thinking</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-zinc-950/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <BotIcon className="w-4 h-4 text-emerald-400" />
                        Vision & Analytics Support
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Enables multi-modal image content parsing and generation.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editData.imageSupportEnabled}
                        onChange={e => setEditData({...editData, imageSupportEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-zinc-950/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        Structured Document Parsing
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Index content from PDF, DOCX, and raw spreadsheets.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editData.documentSupportEnabled}
                        onChange={e => setEditData({...editData, documentSupportEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                <div className="text-center py-20 text-zinc-500">Loading logs...</div>
              ) : sessions.length === 0 ? (
                <div className="glass-effect rounded-3xl p-16 text-center border border-zinc-800/80 max-w-lg mx-auto flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center mb-4 text-zinc-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-bold text-base mb-1">No sessions recorded yet</h4>
                  <p className="text-zinc-500 text-xs">When users interact with this agent, their complete audit logs will stream here.</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="glass-effect border border-zinc-850 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-505/40 transition-all cursor-pointer group shadow-md hover:shadow-indigo-600/5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center font-bold text-white group-hover:border-indigo-500/20 transition-all duration-300">
                        {session.platform === 'website' ? <Globe className="w-5 h-5 text-indigo-450 animate-pulse" /> : <MessageCircle className="w-5 h-5 text-emerald-455" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">Session {session.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-zinc-400 mt-1">{new Date(session.lastMessageAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-all uppercase tracking-wider font-mono flex items-center gap-1.5 pt-[2px]">
                      Explore Chat <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'models' && (
            <ModelAndPurposeConfig bot={bot} />
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6 pb-12 animate-fade-in">
              {/* Integrations Header */}
              <div className="glass-effect border border-zinc-805 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-550/20 rounded-2xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Website Widget Embed</h3>
                      <p className="text-zinc-400 text-sm">Deploy this chatbot live to any website using a single line snippet.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-850/85 rounded-2xl p-5 font-mono text-xs text-indigo-400 overflow-x-auto flex items-center justify-between shadow-inner">
                  <code className="text-zinc-300 antialiased selection:bg-indigo-500/30 font-mono select-all pr-4">{`<script src="${window.location.origin}/chatbot.js" data-bot-id="${bot.id}"></script>`}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<script src="${window.location.origin}/chatbot.js" data-bot-id="${bot.id}"></script>`);
                      toast.success('Script tag copied!');
                    }}
                    className="ml-4 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-white hover:bg-indigo-605 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap active:scale-[0.96]"
                  >
                    Copy Tag
                  </button>
                </div>
              </div>

              {/* Telegram */}
              <div className="glass-effect border border-zinc-805 rounded-3xl p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Send className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Telegram Deployment</h3>
                      <p className="text-zinc-400 text-sm">Deploy your bot configurations directly as a personal Telegram assistant.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editData.telegramEnabled}
                      onChange={e => setEditData({...editData, telegramEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-450 after:border-zinc-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                  </label>
                </div>
                {editData.telegramEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-zinc-850/80"
                  >
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Secure Bot Token (from @BotFather)</label>
                      <input 
                        type="password"
                        placeholder="123456789:ABCDef..."
                        value={editData.telegramToken}
                        onChange={e => setEditData({...editData, telegramToken: e.target.value})}
                        className="w-full modern-input rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-mono text-sm leading-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Meta Webhook callback URL</label>
                      <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-400 text-sm font-mono flex items-center justify-between">
                        <span className="truncate select-all select-none">{`${window.location.origin}/api/webhooks/telegram/${bot.id}`}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/telegram/${bot.id}`);
                            toast.success('Telegram webhook URL copied!');
                          }}
                          className="text-blue-400 hover:text-white transition-colors ml-2 shrink-0 font-bold hover:underline cursor-pointer"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="glass-effect border border-zinc-805 rounded-3xl p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-emerald-450" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">WhatsApp Enterprise Cloud API</h3>
                      <p className="text-zinc-400 text-sm">Deploy this bot globally on WhatsApp by connecting Meta Developer account.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editData.whatsappEnabled}
                      onChange={e => setEditData({...editData, whatsappEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-455 after:border-zinc-355 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
                  </label>
                </div>
                {editData.whatsappEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-zinc-850/80"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">WhatsApp Phone Number ID</label>
                        <input 
                          placeholder="ID from Meta Developer console"
                          value={editData.whatsappPhoneNumberId}
                          onChange={e => setEditData({...editData, whatsappPhoneNumberId: e.target.value})}
                          className="w-full modern-input rounded-xl px-4 py-3 text-white outline-none focus:border-green-500 text-sm leading-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Custom verify Token</label>
                        <input 
                          placeholder="Create a verification key"
                          value={editData.whatsappVerifyToken}
                          onChange={e => setEditData({...editData, whatsappVerifyToken: e.target.value})}
                          className="w-full modern-input rounded-xl px-4 py-3 text-white outline-none focus:border-green-500 text-sm leading-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Secure Access Token</label>
                      <input 
                        type="password"
                        placeholder="Meta permanent gateway access key"
                        value={editData.whatsappAccessToken}
                        onChange={e => setEditData({...editData, whatsappAccessToken: e.target.value})}
                        className="w-full modern-input rounded-xl px-4 py-3 text-white outline-none focus:border-green-500 font-mono text-sm leading-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Meta Callback Endpoints</label>
                      <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-400 text-sm font-mono flex items-center justify-between">
                        <span className="truncate select-all select-none">{`${window.location.origin}/api/webhooks/whatsapp`}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`);
                            toast.success('WhatsApp webhook URL copied!');
                          }}
                          className="text-emerald-400 hover:text-white transition-colors ml-2 shrink-0 font-bold hover:underline cursor-pointer"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Live Preview Popup */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="fixed bottom-6 right-6 z-50 w-[330px] sm:w-[350px] max-w-[calc(100vw-2rem)] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3"
          >
            {/* Pop-up header */}
            <div className="flex items-center justify-between px-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 px-2.5 text-[9px] bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider font-mono shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              >
                Close
              </button>
            </div>

            {/* Simulated Phone Frame */}
            <div 
              className="h-[480px] sm:h-[500px] bg-zinc-950 rounded-[1.6rem] border-4 border-zinc-800 overflow-hidden relative group shadow-inner"
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              {/* Phone Status Bar Simulation */}
              <div className="absolute top-0 inset-x-0 h-10 z-30 flex items-center justify-between px-6 text-[10px] text-white/90 font-medium pointer-events-none">
                <span className="font-semibold tracking-tight">9:41</span>
                {/* Camera Pill (Dynamic Island) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full border border-zinc-900 shadow-inner" />
                <div className="flex items-center gap-1 ml-auto">
                  <div className="flex gap-0.5 items-end h-1.5 pb-[1px]">
                    <span className="w-[1.5px] h-[2px] bg-white rounded-full opacity-100" />
                    <span className="w-[1.5px] h-[3.5px] bg-white rounded-full opacity-100" />
                    <span className="w-[1.5px] h-[5px] bg-white rounded-full opacity-100" />
                    <span className="w-[1.5px] h-[6px] bg-white rounded-full opacity-50" />
                  </div>
                  <span className="font-semibold tracking-wide text-[8px] opacity-90">LTE</span>
                  <div className="w-4 h-2 rounded-[3px] border border-white/60 p-[1px] flex items-center">
                    <div className="w-2 h-full bg-white rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="absolute bottom-1.2 inset-x-0 h-1 z-30 flex justify-center pointer-events-none">
                <div className="w-20 h-0.5 bg-black/20 rounded-full" />
              </div>

              {/* Simulated Website Content */}
              <div className="w-full h-full bg-slate-950 text-white p-5 pt-11 flex flex-col justify-start overflow-y-auto scrollbar-hide text-left">
                {/* Simulated Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-[10px] shadow-md shadow-indigo-600/30">S</div>
                    <span className="font-bold text-[10px] uppercase tracking-wider text-zinc-300">SaaSify</span>
                  </div>
                  <div className="w-4 h-2.5 flex flex-col justify-between items-end">
                    <div className="w-4 h-[1px] bg-zinc-500 rounded-full" />
                    <div className="w-2.5 h-[1px] bg-zinc-500 rounded-full" />
                  </div>
                </div>

                {/* Simulated Hero */}
                <div className="space-y-2.5">
                  <span className="inline-block text-[8px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">Support Assistant</span>
                  <h1 className="text-base font-black tracking-tight leading-tight text-white">
                    An Intelligent AI Agent For <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Your Business</span>
                  </h1>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Trained directly on your files and system contexts to support customers and answer queries 24/7.
                  </p>
                  
                  {/* Visual mockup card inside mockup */}
                  <div className="p-3 bg-zinc-900/40 border border-zinc-800/85 rounded-xl space-y-2 mt-1 shadow-inner">
                    <div className="flex items-center gap-1 pb-1.5 border-b border-zinc-800/50">
                      <div className="w-1.5 h-1.5 bg-red-500/80 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-yellow-500/80 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-green-500/80 rounded-full" />
                      <div className="h-1 w-16 bg-zinc-800 rounded ml-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-1/2 bg-zinc-800 rounded" />
                      <div className="h-1 w-2/3 bg-zinc-800/50 rounded" />
                    </div>
                  </div>
                </div>

                {/* Informative Tip */}
                <div className="mt-5 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                  <p className="text-[9px] text-indigo-300 font-medium leading-relaxed">
                    👇 Click the floating chat bubble in the bottom right corner of this phone to interact!
                  </p>
                </div>
              </div>

              {/* Chat widget wrapper */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="w-full h-full relative pointer-events-auto">
                  <ChatWidget botId={bot.id} inline autoOpen />
                </div>
              </div>

              {/* Subtle visual brand reflection */}
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
            </div>
            
            <p className="text-center text-[10px] text-zinc-500 font-semibold font-mono">
              Live Widget Preview Simulation
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger when closed */}
      <AnimatePresence>
        {!isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className="fixed bottom-6 right-6 z-45"
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-4 px-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-indigo-500/20 group cursor-pointer"
            >
              <div className="relative">
                <MessageCircle className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 border border-indigo-600 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 border border-indigo-600 rounded-full" />
              </div>
              <span>Live Preview</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatLogsView = () => {
  const { bots } = useAppStore();
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bots.length > 0 && !selectedBot) {
      setSelectedBot(bots[0]);
    }
  }, [bots]);

  useEffect(() => {
    if (selectedBot) {
      setLoading(true);
      dbService.getSessions(selectedBot.id).then(s => {
        setSessions(s);
        setLoading(false);
      });
    }
  }, [selectedBot]);

  useEffect(() => {
    if (selectedSession && selectedBot) {
      const unsubscribe = dbService.subscribeToMessages(selectedBot.id, selectedSession.id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [selectedSession, selectedBot]);

  const loadMessages = (s: ChatSession) => {
    setSelectedSession(s);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Chat Logs</h1>
        <p className="text-zinc-500">Review conversations across all your bots.</p>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Bot & Session List */}
        <div className="w-80 flex flex-col gap-6 overflow-hidden">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Bot</label>
            <select 
              value={selectedBot?.id}
              onChange={e => setSelectedBot(bots.find(b => b.id === e.target.value) || null)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
            >
              {bots.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recent Sessions</label>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">No sessions found.</div>
              ) : (
                sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadMessages(s)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all",
                      selectedSession?.id === s.id 
                        ? "bg-indigo-600/10 border-indigo-600/50 text-white" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">Session {s.id.slice(-6)}</span>
                      <span className="text-[10px] opacity-50">{new Date(s.lastMessageAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1">
                      {s.platform === 'website' ? <Globe className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                      {s.platform}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message View */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
          {selectedSession ? (
            <>
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">Conversation History</h3>
                  <p className="text-xs text-zinc-500">Session ID: {selectedSession.id}</p>
                </div>
                <div className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  {messages.length} Messages
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950/50">
                {messages.map((msg, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex w-full flex-col",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-tl-none"
                    )}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-[10px]">
                              {att.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span className="truncate max-w-[100px]">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a session</h3>
              <p className="text-zinc-500 max-w-xs">Pick a conversation from the list to view the full chat history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const APIKeysSettings = () => {
  const [keys, setKeys] = useState({
    geminiKey: localStorage.getItem('compare_key_gemini') || '',
    openaiKey: localStorage.getItem('compare_key_openai') || '',
    anthropicKey: localStorage.getItem('compare_key_anthropic') || '',
    groqKey: localStorage.getItem('compare_key_groq') || '',
    deepseekKey: localStorage.getItem('compare_key_deepseek') || '',
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleSaveKeys = () => {
    localStorage.setItem('compare_key_gemini', keys.geminiKey);
    localStorage.setItem('compare_key_openai', keys.openaiKey);
    localStorage.setItem('compare_key_anthropic', keys.anthropicKey);
    localStorage.setItem('compare_key_groq', keys.groqKey);
    localStorage.setItem('compare_key_deepseek', keys.deepseekKey);
    toast.success('API keys saved successfully!');
  };

  const keyConfigs = [
    { id: 'geminiKey', label: 'Gemini API Key', desc: 'Powers Google Gemini models' },
    { id: 'openaiKey', label: 'OpenAI API Key', desc: 'Powers GPT-4o and GPT-4o-mini' },
    { id: 'anthropicKey', label: 'Anthropic API Key', desc: 'Powers Claude Sonnet & Haiku' },
    { id: 'groqKey', label: 'Groq API Key', desc: 'Powers hyper-speed Llama & Mixtral' },
    { id: 'deepseekKey', label: 'DeepSeek API Key', desc: 'Powers DeepSeek reasoning models' },
  ];

  return (
    <div className="pt-8 border-t border-zinc-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <span>API Credentials Settings</span>
        </h3>
        <p className="text-zinc-500 text-sm mt-1">Manage secret keys here to power side-by-side comparative model testing inside the Compare Chat arena.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keyConfigs.map((cfg) => (
          <div key={cfg.id} className="space-y-2 bg-zinc-950/40 border border-zinc-850/60 p-5 rounded-2xl shadow-sm hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">{cfg.label}</label>
                <p className="text-[10px] text-zinc-500 leading-snug mt-0.5">{cfg.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, [cfg.id]: !prev[cfg.id] }))}
                className="text-zinc-500 hover:text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer select-none"
              >
                {showKeys[cfg.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKeys[cfg.id] ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showKeys[cfg.id] ? 'text' : 'password'}
              placeholder={`Enter custom ${cfg.label}...`}
              value={keys[cfg.id as keyof typeof keys]}
              onChange={e => setKeys(prev => ({ ...prev, [cfg.id]: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none transition-all font-mono placeholder-zinc-700 focus:border-indigo-500"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveKeys}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-[0.98] transition-all"
        >
          Save API keys
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { user, bots, loading, initialized, init, fetchBots } = useAppStore();
  const [activeTab, setActiveTab] = useState('bots');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    init();
  }, []);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Build Smarter Bots</h1>
            <p className="text-zinc-500 mt-3 text-lg">The AI-first chatbot platform that learns from every conversation.</p>
          </div>
          <button 
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen mesh-bg text-zinc-300 font-sans antialiased selection:bg-indigo-500/20">
      <Toaster position="top-right" theme="dark" closeButton />
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSelectedBot(null); }} />
      
      <main className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        (activeTab === 'chat' && !selectedBot) ? "h-screen overflow-hidden p-0 bg-[#0b141a]" : "overflow-y-auto p-8 lg:p-12"
      )}>
        <AnimatePresence mode="wait">
          {selectedBot ? (
            <motion.div
              key="bot-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BotDetail bot={selectedBot} onBack={() => setSelectedBot(null)} />
            </motion.div>
          ) : activeTab === 'bots' ? (
            <motion.div 
              key="bots"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-850">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">My AI Agents</h1>
                </div>
              </div>

              {bots.length === 0 ? (
                <div className="glass-effect rounded-3xl p-16 text-center border border-zinc-800/80 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <BotIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No agents active</h3>
                  <p className="text-zinc-450 mb-8 max-w-md mx-auto text-sm leading-relaxed">Assemble and configure your first AI agent. Connect dynamic knowledge bases, set tailored system instructions, and power continuous interactions.</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm cursor-pointer shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98]"
                  >
                    Assemble Your First Agent
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bots.map(bot => (
                    <BotCard 
                      key={bot.id} 
                      bot={bot} 
                      onEdit={setSelectedBot} 
                      onDelete={(botId, botName) => setDeleteTarget({ id: botId, name: botName })}
                    />
                  ))}
                  <ConfirmDeleteModal 
                    isOpen={deleteTarget !== null}
                    onClose={() => setDeleteTarget(null)}
                    botName={deleteTarget?.name || ''}
                    onConfirm={async () => {
                      if (!deleteTarget) return;
                      try {
                        await dbService.deleteBot(deleteTarget.id);
                        await fetchBots();
                        toast.success(`Successfully deleted ${deleteTarget.name}.`);
                      } catch (err: any) {
                        console.error(err);
                        toast.error('Failed to delete bot.');
                      } finally {
                        setDeleteTarget(null);
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          ) : activeTab === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden"
            >
              <CompareChatView />
            </motion.div>
          ) : activeTab === 'redteam' ? (
            <motion.div 
              key="redteam"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <RedTeamingSandbox onBotUpdated={fetchBots} />
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <h1 className="text-4xl font-bold text-white mb-12">Settings</h1>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Subscription Plan</h3>
                    <p className="text-zinc-500 text-sm">You are currently on the {user.plan} plan.</p>
                  </div>
                  <button className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-all">
                    Upgrade to Pro
                  </button>
                </div>
                <APIKeysSettings />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CreateBotModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={fetchBots}
      />
    </div>
  );
}
