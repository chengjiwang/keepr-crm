import { CustomerRow } from "@/components/CustomerRow";
import { CustomerStatusFilter } from "@/components/CustomerStatusFilter";
import { type CustomerListFilters, useCustomerList } from "@/lib/customers";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<CustomerListFilters["status"]>("all");
  const {
    data,
    isPending,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCustomerList({ status, search: "" });
  // 只追蹤使用者下拉；isRefetching 在回前景、invalidate 等背景 refetch 也會是 true
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  // 刷新中切 Tab 時一併收起，避免新 Tab 顯示舊 Tab 的刷新動畫
  const onChangeStatus = (next: CustomerListFilters["status"]) => {
    setIsPullRefreshing(false);
    setStatus(next);
  };

  const onRefresh = async () => {
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  };

  // onEndReached 在同一次捲動、或首屏內容不足一屏時都可能連續觸發，需自行擋重複請求
  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <Text className="mt-6 px-6 text-3xl font-bold text-ink">客戶</Text>
      <CustomerStatusFilter value={status} onChange={onChangeStatus} />

      {isPending ? (
        <View className="mt-10">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text className="mt-10 px-6 text-ink-soft">
          載入失敗：{error.message}
        </Text>
      ) : (
        // FlatList 只掛載可視範圍附近的列並回收，不像 web 一次 map 出整串節點
        // key 隨 status 變動 → 切 Tab 時重新掛載，捲動位置回到頂端
        <FlatList
          key={status}
          data={data}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <CustomerRow customer={item} />}
          contentContainerClassName="gap-3 px-6 pb-6 pt-4"
          ListEmptyComponent={
            <Text className="text-ink-soft">目前沒有客戶</Text>
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </View>
  );
}
