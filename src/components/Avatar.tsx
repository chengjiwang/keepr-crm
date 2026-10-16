import { getAvatarColor, getInitial } from "@/lib/avatar";
import { Text, View } from "react-native";

const SIZES = {
  sm: { box: "size-9 rounded-xl", text: "text-sm" },
  md: { box: "size-14 rounded-2xl", text: "text-xl" },
  lg: { box: "size-16 rounded-3xl", text: "text-2xl" },
} as const;

type AvatarProps = {
  id: string;
  name: string;
  size?: keyof typeof SIZES;
};

export function Avatar({ id, name, size = "md" }: AvatarProps) {
  const s = SIZES[size];

  return (
    <View
      className={`items-center justify-center ${s.box} ${getAvatarColor(id)}`}
    >
      <Text className={`font-bold text-white ${s.text}`}>
        {getInitial(name)}
      </Text>
    </View>
  );
}
