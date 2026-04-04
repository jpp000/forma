import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { Colors, Typography } from "@/constants/theme";

type Variant = keyof typeof Typography;

type TextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: "left" | "center" | "right";
  weight?: "400" | "500" | "600" | "700";
};

export function Text({
  variant = "body",
  color = Colors.textPrimary,
  align,
  weight,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        Typography[variant],
        { color },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...props}
    />
  );
}
