import { TamaguiProvider } from "@tamagui/core";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { tamaguiConfig } from "../tamagui.config";
import { useAppFonts } from "../fonts";

export default function RootLayout() {
  const ready = useAppFonts();

  if (!ready) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quest/[id]" />
          <Stack.Screen name="focus" />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
