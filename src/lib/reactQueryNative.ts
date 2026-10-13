import { focusManager, onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState, Platform } from "react-native";

// App 從背景回到前景 → 視為 focus，觸發 stale query 重抓
export function setupFocusManager() {
  const sub = AppState.addEventListener("change", (status) => {
    if (Platform.OS !== "web") focusManager.setFocused(status === "active");
  });
  return () => sub.remove();
}

// 斷網時暫停 query，恢復後自動重抓
export function setupOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    const sub = Network.addNetworkStateListener((state) => {
      setOnline(!!state.isConnected);
    });
    return () => sub.remove();
  });
}
