import { Text, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AttributeMap } from "@ascent/types";
import { ScreenBackground, XPBar } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/ui";
import { palette } from "../../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Profile {
  totalXp: number;
  streak: number;
  attributes: AttributeMap;
}

function levelFromXp(totalXp: number) {
  return {
    level: Math.floor(totalXp / 10_000) + 1,
    xpIntoLevel: totalXp % 10_000,
    xpToNext: 10_000 - (totalXp % 10_000),
  };
}

const ATTR_ICONS = {
  STR: "Dumbbell",
  INT: "Brain",
  VIT: "HeartPulse",
  FOC: "Crosshair",
  DIS: "Shield",
  CON: "Flame",
} as const;

export default function StatusScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/profile/demo`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  const fallback: Profile = {
    totalXp: 268_420,
    streak: 0,
    attributes: { STR: 72, INT: 84, VIT: 68, FOC: 76, DIS: 61, CON: 73 },
  };
  const data = profile ?? fallback;
  const { level, xpIntoLevel, xpToNext } = levelFromXp(data.totalXp);
  const pct = Math.min(100, (xpIntoLevel / 10_000) * 100);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View flexDirection="row" alignItems="center" justifyContent="space-between">
            <View>
              <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$faint">
                Status Window
              </Text>
              <Text fontFamily="$display" fontSize="$9" fontWeight="700" color="$ink" letterSpacing={-0.5} marginTop="$1">
                Daily Quest OS
              </Text>
            </View>
            <View
              width={40}
              height={40}
              borderRadius="$3"
              borderWidth={1}
              borderColor="$stroke2"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="Bell" size={17} color={palette.muted} />
              <View
                position="absolute"
                top={8}
                right={9}
                width={7}
                height={7}
                borderRadius={99}
                backgroundColor="$accent"
              />
            </View>
          </View>

          <View
            borderWidth={1}
            borderColor="$stroke2"
            borderRadius="$5"
            padding="$4.5"
            backgroundColor="$surface"
            overflow="hidden"
            marginTop="$3"
          >
            <View flexDirection="row" alignItems="baseline" justifyContent="space-between">
              <View flexDirection="row" alignItems="baseline" gap="$2.5">
                <Text fontFamily="$mono" fontSize={20} fontWeight="700" color="$accentBright">
                  LV {level}
                </Text>
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} textTransform="uppercase" color="$muted">
                  Focused Operator
                </Text>
              </View>
              <Text fontFamily="$mono" fontSize={10} color="$faint">
                LV {level + 1} · <Text color="$accentBright" fontWeight="600">{Math.round(pct)}%</Text>
              </Text>
            </View>

            <View flexDirection="row" alignItems="baseline" justifyContent="space-between" marginTop="$3">
              <Text fontFamily="$mono" fontSize={22} fontWeight="700" color="$ink">
                {xpIntoLevel.toLocaleString()} <Text fontSize={13} fontWeight="400" color="$muted">/ 10,000 XP</Text>
              </Text>
              <Text fontFamily="$mono" fontSize={9} letterSpacing={1} textTransform="uppercase" color="$faint">
                {xpToNext.toLocaleString()} to next
              </Text>
            </View>

            <View marginTop="$3">
              <XPBar progress={pct} />
            </View>
          </View>

          <View flexDirection="row" justifyContent="space-between" marginTop="$1">
            {(Object.keys(data.attributes) as (keyof AttributeMap)[]).map((key) => (
              <View key={key} alignItems="center" gap="$1.5">
                <View
                  width={44}
                  height={44}
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$stroke"
                  backgroundColor="rgba(255,255,255,0.03)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name={ATTR_ICONS[key]} size={18} color={palette.muted} />
                </View>
                <Text fontFamily="$mono" fontSize={16} fontWeight="700" color="$ink">
                  {data.attributes[key]}
                </Text>
                <Text fontFamily="$mono" fontSize={8} letterSpacing={1} color="$faint">
                  {key}
                </Text>
              </View>
            ))}
          </View>

          <View flexDirection="row" justifyContent="space-between" borderWidth={1} borderColor="$stroke" borderRadius="$4" padding="$4">
            <View flexDirection="row" alignItems="center" gap="$2.5">
              <Icon name="Flame" size={18} color={palette.redBright} />
              <Text fontFamily="$mono" fontSize={11} letterSpacing={2} textTransform="uppercase" color="$faint">
                STREAK
              </Text>
            </View>
            <Text fontFamily="$mono" fontSize={13} color="$ink">
              {data.streak} days
            </Text>
          </View>

          <Button size="lg" marginTop="$2">
            <Icon name="Play" size={17} color={palette.white} />
            CONTINUE
          </Button>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
