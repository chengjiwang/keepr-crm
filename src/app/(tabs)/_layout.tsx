import { Tabs } from "expo-router/js-tabs";

// 先用預設 tab bar；浮動毛玻璃 Tab Bar 之後的 phase 再用自訂 tabBar 取代
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2d6a4f" }}>
      <Tabs.Screen name="index" options={{ title: "總覽" }} />
      <Tabs.Screen name="customers" options={{ title: "客戶", headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ title: "通知" }} />
    </Tabs>
  );
}
