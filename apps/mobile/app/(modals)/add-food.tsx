import { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Text, Card, Button } from "@/components/ui";
import { useNutritionStore } from "@/store/nutritionStore";
import { generateId } from "@/utils";
import type { MealType, FoodItem } from "@/types";

type Tab = "search" | "manual" | "camera";

const QUICK_FOODS: FoodItem[] = [
  {
    id: "qf-1",
    name: "Chicken Breast (100g)",
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    id: "qf-2",
    name: "Brown Rice (150g)",
    macros: { calories: 170, protein: 4, carbs: 36, fat: 1.4 },
  },
  {
    id: "qf-3",
    name: "Banana",
    macros: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  },
  {
    id: "qf-4",
    name: "Egg (1 large)",
    macros: { calories: 72, protein: 6, carbs: 0.4, fat: 5 },
  },
  {
    id: "qf-5",
    name: "Whey Protein (1 scoop)",
    macros: { calories: 120, protein: 25, carbs: 3, fat: 1 },
  },
  {
    id: "qf-6",
    name: "Oatmeal (50g)",
    macros: { calories: 190, protein: 7, carbs: 34, fat: 3.5 },
  },
  {
    id: "qf-7",
    name: "Sweet Potato (200g)",
    macros: { calories: 180, protein: 3, carbs: 41, fat: 0.2 },
  },
  {
    id: "qf-8",
    name: "Greek Yogurt (170g)",
    macros: { calories: 100, protein: 17, carbs: 6, fat: 0.7 },
  },
];

