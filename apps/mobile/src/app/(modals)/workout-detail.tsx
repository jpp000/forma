import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui";

export default function WorkoutDetailModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Text variant="title3">Workout Detail</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons
            name="close-circle-outline"
            size={28}
            color={Colors.textSecondary}
          />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text variant="subheadline" color={Colors.textSecondary} align="center">
          Workout details coming soon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
