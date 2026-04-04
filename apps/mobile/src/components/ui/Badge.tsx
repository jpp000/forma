import { View, StyleSheet } from "react-native";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import { Text } from "./Text";

type BadgeProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
};

export function Badge({
  label,
  color = Colors.white,
  backgroundColor = Colors.primary,
}: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text variant="caption2" color={color} weight="600">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
});
