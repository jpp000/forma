import { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  SectionList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Text } from "@/components/ui";
import { EXERCISES, MUSCLE_GROUP_LABELS } from "@/constants/exercises";
import { useWorkoutStore } from "@/store/workoutStore";
import type { Exercise, MuscleGroup } from "@/types";

export default function ExerciseLibraryModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const [search, setSearch] = useState("");

  const sections = useMemo(() => {
    const filtered = search
      ? EXERCISES.filter((e) =>
          e.name.toLowerCase().includes(search.toLowerCase()),
        )
      : EXERCISES;

    const groups = new Map<MuscleGroup, Exercise[]>();
    for (const ex of filtered) {
      const list = groups.get(ex.muscleGroup) || [];
      list.push(ex);
      groups.set(ex.muscleGroup, list);
    }

    return Array.from(groups.entries()).map(([group, data]) => ({
      title: MUSCLE_GROUP_LABELS[group] || group,
      data,
    }));
  }, [search]);

  const handleSelect = useCallback(
    (exercise: Exercise) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addExerciseToActive(exercise);
      router.back();
    },
    [addExerciseToActive, router],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Text variant="title3">Exercise Library</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons
            name="close-circle-outline"
            size={28}
            color={Colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.textTertiary}
            />
          </Pressable>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text variant="footnote" weight="600" color={Colors.textSecondary}>
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 30)}>
            <Pressable
              style={styles.exerciseItem}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.exerciseIcon}>
                <Ionicons
                  name="fitness-outline"
                  size={18}
                  color={Colors.secondary}
                />
              </View>
              <Text variant="subheadline" weight="500" style={styles.exerciseName}>
                {item.name}
              </Text>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={Colors.secondary}
              />
            </Pressable>
          </Animated.View>
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.secondary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.xl + 36 + Spacing.md,
  },
});
