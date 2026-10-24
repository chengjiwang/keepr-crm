import { Avatar } from "@/components/Avatar";
import { StatusPill } from "@/components/StatusPill";
import type { CustomerListItem } from "@/lib/customers";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function CustomerRow({ customer }: { customer: CustomerListItem }) {
  const subtitle = [customer.company, customer.title].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/customer/[id]", params: { id: customer.id } })}
      className="flex-row gap-4 rounded-3xl border border-line bg-white p-4 active:bg-surface-2"
    >
      <Avatar id={customer.id} name={customer.name} size="md" />

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-lg font-bold text-ink" numberOfLines={1}>
            {customer.name}
          </Text>
          <StatusPill status={customer.status} />
        </View>

        {subtitle ? (
          <Text className="mt-0.5 text-ink-soft" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        <Text className="mt-2 text-ink-faint" numberOfLines={1}>
          {customer.last_interaction_content ?? "尚無互動紀錄"}
        </Text>
      </View>
    </Pressable>
  );
}
