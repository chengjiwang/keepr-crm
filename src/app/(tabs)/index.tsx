import { signOut } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Phase 1 暫時頁：驗證登出會清 cache 與 Realtime 訂閱。Phase 4 帳號面板完成後移除測試碼
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.session?.user);
  const [channelCount, setChannelCount] = useState(0);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("phase1-test")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
      )
      .subscribe(() => setChannelCount(supabase.getChannels().length));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const logCounts = (label: string) =>
    console.log(
      `[phase1] ${label} queries=${queryClient.getQueryCache().getAll().length} channels=${supabase.getChannels().length}`,
    );

  const handleSignOut = async () => {
    logCounts("before signOut");
    await signOut();
    logCounts("after signOut");
  };

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top }}>
      <Text className="mt-6 text-2xl font-bold text-ink">總覽</Text>
      <Text className="mt-2 text-ink-soft">{user?.email}</Text>
      <Text className="mt-1 text-ink-soft">profile：{profile?.name ?? "載入中…"}</Text>
      <Text className="mt-1 text-ink-faint">Realtime channels：{channelCount}</Text>

      <Link href="/account" className="mt-6 text-accent">
        開啟帳號面板（測試 formSheet）
      </Link>

      <Pressable
        onPress={handleSignOut}
        className="mt-6 items-center rounded-2xl bg-warn-soft py-4"
      >
        <Text className="font-semibold text-warn">登出（暫時）</Text>
      </Pressable>
    </View>
  );
}
