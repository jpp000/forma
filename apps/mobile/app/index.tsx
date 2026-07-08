import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../src/i18n';
import { useFormaTheme } from '../src/theme';

export default function IndexScreen() {
  const { colors, typography } = useFormaTheme();
  const t = useT();

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <Text style={[typography.title, { color: colors.primary }]}>
        {t('brand.name')}
      </Text>
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
