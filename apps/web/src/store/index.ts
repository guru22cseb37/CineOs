import { create } from 'zustand';

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // User state
  userId: string | null;
  setUserId: (id: string | null) => void;
  // Watchlist optimistic UI
  watchlistOptimistic: Set<number>;
  addOptimisticWatchlist: (id: number) => void;
  removeOptimisticWatchlist: (id: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  userId: null,
  setUserId: (id) => set({ userId: id }),
  watchlistOptimistic: new Set(),
  addOptimisticWatchlist: (id) => set((state) => {
    const newSet = new Set(state.watchlistOptimistic);
    newSet.add(id);
    return { watchlistOptimistic: newSet };
  }),
  removeOptimisticWatchlist: (id) => set((state) => {
    const newSet = new Set(state.watchlistOptimistic);
    newSet.delete(id);
    return { watchlistOptimistic: newSet };
  })
}));
