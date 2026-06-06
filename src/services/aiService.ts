import { Bot, ChatMessage, KnowledgeChunk } from "../types";
import { dbService } from "./dbService";

const PURPOSE_GUIDELINES: Record<string, string> = {
  'customer-service': 'You are configured for Customer Support. Prioritize finding direct answers inside the Knowledge Base. Keep the user calm, acknowledge frustrations, and clearly lay out step-by-step solutions.',
  'sales-lead': 'You are configured for Sales & Lead Generation. Be proactive, highlight key advantages clearly and enthusiastically, and look for opportunities to ask if they would like to be connected to our team.',
  'edu-tutor': 'You are configured as an Educational Tutor. Do not just output the answers directly. Ask probing questions, explain core principles first, and encourage active critical thinking.',
  'developer-coding': 'You are configured for technical code engineering. Use precise specifications, write beautiful and safe Code blocks with clear syntax highlighting, and analyze optimization edge cases carefully.',
  'creative-copy': 'You are configured for Creative Content Generation. Use colorful analogies, dynamic pacing, catchy headlines, and persuasive structure.',
  'personal-assistant': 'You are configured as a Personal AI Companion. Stay highly responsive, casual, organized, and helpful across all general categories.'
};

export function generateDeterministicPseudoEmbedding(text: string, dimensions: number = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = (text || "").toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  if (words.length === 0) {
    // Generate a default sine-wave representation
    for (let i = 0; i < dimensions; i++) {
       vector[i] = Math.sin(i + 1);
    }
  } else {
    // Incorporate each word's hash into random dimensions deterministically
    for (const word of words) {
      let hash = 5381;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) + hash) + word.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      
      let seed = Math.abs(hash || 1);
      // Run LCG to populate deterministic coordinates
      for (let d = 0; d < 12; d++) {
        seed = (seed * 9301 + 49297) % 233280;
        const index = Math.floor((seed / 233280) * dimensions);
        seed = (seed * 9301 + 49297) % 233280;
        const val = ((seed / 233280) * 2.0) - 1.0;
        vector[index] += val;
      }
    }
  }
  
  // Normalize the vector
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(norm) || 1;
  for (let i = 0; i < dimensions; i++) {
    vector[i] = vector[i] / magnitude;
  }
  
  return vector;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok) {
      let errMsg = "Server failed to generate embedding";
      if (contentType.includes("application/json")) {
        const errData = await response.json().catch(() => ({}));
        errMsg = errData.error || errMsg;
      } else {
        const textBody = await response.text().catch(() => "");
        if (textBody.includes("RESOURCE_EXHAUSTED") || textBody.includes("quota")) {
          errMsg = "Gemini API Quota Exhausted for embeddings.";
        } else {
          errMsg = `Server responded with status ${response.status} (non-JSON response).`;
        }
      }
      throw new Error(errMsg);
    }

    if (!contentType.includes("application/json")) {
      throw new Error("Server returned an HTML or text preview (possibly the server is starting or crashed).");
    }

    const data = await response.json();
    if (data && Array.isArray(data.embedding)) {
      return data.embedding;
    }
    throw new Error("Server response did not contain embedding vector.");
  } catch (err: any) {
    console.warn(
      `[Embedding Fallback Engine] Active embedding generation failed: ${err.message}. ` +
      `Switched to zero-cost offline polynomial semantic hash vector representation.`
    );
    return generateDeterministicPseudoEmbedding(text);
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex > text.length) {
      endIndex = text.length;
    }
    chunks.push(text.slice(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function getRelevantChunks(botId: string, query: string, topK: number = 3): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);
  const allChunks = await dbService.getKnowledgeChunks(botId);
  
  if (allChunks.length === 0) return [];

  const scoredChunks = allChunks.map(chunk => ({
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.content);
}

export async function generateBotResponse(
  bot: Bot,
  history: ChatMessage[],
  learnedContext: string = "",
  files?: { data: string; mimeType: string }[]
): Promise<string> {
  const tools = [];
  if (bot.googleSearchEnabled) {
    tools.push({ googleSearch: {} });
  }

  // RAG: Retrieve relevant chunks if knowledge base exists
  let relevantKnowledge = "";
  const lastUserMessage = history[history.length - 1]?.content;
  if (lastUserMessage) {
    const chunks = await getRelevantChunks(bot.id, lastUserMessage);
    if (chunks.length > 0) {
      relevantKnowledge = `\nRelevant Knowledge Base Information:\n${chunks.join('\n---\n')}`;
    }
  }

  const purposeMsg = bot.botPurpose && PURPOSE_GUIDELINES[bot.botPurpose]
    ? `\nConfigured Bot Purpose Directive: ${PURPOSE_GUIDELINES[bot.botPurpose]}`
    : '';
  const customPurposeMsg = bot.botPurposeCustom
    ? `\nSpecial Purpose Guidelines: ${bot.botPurposeCustom}`
    : '';

  const contents: any[] = [
    {
      role: "user",
      parts: [
        { text: `System Instruction: You are ${bot.name}. 
Tone: ${bot.tone}. ${purposeMsg}${customPurposeMsg}
Base Context: ${bot.context}. 
${relevantKnowledge}
Learned Context from previous interactions: ${learnedContext}.
Always stay in character. If you don't know something, be honest but helpful within your business context.` }
      ]
    },
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  ];

  // Add files to the last user message if provided
  if (files && files.length > 0) {
    const lastUserMsg = contents[contents.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      files.forEach(file => {
        lastUserMsg.parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        } as any);
      });
    }
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.5-flash",
        contents,
        config: {
          tools: tools.length > 0 ? tools : undefined,
          thinkingConfig: bot.thinkingLevel ? {
            thinkingLevel: bot.thinkingLevel
          } : undefined
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Server failed to generate bot response");
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that.";
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    throw new Error("AI failed to respond. Please check your configurations or try again: " + err.message);
  }
}

export async function extractLearnedContext(
  currentContext: string,
  newMessages: ChatMessage[]
): Promise<string> {
  try {
    const response = await fetch("/api/extract-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentContext, newMessages }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Server failed to extract context");
    }

    const data = await response.json();
    return data.text || currentContext;
  } catch (err) {
    console.error("Context Extraction Error:", err);
    return currentContext; // Fallback to current context on failure
  }
}

