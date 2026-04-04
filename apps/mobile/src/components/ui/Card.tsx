import { View, type ViewProps, StyleSheet } from "react-native";
import { Colors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

type CardProps = ViewProps & {
  padding?: number;
  lifted?: boolean;
};

export function Card({
  padding = Spacing.lg,
  lifted = false,
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        lifted ? Shadows.cardLifted : Shadows.card,
        { padding },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
});
