import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getWiredStudentApi, mapApiError } from '../../src/api';
import { useT } from '../../src/i18n';
import type { TranslationKey } from '../../src/i18n/pt-BR';
import {
  PROFILE_ACTIVITY_OPTIONS,
  PROFILE_SEX_OPTIONS,
  type ProfileFieldErrorCode,
  type ProfileFieldName,
  type ProfileActivityLevel,
  type ProfileSex,
  type StudentProfileForm,
  validateStudentProfile,
} from '../../src/onboarding/validators';
import { useFormaTheme } from '../../src/theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
  TextField,
} from '../../src/ui';

type OptionChipProps<T extends string> = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

function OptionChip<T extends string>({
  label,
  selected,
  onPress,
  disabled,
}: OptionChipProps<T>) {
  const { colors, typography } = useFormaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primarySoft : colors.grouped,
          borderColor: selected ? colors.primary : colors.separator,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          typography.footnote,
          { color: selected ? colors.primary : colors.labelPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const FIELD_ERROR_KEYS: Record<
  ProfileFieldName,
  Record<ProfileFieldErrorCode, TranslationKey>
> = {
  age: {
    required: 'onboarding.fieldRequired',
    invalid: 'onboarding.ageInvalid',
  },
  sex: {
    required: 'onboarding.fieldRequired',
    invalid: 'onboarding.fieldRequired',
  },
  heightCm: {
    required: 'onboarding.fieldRequired',
    invalid: 'onboarding.heightInvalid',
  },
  activityLevel: {
    required: 'onboarding.fieldRequired',
    invalid: 'onboarding.fieldRequired',
  },
};

const SEX_LABEL_KEYS: Record<ProfileSex, TranslationKey> = {
  male: 'onboarding.sex.male',
  female: 'onboarding.sex.female',
  other: 'onboarding.sex.other',
};

const ACTIVITY_LABEL_KEYS: Record<ProfileActivityLevel, TranslationKey> = {
  sedentary: 'onboarding.activity.sedentary',
  light: 'onboarding.activity.light',
  moderate: 'onboarding.activity.moderate',
  active: 'onboarding.activity.active',
  very_active: 'onboarding.activity.very_active',
};

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const [form, setForm] = useState<StudentProfileForm>({
    age: '',
    sex: '',
    heightCm: '',
    activityLevel: '',
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileFieldName, string>>
  >({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof StudentProfileForm>(
    key: K,
    value: StudentProfileForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
    if (formError) {
      setFormError(undefined);
    }
  }

  async function handleSubmit() {
    const validation = validateStudentProfile(form);
    if (!validation.valid) {
      const nextErrors: Partial<Record<ProfileFieldName, string>> = {};
      for (const [field, code] of Object.entries(validation.fields) as Array<
        [ProfileFieldName, ProfileFieldErrorCode]
      >) {
        nextErrors[field] = t(FIELD_ERROR_KEYS[field][code]);
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);

    try {
      await getWiredStudentApi().createProfile(validation.profile);
      router.replace('/(onboarding)/goal');
    } catch (error) {
      setFormError(mapApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll style={styles.content}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.labelPrimary }]}>
          {t('onboarding.profileTitle')}
        </Text>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('onboarding.profileSubtitle')}
        </Text>
      </View>

      {isSubmitting ? <LoadingState /> : null}

      <TextField
        label={t('onboarding.age')}
        value={form.age}
        onChangeText={(value) => updateField('age', value)}
        keyboardType="number-pad"
        error={fieldErrors.age}
      />

      <View style={styles.fieldGroup}>
        <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
          {t('onboarding.sex')}
        </Text>
        <View style={styles.chipRow}>
          {PROFILE_SEX_OPTIONS.map((sex) => (
            <OptionChip
              key={sex}
              label={t(SEX_LABEL_KEYS[sex])}
              selected={form.sex === sex}
              onPress={() => updateField('sex', sex)}
              disabled={isSubmitting}
            />
          ))}
        </View>
        {fieldErrors.sex ? (
          <Text style={[typography.footnote, { color: colors.error }]}>
            {fieldErrors.sex}
          </Text>
        ) : null}
      </View>

      <TextField
        label={t('onboarding.heightCm')}
        value={form.heightCm}
        onChangeText={(value) => updateField('heightCm', value)}
        keyboardType="number-pad"
        error={fieldErrors.heightCm}
      />

      <View style={styles.fieldGroup}>
        <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
          {t('onboarding.activityLevel')}
        </Text>
        <View style={styles.chipWrap}>
          {PROFILE_ACTIVITY_OPTIONS.map((level) => (
            <OptionChip
              key={level}
              label={t(ACTIVITY_LABEL_KEYS[level])}
              selected={form.activityLevel === level}
              onPress={() => updateField('activityLevel', level)}
              disabled={isSubmitting}
            />
          ))}
        </View>
        {fieldErrors.activityLevel ? (
          <Text style={[typography.footnote, { color: colors.error }]}>
            {fieldErrors.activityLevel}
          </Text>
        ) : null}
      </View>

      {formError ? <InlineError message={formError} /> : null}

      <PrimaryButton
        label={t('onboarding.submitProfile')}
        onPress={() => void handleSubmit()}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
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
  fieldGroup: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