export async function indexKnowledgeBase(botId: string, text: string) {
  // 1. Clear old chunks
  await dbService.deleteKnowledgeChunks(botId);

  // 2. Chunk text
  const chunks = chunkText(text);

  // 3. Generate embeddings and save
  const knowledgeChunks: Omit<KnowledgeChunk, 'id' | 'createdAt'>[] = [];
  
  // Process in batches to avoid rate limits or huge payloads
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    knowledgeChunks.push({
      botId,
      content: chunk,
      embedding
    });
  }

  await dbService.saveKnowledgeChunks(botId, knowledgeChunks);
}

export async function generateSuggestedPrompts(bot: Bot, messages?: any[]): Promise<string[]> {
  try {
    const response = await fetch("/api/suggested-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot, messages }),
    });

    if (response.ok) {
      const data = await response.json();
      let text = data.text || "";
      // Extract JSON array if any surrounding text was included
      if (text.includes('[')) {
        text = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      }

      const prompts = JSON.parse(text.trim());
      if (Array.isArray(prompts) && prompts.length > 0) {
        return prompts.slice(0, 3);
      }
    } else {
      console.warn("API returned non-OK status. Falling back to offline preset prompts.");
    }
  } catch (err) {
    console.warn("Failed to generate suggested prompts via API, choosing personality-matched offline backups:", err);
  }

  // Beautiful, personality-matched offline backups (Zero API Cost, No Quota Risk)
  const toneUpper = (bot.tone || "").toUpperCase();
  const name = bot.name || "AI Assistant";
  
  if (toneUpper.includes("FUNNY") || toneUpper.includes("SARCASTIC") || toneUpper.includes("QUIRKY") || toneUpper.includes("PLAYFUL") || toneUpper.includes("HUMOROUS")) {
    return [
      `😜 Tell me your best roasted bad joke!`,
      `🤖 Are you secretly preparing for world domination?`,
      `🍕 What is the most controversial pizza topping?`
    ];
  }
  
  if (toneUpper.includes("STRICT") || toneUpper.includes("FORMAL") || toneUpper.includes("PROFESSIONAL") || toneUpper.includes("SERIOUS")) {
    return [
      `💼 Tell me about your system design & specifications.`,
      `📈 Detail your primary features and corporate use-cases.`,
      `🔒 What security and compliance policies do you observe?`
    ];
  }
  
  if (toneUpper.includes("EMPATHETIC") || toneUpper.includes("SUPPORT") || toneUpper.includes("COMPASSIONATE") || toneUpper.includes("HEARTFELT")) {
    return [
      `🌸 I am feeling a bit overwhelmed, can we talk?`,
      `🌱 What are some mindful tips for a busy day?`,
      `🤗 Who holds the key to calming our minds?`
    ];
  }

  if (toneUpper.includes("CREATIVE") || toneUpper.includes("ARTISTIC") || toneUpper.includes("ADVENTUROUS")) {
    return [
      `🎨 Let's design an imaginary fictional solar system!`,
      `✨ Tell me a brief story set in a cyberpunk library!`,
      `🔮 What are your wild predictions for the next century?`
    ];
  }

  // Friendly & default
  return [
    `✨ Introduce yourself in character as ${name}!`,
    `🚀 Can you summarize your core purpose or utilities?`,
    `💬 What is the most interesting thing we could chat about?`
  ];
}
