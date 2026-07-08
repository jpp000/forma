import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import type { TodayTrainingStatus } from '../todayStatus';

type TrainingStatusChipProps = {
  status: TodayTrainingStatus;
};

export function TrainingStatusChip({ status }: TrainingStatusChipProps) {
  const { colors, typography } = useFormaTheme();
  const t = useT();

  const labelKey =
    status === 'workout'
      ? 'training.hub.status.workout'
      : status === 'rest'
        ? 'training.hub.status.rest'
        : 'training.hub.status.pending';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.raised,
          borderColor: colors.exercise,
        },
      ]}
    >
      <Text style={[typography.body, { color: colors.exercise }]}>
        {t(labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
