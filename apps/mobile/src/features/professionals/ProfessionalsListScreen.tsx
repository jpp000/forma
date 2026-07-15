import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
  TextField,
} from '../../ui';
import { useProfessionalsStore } from './professionalsStore';

export function ProfessionalsListScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const {
    professionals,
    query,
    listLoading,
    listError,
    setQuery,
    fetchProfessionals,
  } = useProfessionalsStore();

  useEffect(() => {
    void fetchProfessionals('');
  }, [fetchProfessionals]);

  if (listLoading && professionals.length === 0 && !listError) {
    return (
      <Screen testID="professionals-screen">
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.content} testID="professionals-screen">
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('professionals.title')}
      </Text>

      <TextField
        label={t('professionals.search')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('professionals.searchPlaceholder')}
        autoCapitalize="none"
        testID="professionals-search"
      />
      <PrimaryButton
        label={t('professionals.searchAction')}
        onPress={() => void fetchProfessionals(query)}
        testID="professionals-search-submit"
      />

      {listError ? (
        <View style={styles.errorBlock}>
          <InlineError message={listError} />
          <PrimaryButton
            label={t('common.retry')}
            onPress={() => void fetchProfessionals(query)}
            testID="professionals-retry"
          />
        </View>
      ) : null}

      {!listError && professionals.length === 0 ? (
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('professionals.empty')}
        </Text>
      ) : null}

      <View
        style={[styles.group, { backgroundColor: colors.grouped }]}
        testID="professionals-list"
      >
        {professionals.map((pro) => (
          <Pressable
            key={pro.id}
            accessibilityRole="button"
            onPress={() =>
              router.push(
                `/(tabs)/professionals/${pro.slug ?? pro.id}` as Href,
              )
            }
            style={styles.row}
            testID={`professional-row-${pro.id}`}
          >
            <Text style={[typography.body, { color: colors.labelPrimary }]}>
              {pro.displayName ?? pro.slug ?? pro.id}
            </Text>
            <Text
              style={[typography.footnote, { color: colors.labelSecondary }]}
            >
              {pro.type === 'nutritionist'
                ? t('professionals.typeNutritionist')
                : t('professionals.typeTrainer')}
              {pro.credentials ? ` · ${pro.credentials}` : ''}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  errorBlock: {
    gap: 12,
  },
  group: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
});
