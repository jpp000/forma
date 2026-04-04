import { View, StyleSheet } from "react-native";
import { Colors, Spacing } from "@/constants/theme";

type DividerProps = {
  marginVertical?: number;
  color?: string;
};

export function Divider({
  marginVertical = Spacing.md,
  color = Colors.divider,
}: DividerProps) {
  return <View style={[styles.divider, { marginVertical, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
