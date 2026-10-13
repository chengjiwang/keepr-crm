import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-xl font-bold text-accent">Keepr</Text>
        <View className="mt-4 h-10 w-10 rounded-full bg-avatar-3" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
