import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../theme';

type InlineErrorProps = {
  message: string;
};

export function InlineError({ message }: InlineErrorProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[styles.box, { backgroundColor: colors.raised }]}
    >
      <Text style={[typography.footnote, { color: colors.error }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
