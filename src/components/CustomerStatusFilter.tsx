import { type CustomerListFilters, STATUS_FILTERS } from "@/lib/customers";
import { Pressable, ScrollView, Text } from "react-native";

type Status = CustomerListFilters["status"];

// RN 的 View 不會捲動；小螢幕放不下 4 個 chip 時需靠 horizontal ScrollView 橫向捲動
export function CustomerStatusFilter({
  value,
  onChange,
}: {
  value: Status;
  onChange: (status: Status) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-6"
      className="mt-4 shrink-0 grow-0"
      accessibilityRole="tablist"
    >
      {STATUS_FILTERS.map((f) => {
        const selected = f.value === value;
        return (
          <Pressable
            key={f.value}
            onPress={() => onChange(f.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={
              selected
                ? "rounded-full border border-ink bg-ink px-4 py-2"
                : "rounded-full border border-line bg-white px-4 py-2"
            }
          >
            <Text
              className={
                selected
                  ? "text-sm font-semibold leading-5 text-white"
                  : "text-sm font-semibold leading-5 text-ink-soft"
              }
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
