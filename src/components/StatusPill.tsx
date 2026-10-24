import type { Enums } from "@/types/database";
import { Text, View } from "react-native";

type Status = Enums<"customer_status">;

const STATUS = {
  new: { label: "新客戶", box: "bg-surface-2", text: "text-ink-soft" },
  following: { label: "待跟進", box: "bg-warn-soft", text: "text-warn" },
  won: { label: "已成交", box: "bg-accent-soft", text: "text-accent-ink" },
} satisfies Record<Status, { label: string; box: string; text: string }>;

export function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status];

  return (
    <View className={`rounded-full px-3 py-1 ${s.box}`}>
      <Text className={`text-sm font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  );
}
