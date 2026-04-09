import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text } from "@/components/ui";
import type { WorkoutSet } from "@/types";

type SetRowProps = {
  set: WorkoutSet;
  index: number;
  onToggle: () => void;
  onUpdateWeight: (value: number) => void;
  onUpdateReps: (value: number) => void;
  editable?: boolean;
};

export function SetRow({
  set,
  index,
  onToggle,
  onUpdateWeight,
  onUpdateReps,
  editable = true,
}: SetRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.95, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 });
    }, 100);
    onToggle();
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 50)} style={animatedStyle}>
      <View style={[styles.row, set.completed && styles.rowCompleted]}>
        <View
          style={[
            styles.setNumber,
            set.completed && styles.setNumberCompleted,
          ]}
        >
          <Text
            variant="caption1"
            weight="600"
            color={set.completed ? Colors.white : Colors.textSecondary}
          >
            {index + 1}
          </Text>
        </View>

        <View style={styles.field}>
          <Text variant="caption2" color={Colors.textTertiary}>
            KG
          </Text>
          {editable && !set.completed ? (
            <TextInput
              style={styles.input}
              value={set.weight > 0 ? String(set.weight) : ""}
              onChangeText={(text) => {
                const num = parseFloat(text) || 0;
                onUpdateWeight(num);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              selectTextOnFocus
            />
          ) : (
            <Text
              variant="subheadline"
              weight="600"
              color={
                set.completed ? Colors.textTertiary : Colors.textPrimary
              }
              style={set.completed ? styles.strikethrough : undefined}
            >
              {set.weight}
            </Text>
          )}
        </View>

        <Text variant="caption1" color={Colors.textTertiary}>
          x
        </Text>

        <View style={styles.field}>
          <Text variant="caption2" color={Colors.textTertiary}>
            REPS
          </Text>
          {editable && !set.completed ? (
            <TextInput
              style={styles.input}
              value={String(set.reps)}
              onChangeText={(text) => {
                const num = parseInt(text, 10) || 0;
                onUpdateReps(num);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              selectTextOnFocus
            />
          ) : (
            <Text
              variant="subheadline"
              weight="600"
              color={
                set.completed ? Colors.textTertiary : Colors.textPrimary
              }
              style={set.completed ? styles.strikethrough : undefined}
            >
              {set.reps}
            </Text>
          )}
        </View>

        <Pressable onPress={handleToggle} style={styles.checkBtn}>
          <Ionicons
            name={set.completed ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={set.completed ? Colors.success : Colors.textTertiary}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  rowCompleted: {
    opacity: 0.6,
  },
  setNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberCompleted: {
    backgroundColor: Colors.success,
  },
  field: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  input: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    minWidth: 50,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  checkBtn: {
    padding: Spacing.xs,
  },
});
