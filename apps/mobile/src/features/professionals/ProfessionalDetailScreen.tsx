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
    myRequestStatus,
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

  const statusMessage =
    myRequestStatus === 'pending'
      ? t('professionals.statusPending')
      : myRequestStatus === 'declined'
        ? t('professionals.statusDeclined')
        : myRequestStatus === 'accepted'
          ? t('professionals.statusAccepted')
          : myRequestStatus === 'expired'
            ? t('professionals.statusExpired')
            : null;

  const canRequest =
    !requestLoading &&
    myRequestStatus !== 'pending' &&
    myRequestStatus !== 'accepted';

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

      {statusMessage ? (
        <Text
          style={[typography.body, { color: colors.labelSecondary }]}
          testID="professional-request-status"
        >
          {statusMessage}
        </Text>
      ) : null}

      {requestError ? <InlineError message={requestError} /> : null}
      {requestSuccess && myRequestStatus === 'pending' ? (
        <Text
          style={[typography.body, { color: colors.primary }]}
          testID="professional-request-success"
        >
          {t('professionals.requestSuccess')}
        </Text>
      ) : null}

      <View style={styles.actions}>
        {canRequest ? (
          <PrimaryButton
            label={
              myRequestStatus === 'declined' || myRequestStatus === 'expired'
                ? t('professionals.requestAgainCta')
                : t('professionals.requestCta')
            }
            onPress={() => void requestLink(selected.userId)}
            disabled={requestLoading}
            testID="professional-request-cta"
          />
        ) : null}
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
