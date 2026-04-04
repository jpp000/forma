import { View, StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  color = Colors.primary,
}: StatCardProps) {
  return (
    <Card padding={Spacing.lg} style={styles.card}>
      <Text variant="caption1" color={Colors.textSecondary}>
        {title}
      </Text>
      <Text variant="title3" color={color}>
        {value}
      </Text>
      {subtitle && (
        <Text variant="caption2" color={Colors.textTertiary}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: Spacing.xs,
  },
});
