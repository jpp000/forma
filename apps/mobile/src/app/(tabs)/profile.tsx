import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Text, Card, Divider, Button } from "@/components/ui";
import { useUserStore } from "@/store/userStore";

type SettingItem = {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const setGoals = useUserStore((s) => s.setGoals);
  const [editing, setEditing] = useState(false);

  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(String(profile.age || ""));
  const [editHeight, setEditHeight] = useState(String(profile.heightCm || ""));
  const [editWeight, setEditWeight] = useState(String(profile.weightKg || ""));
  const [editGoalWeight, setEditGoalWeight] = useState(
    String(profile.goalWeightKg || ""),
  );
  const [editCalories, setEditCalories] = useState(
    String(profile.goals.dailyCalories),
  );
  const [editProtein, setEditProtein] = useState(
    String(profile.goals.proteinPercent),
  );
  const [editCarbs, setEditCarbs] = useState(
    String(profile.goals.carbsPercent),
  );
  const [editFat, setEditFat] = useState(String(profile.goals.fatPercent));

  const handleSave = () => {
    const pPct = Number(editProtein) || 0;
    const cPct = Number(editCarbs) || 0;
    const fPct = Number(editFat) || 0;

    if (pPct + cPct + fPct !== 100) {
      Alert.alert("Invalid Macros", "Protein + Carbs + Fat must equal 100%");
      return;
    }

    setProfile({
      name: editName.trim() || profile.name,
      age: Number(editAge) || undefined,
      heightCm: Number(editHeight) || undefined,
      weightKg: Number(editWeight) || undefined,
      goalWeightKg: Number(editGoalWeight) || undefined,
    });

    setGoals({
      dailyCalories: Number(editCalories) || 2000,
      proteinPercent: pPct,
      carbsPercent: cPct,
      fatPercent: fPct,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  const settings: SettingItem[] = [
    {
      icon: "notifications-outline",
      label: "Notifications",
      value: "On",
    },
    {
      icon: "download-outline",
      label: "Export Data",
      onPress: () =>
        Alert.alert("Coming Soon", "Data export will be available soon."),
    },
    {
      icon: "information-circle-outline",
      label: "About",
      value: "v1.0.0",
    },
  ];

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + 120,
        },
      ]}
      showsVerticalScrollIndicator={false}
      bounces
    >
      <Text variant="title2" style={styles.title}>
        Profile
      </Text>

      {/* Avatar & Name */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.profileSection}
      >
        <View style={styles.avatar}>
          <Text variant="largeTitle" color={Colors.white}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {editing ? (
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Your name"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />
        ) : (
          <Text variant="title2">{profile.name}</Text>
        )}
        <Pressable
          style={styles.editBtn}
          onPress={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }
          }}
        >
          <Text variant="footnote" weight="600" color={Colors.secondary}>
            {editing ? "Save" : "Edit Profile"}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Body Stats */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Card padding={Spacing.lg}>
          <Text variant="headline" style={styles.sectionLabel}>
            Body Stats
          </Text>
          <View style={styles.statsGrid}>
            {[
              {
                label: "Age",
                value: editAge,
                setter: setEditAge,
                unit: "years",
                display: profile.age ? `${profile.age} years` : "—",
              },
              {
                label: "Height",
                value: editHeight,
                setter: setEditHeight,
                unit: "cm",
                display: profile.heightCm ? `${profile.heightCm} cm` : "—",
              },
              {
                label: "Weight",
                value: editWeight,
                setter: setEditWeight,
                unit: "kg",
                display: profile.weightKg ? `${profile.weightKg} kg` : "—",
              },
              {
                label: "Goal",
                value: editGoalWeight,
                setter: setEditGoalWeight,
                unit: "kg",
                display: profile.goalWeightKg
                  ? `${profile.goalWeightKg} kg`
                  : "—",
              },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text variant="caption1" color={Colors.textSecondary}>
                  {stat.label}
                </Text>
                {editing ? (
                  <TextInput
                    style={styles.statInput}
                    value={stat.value}
                    onChangeText={stat.setter}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                  />
                ) : (
                  <Text variant="headline">{stat.display}</Text>
                )}
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      {/* Goals */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Card padding={Spacing.lg}>
          <Text variant="headline" style={styles.sectionLabel}>
            Daily Goals
          </Text>
          <View style={styles.goalRow}>
            <Text variant="subheadline" color={Colors.textSecondary}>
              Calories
            </Text>
            {editing ? (
              <TextInput
                style={styles.goalInput}
                value={editCalories}
                onChangeText={setEditCalories}
                keyboardType="numeric"
              />
            ) : (
              <Text variant="subheadline" weight="600">
                {profile.goals.dailyCalories} kcal
              </Text>
            )}
          </View>
          <Divider />
          <Text
            variant="footnote"
            color={Colors.textSecondary}
            style={styles.macroLabel}
          >
            Macro Split
          </Text>
          <View style={styles.macroRow}>
            {[
              {
                label: "Protein",
                color: Colors.protein,
                value: editProtein,
                setter: setEditProtein,
                display: `${profile.goals.proteinPercent}%`,
              },
              {
                label: "Carbs",
                color: Colors.carbs,
                value: editCarbs,
                setter: setEditCarbs,
                display: `${profile.goals.carbsPercent}%`,
              },
              {
                label: "Fat",
                color: Colors.fat,
                value: editFat,
                setter: setEditFat,
                display: `${profile.goals.fatPercent}%`,
              },
            ].map((macro) => (
              <View key={macro.label} style={styles.macroItem}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: macro.color },
                  ]}
                />
                <Text variant="caption1" color={Colors.textSecondary}>
                  {macro.label}
                </Text>
                {editing ? (
                  <View style={styles.macroInputRow}>
                    <TextInput
                      style={styles.macroInput}
                      value={macro.value}
                      onChangeText={macro.setter}
                      keyboardType="numeric"
                    />
                    <Text variant="caption1" color={Colors.textTertiary}>
                      %
                    </Text>
                  </View>
                ) : (
                  <Text variant="headline" color={macro.color}>
                    {macro.display}
                  </Text>
                )}
              </View>
            ))}
          </View>
          {/* Visual bar */}
          {!editing && (
            <View style={styles.macroBar}>
              <View
                style={[
                  styles.macroBarSegment,
                  {
                    flex: profile.goals.proteinPercent,
                    backgroundColor: Colors.protein,
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  },
                ]}
              />
              <View
                style={[
                  styles.macroBarSegment,
                  {
                    flex: profile.goals.carbsPercent,
                    backgroundColor: Colors.carbs,
                  },
                ]}
              />
              <View
                style={[
                  styles.macroBarSegment,
                  {
                    flex: profile.goals.fatPercent,
                    backgroundColor: Colors.fat,
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  },
                ]}
              />
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Settings */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card padding={0}>
          {settings.map((item, idx) => (
            <View key={item.label}>
              {idx > 0 && (
                <Divider
                  marginVertical={0}
                  color={Colors.borderLight}
                />
              )}
              <Pressable style={styles.settingRow} onPress={item.onPress}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text variant="subheadline" style={styles.settingLabel}>
                  {item.label}
                </Text>
                {item.value && (
                  <Text variant="footnote" color={Colors.textTertiary}>
                    {item.value}
                  </Text>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textTertiary}
                />
              </Pressable>
            </View>
          ))}
        </Card>
      </Animated.View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  profileSection: {
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nameInput: {
    ...Typography.title2,
    color: Colors.textPrimary,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingBottom: Spacing.xs,
    minWidth: 150,
  },
  editBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.secondary}15`,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statItem: {
    width: "46%",
    gap: Spacing.xs,
  },
  statInput: {
    ...Typography.headline,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalInput: {
    ...Typography.subheadline,
    color: Colors.textPrimary,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
    minWidth: 80,
    fontWeight: "600",
  },
  macroLabel: {
    marginBottom: Spacing.sm,
  },
  macroRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  macroInput: {
    ...Typography.headline,
    color: Colors.textPrimary,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
    minWidth: 40,
  },
  macroBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: Spacing.lg,
    gap: 2,
  },
  macroBarSegment: {
    height: "100%",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  settingLabel: {
    flex: 1,
  },
});
