import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../src/theme';

export default function IndexScreen() {
  const { colors, typography } = useFormaTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <Text style={[typography.title, { color: colors.primary }]}>Forma</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
