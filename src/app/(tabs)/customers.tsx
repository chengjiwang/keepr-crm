import { CustomerRow } from "@/components/CustomerRow";
import { useCustomerList } from "@/lib/customers";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { data, isPending, error } = useCustomerList();

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <Text className="mt-6 px-6 text-3xl font-bold text-ink">客戶</Text>

      {isPending ? (
        <View className="mt-10">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text className="mt-10 px-6 text-ink-soft">載入失敗：{error.message}</Text>
      ) : (
        // FlatList 只掛載可視範圍附近的列並回收，不像 web 一次 map 出整串節點
        <FlatList
          data={data}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <CustomerRow customer={item} />}
          contentContainerClassName="gap-3 px-6 pb-6 pt-4"
          ListEmptyComponent={<Text className="text-ink-soft">目前沒有客戶</Text>}
        />
      )}
    </View>
  );
}
