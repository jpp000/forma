import { View, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui";
import { useUserStore } from "@/store/userStore";
import { useMemo } from "react";

export function GreetingHeader() {
  const { profile } = useUserStore();
  const hour = dayjs().hour();

  const name = profile.name.split(" ")[0] || "";

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const message = useMemo(() => {
    if (!name || name.length > 7) {
      return greeting;
    }

    return `${greeting}, ${name}`
  }, [greeting, name]);

  return (
    <View style={styles.container}>
      <View>
        <Text variant="title1">{message}</Text>
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
