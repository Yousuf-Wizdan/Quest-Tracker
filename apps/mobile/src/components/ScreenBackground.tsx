import { View } from "@tamagui/core";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SpiderWebBackground } from "./SpiderWebBackground";
import { palette } from "../palette";

export function ScreenBackground({ children }: { children?: ReactNode }) {
  return (
    <View flex={1} backgroundColor="$background">
      <SpiderWebBackground style={StyleSheet.absoluteFill} />
      <View flex={1}>{children}</View>
    </View>
  );
}

export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <View
      borderWidth={1}
      borderColor="$stroke2"
      borderRadius="$5"
      backgroundColor="$surface"
      overflow="hidden"
    >
      {children}
    </View>
  );
}

export function XPBar({ progress }: { progress: number }) {
  return (
    <View
      height={8}
      borderRadius={4}
      backgroundColor="rgba(255,255,255,0.08)"
      overflow="hidden"
    >
      <View
        height="100%"
        width={`${Math.min(100, Math.max(0, progress))}%` as `${number}%`}
        backgroundColor={palette.redBright}
        borderRadius={4}
      />
    </View>
  );
}
