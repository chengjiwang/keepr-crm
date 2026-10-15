import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

// session 的持久化由 supabase-js + AsyncStorage 負責，這裡只是記憶體鏡像，不用 persist
type AuthState = {
  session: Session | null;
  isLoading: boolean; // INITIAL_SESSION 到達前為 true（冷啟動讀取 AsyncStorage 中）
  setSession: (session: Session | null) => void;
  setLoaded: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setLoaded: () => set({ isLoading: false }),
}));
