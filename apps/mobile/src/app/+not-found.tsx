import { Stack, useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@/components/ui";
import { Colors, Spacing } from "@/constants/theme";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text variant="title2" align="center">
          Page not found
        </Text>
        <Button title="Go Home" onPress={() => router.replace("/")} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    backgroundColor: Colors.background,
  },
});
