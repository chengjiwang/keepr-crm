import { useAuthListener } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { setupFocusManager, setupOnlineManager } from "@/lib/reactQueryNative";
import { useAuthStore } from "@/stores/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, type NativeStackNavigationOptions } from "expo-router";
import { useEffect } from "react";
import "../global.css";

setupOnlineManager(); // 模組層級執行一次即可
SplashScreen.preventAutoHideAsync(); // session 判定完成前讓原生 splash 蓋住畫面，避免閃現登入頁

export default function RootLayout() {
  useEffect(() => setupFocusManager(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

const sheetOptions: NativeStackNavigationOptions = {
  presentation: "formSheet",
  sheetAllowedDetents: [0.5, 1],
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
};

function RootNavigator() {
  useAuthListener();
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasSession = useAuthStore((s) => !!s.session);

  useEffect(() => {
    if (!isLoading) SplashScreen.hide();
  }, [isLoading]);

  // 還不知道有沒有登入：不渲染任何路由，splash 仍在
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasSession}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="customer/[id]/index" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="(sheets)/account" options={sheetOptions} />
        <Stack.Screen name="(sheets)/add-interaction" options={sheetOptions} />
        <Stack.Screen name="(sheets)/add-tag" options={sheetOptions} />
      </Stack.Protected>

      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
