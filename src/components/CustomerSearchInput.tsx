import { PLACEHOLDER_COLOR } from "@/constants/theme";
import { Pressable, Text, TextInput, View } from "react-native";

// 不用 iOS 的 clearButtonMode：Android 沒有對應 prop，自己畫清除鈕兩平台一致
export function CustomerSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="mx-6 mt-4 flex-row items-center rounded-2xl border border-line bg-white px-4">
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="搜尋姓名、公司"
        placeholderTextColor={PLACEHOLDER_COLOR}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="搜尋客戶"
        className="flex-1 py-3 text-base text-ink"
      />
      {value !== "" && (
        <Pressable
          onPress={() => onChange("")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="清除搜尋"
          className="ml-2 size-5 items-center justify-center rounded-full bg-ink-faint"
        >
          <Text className="text-xs font-bold leading-4 text-white">✕</Text>
        </Pressable>
      )}
    </View>
  );
}
