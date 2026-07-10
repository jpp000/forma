import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { InlineError, PrimaryButton, Screen, TextField } from '../../ui';
import { todayUtcDate } from '../home/summaryMappers';
import { useProgressStore } from './progressStore';
import {
  type LogWeightValidationErrors,
  parseWeightInput,
  validateLogWeight,
} from './weightValidation';

export function LogWeightScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { logWeight, submitLoading, submitError, clearSubmitError } =
    useProgressStore();

  const [weightKg, setWeightKg] = useState('');
  const [date, setDate] = useState(todayUtcDate());
  const [validationErrors, setValidationErrors] =
    useState<LogWeightValidationErrors | null>(null);

  useFocusEffect(
    useCallback(() => {
      clearSubmitError();
    }, [clearSubmitError]),
  );

  const onSubmit = async () => {
    const errors = validateLogWeight(
      { weightKg, date },
      {
        weightRequired: t('progress.validation.weightRequired'),
        weightInvalid: t('progress.validation.weightInvalid'),
        weightRange: t('progress.validation.weightRange'),
        dateRequired: t('progress.validation.dateRequired'),
        dateInvalid: t('progress.validation.dateInvalid'),
        dateFuture: t('progress.validation.dateFuture'),
        dateTooOld: t('progress.validation.dateTooOld'),
      },
    );

    if (errors) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors(null);
    try {
      await logWeight({
        weightKg: parseWeightInput(weightKg),
        date: date.trim(),
      });
      router.back();
    } catch {
      // submitError shown below
    }
  };

  return (
    <Screen scroll style={styles.content} testID="progress-weight-screen">
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('progress.weight.title')}
      </Text>

      <TextField
        label={t('progress.fields.weightKg')}
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="number-pad"
        error={validationErrors?.weightKg}
        testID="progress-weight-input"
      />

      <TextField
        label={t('progress.fields.date')}
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
        error={validationErrors?.date}
        testID="progress-date-input"
      />

      {submitError ? <InlineError message={submitError} /> : null}

      <PrimaryButton
        label={t('progress.weight.save')}
        loading={submitLoading}
        disabled={submitLoading}
        onPress={onSubmit}
        testID="progress-weight-submit"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
});
