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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  bots: [],
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setBots: (bots) => set({ bots }),
  init: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let user = await dbService.getUser(firebaseUser.uid);
        if (!user) {
          user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            plan: 'free',
            createdAt: new Date().toISOString()
          };
          await dbService.createUser(user);
        }
        set({ user, initialized: true });
        await get().fetchBots();
      } else {
        set({ user: null, bots: [], initialized: true });
      }
      set({ loading: false });
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