export default function AddFoodModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addFoodToMeal = useNutritionStore((s) => s.addFoodToMeal);

  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<FoodItem | null>(null);

  // Manual entry fields
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  const filteredFoods = searchQuery
    ? QUICK_FOODS.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : QUICK_FOODS;

  const handleAddFood = useCallback(
    (food: FoodItem) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addFoodToMeal(selectedMeal, { ...food, id: generateId() });
      router.back();
    },
    [selectedMeal, addFoodToMeal, router],
  );

  const handleManualAdd = useCallback(() => {
    if (!manualName.trim()) return;
    const food: FoodItem = {
      id: generateId(),
      name: manualName.trim(),
      macros: {
        calories: Number(manualCal) || 0,
        protein: Number(manualProtein) || 0,
        carbs: Number(manualCarbs) || 0,
        fat: Number(manualFat) || 0,
      },
    };
    handleAddFood(food);
  }, [manualName, manualCal, manualProtein, manualCarbs, manualFat, handleAddFood]);

  const handleCamera = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled) return;

    setAnalyzing(true);

    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      setAiResult({
        id: generateId(),
        name: "Grilled Chicken Salad",
        macros: { calories: 350, protein: 42, carbs: 12, fat: 14 },
        imageUri: result.assets[0]?.uri,
        aiAnalyzed: true,
      });
    }, 2500);
  }, []);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled) return;

    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAiResult({
        id: generateId(),
        name: "Mixed Plate",
        macros: { calories: 520, protein: 35, carbs: 48, fat: 18 },
        imageUri: result.assets[0]?.uri,
        aiAnalyzed: true,
      });
    }, 2500);
  }, []);

  const mealTypes: { type: MealType; label: string }[] = [
    { type: "breakfast", label: "Breakfast" },
    { type: "lunch", label: "Lunch" },
    { type: "dinner", label: "Dinner" },
    { type: "snack", label: "Snack" },
  ];

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "search", label: "Search", icon: "search-outline" },
    { key: "manual", label: "Manual", icon: "create-outline" },
    { key: "camera", label: "Camera", icon: "camera-outline" },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text variant="title3">Add Food</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close-circle-outline" size={28} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Meal selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealSelector}
      >
        {mealTypes.map((m) => (
          <Pressable
            key={m.type}
            style={[
              styles.mealPill,
              selectedMeal === m.type && styles.mealPillActive,
            ]}
            onPress={() => setSelectedMeal(m.type)}
          >
            <Text
              variant="footnote"
              weight="600"
              color={selectedMeal === m.type ? Colors.white : Colors.textSecondary}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? Colors.primary : Colors.textTertiary}
            />
            <Text
              variant="caption1"
              weight="600"
              color={activeTab === tab.key ? Colors.primary : Colors.textTertiary}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "search" && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </Pressable>
              )}
            </View>
            <View style={styles.foodList}>
              {filteredFoods.map((food, idx) => (
                <Animated.View
                  key={food.id}
                  entering={FadeInDown.delay(idx * 40).springify()}
                >
                  <Pressable
                    style={styles.foodItem}
                    onPress={() => handleAddFood(food)}
                  >
                    <View style={styles.foodInfo}>
                      <Text variant="subheadline" weight="500">
                        {food.name}
                      </Text>
                      <Text variant="caption1" color={Colors.textSecondary}>
                        P: {Math.round(food.macros.protein)}g · C:{" "}
                        {Math.round(food.macros.carbs)}g · F:{" "}
                        {Math.round(food.macros.fat)}g
                      </Text>
                    </View>
                    <Text variant="subheadline" weight="600" color={Colors.secondary}>
                      {food.macros.calories} kcal
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {activeTab === "manual" && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.manualForm}>
            <View style={styles.inputGroup}>
              <Text variant="caption1" color={Colors.textSecondary}>
                Food Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grilled Chicken"
                placeholderTextColor={Colors.textTertiary}
                value={manualName}
                onChangeText={setManualName}
              />
            </View>
            <View style={styles.macroRow}>
              {[
                { label: "Calories", value: manualCal, setter: setManualCal, unit: "kcal" },
                { label: "Protein", value: manualProtein, setter: setManualProtein, unit: "g" },
                { label: "Carbs", value: manualCarbs, setter: setManualCarbs, unit: "g" },
                { label: "Fat", value: manualFat, setter: setManualFat, unit: "g" },
              ].map((field) => (
                <View key={field.label} style={styles.macroInput}>
                  <Text variant="caption2" color={Colors.textSecondary}>
                    {field.label}
                  </Text>
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={field.setter}
                  />
                </View>
              ))}
            </View>
            <Button
              title="Add Food"
              onPress={handleManualAdd}
              fullWidth
              disabled={!manualName.trim()}
            />
          </Animated.View>
        )}

        {activeTab === "camera" && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.cameraTab}>
            {analyzing ? (
              <View style={styles.analyzing}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                <Text variant="headline" align="center" style={styles.analyzingText}>
                  Analyzing your food...
                </Text>
                <Text variant="footnote" color={Colors.textSecondary} align="center">
                  AI is identifying nutrients from your photo
                </Text>
              </View>
            ) : aiResult ? (
              <View style={styles.aiResult}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={24} color={Colors.secondary} />
                  <Text variant="headline">AI Analysis Result</Text>
                </View>
                <Card padding={Spacing.lg}>
                  <Text variant="subheadline" weight="600">
                    {aiResult.name}
                  </Text>
                  <View style={styles.aiMacros}>
                    {[
                      { label: "Calories", value: `${aiResult.macros.calories} kcal`, color: Colors.calories },
                      { label: "Protein", value: `${aiResult.macros.protein}g`, color: Colors.protein },
                      { label: "Carbs", value: `${aiResult.macros.carbs}g`, color: Colors.carbs },
                      { label: "Fat", value: `${aiResult.macros.fat}g`, color: Colors.fat },
                    ].map((m) => (
                      <View key={m.label} style={styles.aiMacroItem}>
                        <View style={[styles.macDot, { backgroundColor: m.color }]} />
                        <Text variant="caption1" color={Colors.textSecondary}>
                          {m.label}
                        </Text>
                        <Text variant="footnote" weight="600">
                          {m.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
                <View style={styles.aiActions}>
                  <Button
                    title="Add to Log"
                    onPress={() => handleAddFood(aiResult)}
                    fullWidth
                  />
                  <Button
                    title="Retake Photo"
                    variant="ghost"
                    onPress={() => {
                      setAiResult(null);
                      handleCamera();
                    }}
                    fullWidth
                  />
                </View>
              </View>
            ) : (
              <View style={styles.cameraActions}>
                <Ionicons
                  name="camera-outline"
                  size={64}
                  color={Colors.textTertiary}
                />
                <Text
                  variant="subheadline"
                  color={Colors.textSecondary}
                  align="center"
                >
                  Take a photo of your food and let AI analyze the nutrients
                </Text>
                <View style={styles.cameraButtons}>
                  <Button
                    title="Take Photo"
                    icon={<Ionicons name="camera" size={18} color={Colors.white} />}
                    onPress={handleCamera}
                    fullWidth
                  />
                  <Button
                    title="Choose from Library"
                    variant="secondary"
                    icon={<Ionicons name="images-outline" size={18} color={Colors.primary} />}
                    onPress={handlePickImage}
                    fullWidth
                  />
                </View>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  mealSelector: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  mealPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  foodList: {
    gap: Spacing.xs,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  foodInfo: {
    flex: 1,
    gap: 2,
  },
  manualForm: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  macroRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  macroInput: {
    flex: 1,
    gap: Spacing.xs,
  },
  inputSmall: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.callout,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  cameraTab: {
    paddingTop: Spacing.xxl,
  },
  cameraActions: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  cameraButtons: {
    width: "100%",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  analyzing: {
    alignItems: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.huge,
  },
  analyzingText: {
    marginTop: Spacing.md,
  },
  aiResult: {
    gap: Spacing.lg,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  aiMacros: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  aiMacroItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  macDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiActions: {
    gap: Spacing.sm,
  },
});
