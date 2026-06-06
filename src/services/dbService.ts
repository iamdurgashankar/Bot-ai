import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  limit,
  onSnapshot,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Bot, ChatSession, ChatMessage, User, KnowledgeChunk } from '../types';
import { toast } from 'sonner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  if (errMessage.includes('permission-denied')) {
    toast.error(`Access Denied: You don't have permission to perform this action (${operationType} on ${path})`);
  } else {
    toast.error(`Database Error: ${errMessage.split(':')[0]}`);
  }
  
  throw new Error(JSON.stringify(errInfo));
}

const cleanObject = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export const dbService = {
  // User
  async createUser(user: User) {
    try {
      await setDoc(doc(db, 'users', user.uid), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  },
  async getUser(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  },

  // Bots
  async createBot(bot: Omit<Bot, 'id' | 'createdAt'>) {
    try {
      const botRef = doc(collection(db, 'bots'));
      const newBot = cleanObject({ ...bot, id: botRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await setDoc(botRef, newBot);
      return newBot;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bots');
    }
  },
  async getBots(userId: string) {
    try {
      const q = query(collection(db, 'bots'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Bot);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'bots');
    }
  },
  async getBot(botId: string) {
    try {
      const snap = await getDoc(doc(db, 'bots', botId));
      return snap.exists() ? snap.data() as Bot : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `bots/${botId}`);
    }
  },
  subscribeToBot(botId: string, callback: (bot: Bot) => void) {
    const path = `bots/${botId}`;
    return onSnapshot(doc(db, 'bots', botId), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Bot);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },
  async updateBot(botId: string, updates: Partial<Bot>) {
    try {
      const allUpdates = { ...updates, updatedAt: serverTimestamp() };
      await updateDoc(doc(db, 'bots', botId), cleanObject(allUpdates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bots/${botId}`);
    }
  },
  async deleteBot(botId: string) {
    try {
      await deleteDoc(doc(db, 'bots', botId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bots/${botId}`);
    }
  },

  // Presence
  async updatePresence(botId: string, userId: string, userData: { name: string; photoURL?: string }) {
    const path = `bots/${botId}/presence/${userId}`;
    try {
      const presenceRef = doc(db, `bots/${botId}/presence`, userId);
      await setDoc(presenceRef, {
        ...userData,
        userId,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  subscribeToPresence(botId: string, callback: (users: any[]) => void) {
    const path = `bots/${botId}/presence`;
    const q = query(
      collection(db, path),
      where('lastSeen', '>', new Date(Date.now() - 60000)) // Active in last minute
    );
    return onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => d.data());
      callback(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },
  async removePresence(botId: string, userId: string) {
    const path = `bots/${botId}/presence/${userId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sessions
  async createSession(botId: string, platform: string, externalUserId?: string) {
    const path = `bots/${botId}/sessions`;
    try {
      const sessionRef = doc(collection(db, path));
      const session: ChatSession = cleanObject({
        id: sessionRef.id,
        botId,
        platform: platform as any,
        externalUserId,
        learnedContext: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      await setDoc(sessionRef, session);
      return session;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },
  async getSession(botId: string, sessionId: string) {
    const path = `bots/${botId}/sessions/${sessionId}`;
    try {
      const snap = await getDoc(doc(db, `bots/${botId}/sessions`, sessionId));
      return snap.exists() ? snap.data() as ChatSession : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },
  async updateSessionContext(botId: string, sessionId: string, context: string) {
    const path = `bots/${botId}/sessions/${sessionId}`;
    try {
      await updateDoc(doc(db, `bots/${botId}/sessions`, sessionId), {
        learnedContext: context,
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Messages
  async addMessage(botId: string, sessionId: string, role: string, content: string, attachments?: ChatMessage['attachments']) {
    const path = `bots/${botId}/sessions/${sessionId}/messages`;
    try {
      const msgRef = doc(collection(db, path));
      const msg: ChatMessage = cleanObject({
        sessionId,
        role: role as any,
        content,
        attachments,
        timestamp: serverTimestamp()
      });
      await setDoc(msgRef, msg);
      return msg;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  async getMessages(botId: string, sessionId: string, limitCount = 20) {
    const path = `bots/${botId}/sessions/${sessionId}/messages`;
    try {
      const q = query(
        collection(db, path),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as ChatMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },
  subscribeToMessages(botId: string, sessionId: string, callback: (messages: ChatMessage[]) => void) {
    const path = `bots/${botId}/sessions/${sessionId}/messages`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => d.data() as ChatMessage));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // Analytics & Logs
  async getSessions(botId: string) {
    const path = `bots/${botId}/sessions`;
    try {
      const q = query(collection(db, path), orderBy('lastMessageAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as ChatSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },
  async getAllMessages(botId: string, sessionId: string) {
    const path = `bots/${botId}/sessions/${sessionId}/messages`;
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as ChatMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Knowledge Base
  async getKnowledgeChunks(botId: string) {
    const path = `bots/${botId}/knowledge`;
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data() as KnowledgeChunk);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },
  async saveKnowledgeChunks(botId: string, chunks: Omit<KnowledgeChunk, 'id' | 'createdAt'>[]) {
    const path = `bots/${botId}/knowledge`;
    try {
      const batch = writeBatch(db);
      chunks.forEach(chunk => {
        const ref = doc(collection(db, path));
        batch.set(ref, {
          ...chunk,
          id: ref.id,
          botId,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  async deleteKnowledgeChunks(botId: string) {
    const path = `bots/${botId}/knowledge`;
    try {
      const snap = await getDocs(collection(db, path));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
