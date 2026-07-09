import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getWiredIdentityApi, mapApiError } from '../../src/api';
import { useT } from '../../src/i18n';
import { useSession } from '../../src/session';
import { useFormaTheme } from '../../src/theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
  TextField,
} from '../../src/ui';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { signIn } = useSession();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const emailAddress = typeof email === 'string' ? email : '';

  function handleCodeChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    if (codeError) {
      setCodeError(undefined);
    }
    if (formError) {
      setFormError(undefined);
    }
  }

  async function handleVerify() {
    if (!emailAddress) {
      setFormError(t('errors.generic'));
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setCodeError(t('auth.otpInvalid'));
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);

    try {
      const { accessToken } = await getWiredIdentityApi().verifyOtp(
        emailAddress,
        code,
      );
      await signIn(accessToken);
    } catch (error) {
      setFormError(mapApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!emailAddress) {
      return;
    }

    setIsResending(true);
    setFormError(undefined);

    try {
      await getWiredIdentityApi().requestOtp(emailAddress);
    } catch (error) {
      setFormError(mapApiError(error));
    } finally {
      setIsResending(false);
    }
  }

  async function handleDevOtpFill() {
    if (!emailAddress) {
      return;
    }

    setFormError(undefined);

    try {
      const { code: mockCode } =
        await getWiredIdentityApi().devLastOtp(emailAddress);
      setCode(mockCode);
      setCodeError(undefined);
    } catch {
      setFormError(t('auth.otpInvalid'));
    }
  }

  if (!emailAddress) {
    return (
      <Screen style={styles.content}>
        <InlineError message={t('errors.generic')} />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.content} testID="auth-otp-screen">
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.labelPrimary }]}>
          {t('auth.otpTitle')}
        </Text>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('auth.otpSubtitle')}
        </Text>
      </View>

      {isSubmitting ? <LoadingState /> : null}

      <TextField
        testID="auth-otp-input"
        label={t('auth.otpLabel')}
        value={code}
        onChangeText={handleCodeChange}
        placeholder={t('auth.otpPlaceholder')}
        keyboardType="number-pad"
        autoCapitalize="none"
        error={codeError}
      />

      {formError ? <InlineError message={formError} /> : null}

      <PrimaryButton
        testID="auth-otp-submit-button"
        label={t('auth.otpSubmit')}
        onPress={() => void handleVerify()}
        loading={isSubmitting}
        disabled={isResending}
      />

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting || isResending}
        onPress={() => void handleResend()}
        style={styles.resend}
      >
        <Text style={[typography.body, { color: colors.primary }]}>
          {isResending ? t('common.loading') : t('auth.otpResend')}
        </Text>
      </Pressable>

      {__DEV__ ? (
        <Pressable
          testID="auth-dev-otp-fill"
          accessibilityRole="button"
          disabled={isSubmitting || isResending}
          onPress={() => void handleDevOtpFill()}
          style={styles.resend}
        >
          <Text style={[typography.footnote, { color: colors.labelTertiary }]}>
            {t('auth.devOtpFill')}
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingVertical: 24,
  },
  header: {
    gap: 8,
  },
  resend: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
