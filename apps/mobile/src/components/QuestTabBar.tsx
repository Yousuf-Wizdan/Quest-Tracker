import { Text, View } from "@tamagui/core";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { palette } from "../palette";

const TAB_ICONS: Record<string, IconName> = {
  status: "Activity",
  today: "LayoutGrid",
  capture: "Plus",
  progress: "ChartColumn",
  goals: "Sparkles",
};

function TabItem({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress: () => void;
}) {
  const color = focused ? palette.redBright : palette.faint;
  return (
    <Pressable style={styles.tab} onPress={onPress} accessibilityRole="button">
      <Icon name={icon} size={20} color={color} strokeWidth={focused ? 2 : 1.7} />
      <Text
        fontFamily="$mono"
        fontSize={9}
        letterSpacing={1}
        textTransform="uppercase"
        color={focused ? "$accentBright" : "$faint"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CaptureTab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.capture} onPress={onPress} accessibilityRole="button">
      <View style={styles.captureCore}>
        <Text fontFamily="$display" fontWeight="700" fontSize={22} color="$white">
          +
        </Text>
      </View>
      <Text
        fontFamily="$mono"
        fontSize={9}
        letterSpacing={1}
        textTransform="uppercase"
        color="$ink"
      >
        Capture
      </Text>
    </Pressable>
  );
}

export function QuestTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bg = palette.bg;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 14),
          backgroundColor: bg,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        if (route.name === "capture") {
          return (
            <CaptureTab
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        }
        return (
          <TabItem
            key={route.key}
            label={route.name}
            icon={TAB_ICONS[route.name] ?? "Circle"}
            focused={focused}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  capture: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  captureCore: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f0443e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowColor: "#f0443e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 10,
  },
});
