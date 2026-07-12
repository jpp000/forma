import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { InlineError, LoadingState, PrimaryButton, Screen } from '../../ui';
import { useProfessionalsStore } from './professionalsStore';

export function ProfessionalDetailScreen() {
  const { idOrSlug } = useLocalSearchParams<{ idOrSlug: string }>();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const {
    selected,
    detailLoading,
    detailError,
    requestLoading,
    requestError,
    requestSuccess,
    fetchProfessional,
    requestLink,
    clearRequestFeedback,
  } = useProfessionalsStore();

  useEffect(() => {
    if (typeof idOrSlug === 'string' && idOrSlug.length > 0) {
      void fetchProfessional(idOrSlug);
    }
    return () => {
      clearRequestFeedback();
    };
  }, [idOrSlug, fetchProfessional, clearRequestFeedback]);

  if (detailLoading && !selected) {
    return (
      <Screen testID="professional-detail-screen">
        <LoadingState />
      </Screen>
    );
  }

  if (detailError || !selected) {
    return (
      <Screen testID="professional-detail-screen" style={styles.content}>
        <InlineError message={detailError ?? t('errors.generic')} />
        {typeof idOrSlug === 'string' ? (
          <PrimaryButton
            label={t('common.retry')}
            onPress={() => void fetchProfessional(idOrSlug)}
          />
        ) : null}
      </Screen>
    );
  }

  const typeLabel =
    selected.type === 'nutritionist'
      ? t('professionals.typeNutritionist')
      : t('professionals.typeTrainer');

  return (
    <Screen scroll style={styles.content} testID="professional-detail-screen">
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {selected.displayName ?? selected.slug ?? selected.id}
      </Text>
      <Text style={[typography.body, { color: colors.labelSecondary }]}>
        {typeLabel}
        {selected.credentials ? ` · ${selected.credentials}` : ''}
      </Text>
      {selected.bio ? (
        <Text style={[typography.body, { color: colors.labelPrimary }]}>
          {selected.bio}
        </Text>
      ) : null}

      {requestError ? <InlineError message={requestError} /> : null}
      {requestSuccess ? (
        <Text
          style={[typography.body, { color: colors.primary }]}
          testID="professional-request-success"
        >
          {t('professionals.requestSuccess')}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label={t('professionals.requestCta')}
          onPress={() => void requestLink(selected.userId)}
          disabled={requestLoading || requestSuccess}
          testID="professional-request-cta"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  actions: {
    marginTop: 8,
  },
});
