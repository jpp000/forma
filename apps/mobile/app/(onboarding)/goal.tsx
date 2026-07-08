import { HealthGoal } from '@forma/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getWiredStudentApi, mapApiError } from '../../src/api';
import { useT } from '../../src/i18n';
import type { TranslationKey } from '../../src/i18n/pt-BR';
import { useSession } from '../../src/session';
import { useFormaTheme } from '../../src/theme';
import { InlineError, LoadingState, PrimaryButton, Screen } from '../../src/ui';

const GOAL_OPTIONS = [
  HealthGoal.LoseWeight,
  HealthGoal.GainMuscle,
  HealthGoal.Maintain,
  HealthGoal.ImproveHealth,
] as const;

const GOAL_LABEL_KEYS: Record<HealthGoal, TranslationKey> = {
  [HealthGoal.LoseWeight]: 'onboarding.goal.lose_weight',
  [HealthGoal.GainMuscle]: 'onboarding.goal.gain_muscle',
  [HealthGoal.Maintain]: 'onboarding.goal.maintain',
  [HealthGoal.ImproveHealth]: 'onboarding.goal.improve_health',
};

type GoalOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

function GoalOption({ label, selected, onPress, disabled }: GoalOptionProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.goalOption,
        {
          backgroundColor: selected ? colors.primarySoft : colors.grouped,
          borderColor: selected ? colors.primary : colors.separator,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          typography.body,
          { color: selected ? colors.primary : colors.labelPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function OnboardingGoalScreen() {
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { refreshMe } = useSession();
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedGoal) {
      setFormError(t('onboarding.fieldRequired'));
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);

    try {
      await getWiredStudentApi().setGoal({ goalType: selectedGoal });
      await refreshMe();
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
          {t('onboarding.goalTitle')}
        </Text>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('onboarding.goalSubtitle')}
        </Text>
      </View>

      {isSubmitting ? <LoadingState /> : null}

      <View style={styles.goalList}>
        {GOAL_OPTIONS.map((goal) => (
          <GoalOption
            key={goal}
            label={t(GOAL_LABEL_KEYS[goal])}
            selected={selectedGoal === goal}
            onPress={() => {
              setSelectedGoal(goal);
              if (formError) {
                setFormError(undefined);
              }
            }}
            disabled={isSubmitting}
          />
        ))}
      </View>

      {formError ? <InlineError message={formError} /> : null}

      <PrimaryButton
        label={t('onboarding.submitGoal')}
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
  goalList: {
    gap: 12,
  },
  goalOption: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
