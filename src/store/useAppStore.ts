import { create } from 'zustand';
import { User, Bot } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { dbService } from '../services/dbService';

interface AppState {
  user: User | null;
  bots: Bot[];
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setBots: (bots: Bot[]) => void;
  init: () => void;
  fetchBots: () => Promise<void>;
}

// Pre-initialize a persistent guest identifier synchronously so we never show a loading or login screen
let initialGuestId = '';
if (typeof window !== 'undefined') {
  let stored = localStorage.getItem('guest_user_id');
  if (!stored) {
    stored = 'guest_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('guest_user_id', stored);
  }
  initialGuestId = stored;
} else {
  initialGuestId = 'guest_ssr_temp';
}

const initialUser: User = {
  uid: initialGuestId,
  email: 'guest@example.com',
  plan: 'pro',
  createdAt: new Date().toISOString()
};

export const useAppStore = create<AppState>((set, get) => ({
  user: initialUser,
  bots: [],
  loading: false, // Ready instantly!
  initialized: true, // Ready instantly!
  setUser: (user) => set({ user }),
  setBots: (bots) => set({ bots }),
  init: () => {
    // Keep standard sync with database
    const { user: current } = get();
    if (current) {
      get().fetchBots().catch(err => console.error('Initial fetchBots failed', err));
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        let activeUid = '';
        let activeEmail = '';
        
        if (firebaseUser) {
          activeUid = firebaseUser.uid;
          activeEmail = firebaseUser.email || '';
        } else {
          let guestId = localStorage.getItem('guest_user_id');
          if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('guest_user_id', guestId);
          }
          activeUid = guestId;
          activeEmail = 'guest@example.com';
        }

        let dbUser = await dbService.getUser(activeUid);
        if (!dbUser) {
          dbUser = {
            uid: activeUid,
            email: activeEmail,
            plan: 'pro',
            createdAt: new Date().toISOString()
          };
          await dbService.createUser(dbUser);
        }
        set({ user: dbUser, initialized: true });
        await get().fetchBots();
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error);
        // Resilient fallback
        let guestId = localStorage.getItem('guest_user_id') || 'guest_fallback';
        const fallbackUser = {
          uid: guestId,
          email: 'guest@example.com',
          plan: 'pro' as const,
          createdAt: new Date().toISOString()
        };
        set({ user: fallbackUser, initialized: true });
      } finally {
        set({ loading: false });
      }
    });
  },
  fetchBots: async () => {
    const { user } = get();
    if (user) {
      const bots = await dbService.getBots(user.uid);
      set({ bots });
    }
  }
}));
