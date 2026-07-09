import type { ReactElement, ReactNode } from 'react';
import {
  type RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFormaTheme } from '../theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  refreshControl?: ReactElement<RefreshControlProps>;
  testID?: string;
};

export function Screen({
  children,
  scroll = false,
  style,
  refreshControl,
  testID,
}: ScreenProps) {
  const { colors } = useFormaTheme();

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}>
        <ScrollView
          testID={testID}
          contentContainerStyle={[styles.content, style]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}>
      <View testID={testID} style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
});
