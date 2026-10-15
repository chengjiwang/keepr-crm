import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function CustomersScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-ink-soft">客戶列表（Phase 2）</Text>
      {/* 暫時連結：驗證 Tab 外的詳情 Stack */}
      <Link href="/customer/test" className="mt-4 text-accent">
        開啟客戶詳情（測試）
      </Link>
    </View>
  );
}
