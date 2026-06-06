export interface User {
  uid: string;
  email: string;
  plan: 'free' | 'pro';
  createdAt: string;
}

export interface KnowledgeChunk {
  id: string;
  botId: string;
  content: string;
  embedding: number[];
  createdAt: string;
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  welcomeMessage: string;
  tone: string;
  context: string; // This will now be the "base" context/system instruction
  knowledgeBase?: string; // The raw knowledge base text to be chunked
  themeColor: string;
  googleSearchEnabled: boolean;
  thinkingLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  imageSupportEnabled: boolean;
  documentSupportEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappVerifyToken?: string;
  telegramEnabled: boolean;
  telegramToken?: string;
  profileImage?: string; // Base64 or image URL
  compareKeys?: {
    geminiKey?: string;
    openaiKey?: string;
    anthropicKey?: string;
    groqKey?: string;
    deepseekKey?: string;
  };
  configuredModels?: string[];
  botPurpose?: string;
  botPurposeCustom?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatSession {
  id: string;
  botId: string;
  platform: 'website' | 'whatsapp' | 'telegram';
  externalUserId?: string;
  learnedContext?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: {
    name: string;
    mimeType: string;
    type: 'image' | 'document';
    url?: string;
  }[];
  timestamp: string;
}
