import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(modals)/add-food"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="(modals)/exercise-library"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="(modals)/workout-detail"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="(modals)/active-workout"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(modals)/plan-picker"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
