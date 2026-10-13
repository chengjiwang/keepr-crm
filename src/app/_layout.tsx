import { queryClient } from "@/lib/queryClient";
import { setupFocusManager, setupOnlineManager } from "@/lib/reactQueryNative";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";

setupOnlineManager(); // 模組層級執行一次即可

export default function RootLayout() {
  useEffect(() => setupFocusManager(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
