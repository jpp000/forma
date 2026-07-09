import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useFormaTheme } from '../theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry,
  error,
  testID,
}: TextFieldProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.labelTertiary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          typography.body,
          {
            color: colors.labelPrimary,
            backgroundColor: colors.grouped,
            borderColor: error ? colors.error : colors.separator,
          },
        ]}
      />
      {error ? (
        <Text style={[typography.footnote, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
});
