import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

// 清掉上一位使用者留在記憶體的資料；冪等，主動與被動登出都會呼叫
export async function resetClientState() {
  queryClient.clear();
  await supabase.removeAllChannels();
}

// signOut 會清掉 AsyncStorage 的 session（離線時 API 失敗也會先清本機）
// 回登入頁不手動導頁：SIGNED_OUT → store session 變 null → Stack.Protected 自動導回
export async function signOut() {
  await supabase.auth.signOut();
  await resetClientState();
}

// 在 root layout 呼叫一次；不放模組層，避免 Fast Refresh 重複註冊
export function useAuthListener() {
  useEffect(() => {
    const { setSession, setLoaded } = useAuthStore.getState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // 冷啟動讀完 AsyncStorage（含過期 token 的 refresh）後第一個事件
      if (event === "INITIAL_SESSION") setLoaded();

      // 被動登出（refresh token 失效／被撤銷）也要清 cache 與訂閱
      // callback 內不可 await supabase 呼叫（會 deadlock），延到下一個 tick
      if (event === "SIGNED_OUT") setTimeout(() => void resetClientState(), 0);
    });

    return () => subscription.unsubscribe();
  }, []);
}
