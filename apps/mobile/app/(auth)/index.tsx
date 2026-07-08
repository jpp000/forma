import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createApiClient } from '../../src/api/client';
import { createIdentityApi, type OAuthProvider } from '../../src/api/identity';
import { isValidEmail } from '../../src/auth/validators';
import { getActiveLocale, useT } from '../../src/i18n';
import { useFormaTheme } from '../../src/theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
  TextField,
} from '../../src/ui';

type OAuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function OAuthButton({ label, onPress, disabled }: OAuthButtonProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.oauthButton,
        {
          backgroundColor: colors.grouped,
          borderColor: colors.separator,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[typography.button, { color: colors.labelPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function AuthIndexScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const identity = useMemo(() => {
    const api = createApiClient({
      getLocale: () => getActiveLocale(),
    });
    return createIdentityApi(api);
  }, []);

  const isBusy = isSubmitting || oauthLoading !== null;

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) {
      setEmailError(undefined);
    }
    if (formError) {
      setFormError(undefined);
    }
  }

  async function handleRequestOtp() {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(t('auth.emailInvalid'));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(t('auth.emailInvalid'));
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);

    try {
      await identity.requestOtp(trimmed);
      router.push({
        pathname: '/(auth)/otp',
        params: { email: trimmed },
      });
    } catch (error) {
      setFormError(resolveRequestError(error, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOAuthPress(provider: OAuthProvider) {
    setOauthLoading(provider);
    setFormError(undefined);
    // Wired in T13 via startOAuth helper.
    setOauthLoading(null);
    setFormError(t('auth.oauthFailed'));
  }

  return (
    <Screen scroll style={styles.content}>
      <View style={styles.header}>
        <Text style={[typography.largeTitle, { color: colors.primary }]}>
          {t('brand.name')}
        </Text>
        <Text style={[typography.title, { color: colors.labelPrimary }]}>
          {t('auth.welcome')}
        </Text>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('auth.subtitle')}
        </Text>
      </View>

      {isBusy && !formError ? <LoadingState /> : null}

      <View style={styles.oauthGroup}>
        <OAuthButton
          label={t('auth.oauthGoogle')}
          onPress={() => handleOAuthPress('google')}
          disabled={isBusy}
        />
        <OAuthButton
          label={t('auth.oauthApple')}
          onPress={() => handleOAuthPress('apple')}
          disabled={isBusy}
        />
        <OAuthButton
          label={t('auth.oauthFacebook')}
          onPress={() => handleOAuthPress('facebook')}
          disabled={isBusy}
        />
      </View>

      <View style={styles.dividerRow}>
        <View
          style={[styles.dividerLine, { backgroundColor: colors.separator }]}
        />
        <Text style={[typography.footnote, { color: colors.labelTertiary }]}>
          {t('auth.emailDivider')}
        </Text>
        <View
          style={[styles.dividerLine, { backgroundColor: colors.separator }]}
        />
      </View>

      <TextField
        label={t('auth.emailLabel')}
        value={email}
        onChangeText={handleEmailChange}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      {formError ? <InlineError message={formError} /> : null}

      <PrimaryButton
        label={t('auth.requestOtp')}
        onPress={() => void handleRequestOtp()}
        loading={isSubmitting}
        disabled={isBusy && !isSubmitting}
      />
    </Screen>
  );
}

function resolveRequestError(
  error: unknown,
  t: (key: import('../../src/i18n').TranslationKey) => string,
): string {
  if (error instanceof Error && error.name === 'TypeError') {
    return t('errors.network');
  }
  return t('errors.generic');
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingVertical: 24,
  },
  header: {
    gap: 8,
  },
  oauthGroup: {
    gap: 12,
  },
  oauthButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
