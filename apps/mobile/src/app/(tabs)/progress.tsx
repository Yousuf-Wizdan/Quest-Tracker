import { Text, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AttributeMap } from "@ascent/types";
import { ScreenBackground } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { palette } from "../../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface ProgressData {
  level: number;
  totalXp: number;
  streak: number;
  attributes: AttributeMap;
  focusedHours: number;
  tasksCompleted: number;
  completionRate: number;
}

const ATTR_ICONS = {
  STR: "Dumbbell",
  INT: "Brain",
  VIT: "HeartPulse",
  FOC: "Crosshair",
  DIS: "Shield",
  CON: "Flame",
} as const;

export default function ProgressScreen() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/progress`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);

  const fallback: ProgressData = {
    level: 27,
    totalXp: 268_420,
    streak: 0,
    attributes: { STR: 72, INT: 84, VIT: 68, FOC: 76, DIS: 61, CON: 73 },
    focusedHours: 0,
    tasksCompleted: 0,
    completionRate: 0,
  };
  const d = data ?? fallback;

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Text fontFamily="$display" fontSize="$9" fontWeight="700" color="$ink">
            Progress
          </Text>

          <View borderWidth={1} borderColor="$stroke2" borderRadius="$5" padding="$4.5" backgroundColor="$surface">
            <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$accentBright">
              CHARACTER
            </Text>
            <Text fontFamily="$mono" fontSize={40} fontWeight="700" color="$ink" marginTop="$3">
              LV {d.level}
            </Text>
            <Text fontFamily="$mono" fontSize={14} color="$muted" marginTop="$1">
              {d.totalXp.toLocaleString()} XP
            </Text>
            <View flexDirection="row" alignItems="center" gap="$2" marginTop="$2.5">
              <Icon name="Flame" size={16} color={palette.redBright} />
              <Text fontFamily="$mono" fontSize={12} color="$faint">
                Streak: {d.streak} days
              </Text>
            </View>
          </View>

          <View borderWidth={1} borderColor="$stroke2" borderRadius="$5" padding="$4.5" backgroundColor="$surface">
            <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$accentBright">
              ATTRIBUTES
            </Text>
            <View flexDirection="row" justifyContent="space-between" flexWrap="wrap" gap="$2" marginTop="$3">
              {(Object.keys(d.attributes) as (keyof AttributeMap)[]).map((key) => (
                <View key={key} alignItems="center" minWidth={48}>
                  <Icon name={ATTR_ICONS[key]} size={20} color={palette.muted} />
                  <Text fontFamily="$mono" fontSize={22} fontWeight="700" color="$ink" marginTop="$1.5">
                    {d.attributes[key]}
                  </Text>
                  <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$faint">
                    {key}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View borderWidth={1} borderColor="$stroke2" borderRadius="$5" padding="$4.5" backgroundColor="$surface">
            <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$accentBright">
              PERFORMANCE
            </Text>
            <View gap="$1.5" marginTop="$3">
              <View flexDirection="row" alignItems="center" gap="$2.5">
                <Icon name="Timer" size={16} color={palette.muted} />
                <Text fontFamily="$mono" fontSize={14} color="$ink">Focused hours: {d.focusedHours}</Text>
              </View>
              <View flexDirection="row" alignItems="center" gap="$2.5">
                <Icon name="CheckCircle" size={16} color={palette.muted} />
                <Text fontFamily="$mono" fontSize={14} color="$ink">Quests completed: {d.tasksCompleted}</Text>
              </View>
              <View flexDirection="row" alignItems="center" gap="$2.5">
                <Icon name="Gauge" size={16} color={palette.muted} />
                <Text fontFamily="$mono" fontSize={14} color="$ink">Completion rate: {Math.round(d.completionRate * 100)}%</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
