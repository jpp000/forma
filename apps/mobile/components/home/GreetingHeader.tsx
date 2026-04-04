import { View, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui";
import { useUserStore } from "@/store/userStore";

export function GreetingHeader() {
  const name = useUserStore((s) => s.profile.name);
  const hour = dayjs().hour();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <View style={styles.container}>
      <View>
        <Text variant="title2">
          {greeting}, {name}
        </Text>
        <Text variant="subheadline" color={Colors.textSecondary} style={styles.date}>
          {dayjs().format("dddd, D MMMM")}
        </Text>
      </View>
      <View style={styles.avatar}>
        <Text variant="headline" color={Colors.white}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  date: {
    marginTop: Spacing.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
