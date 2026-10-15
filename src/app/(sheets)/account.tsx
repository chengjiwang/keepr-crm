import { Text, View } from "react-native";

// formSheet 不支援原生 header，標題與按鈕之後放在內容內
export default function AccountSheet() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-ink-soft">帳號面板（Phase 4）</Text>
    </View>
  );
}
