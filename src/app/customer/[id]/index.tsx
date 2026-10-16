import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-ink-soft">客戶詳情 {id}（Phase 3）</Text>
    </View>
  );
}
