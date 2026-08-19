import { Text, View, styled } from "@tamagui/core";
import { useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/ui";
import { palette } from "../../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Tier = "MUST" | "SHOULD" | "OPTIONAL";

interface DailyQuest {
  id: string;
  title: string;
  estimateMinutes: number;
  cognitiveLoad: "light" | "standard" | "heavy";
  completed: boolean;
  tier: Tier;
  impactScore: number;
}

interface DailyPlan {
  scheduled: DailyQuest[];
  currentFocus: { quest: DailyQuest; reason: string } | null;
  why: { source: string; text: string };
}

interface ReplanResponse {
  decisions: { questId: string; outcome: string }[];
  systemMessage: { text: string; source: string };
}

const tierColor: Record<Tier, string> = {
  MUST: palette.redBright,
  SHOULD: palette.blueBright,
  OPTIONAL: palette.faint,
};

const TIER_ICONS: Record<Tier, "Sparkle" | "Layers" | "Circle"> = {
  MUST: "Sparkle",
  SHOULD: "Layers",
  OPTIONAL: "Circle",
};

const QuestTile = styled(Pressable, {
  flexDirection: "row",
  alignItems: "center",
  gap: "$3",
  borderWidth: 1,
  borderColor: "$stroke",
  borderRadius: "$4",
  paddingVertical: "$3",
  paddingHorizontal: "$3",
  backgroundColor: "$surface2",
  pressStyle: { transform: [{ translateY: -2 }] },
});

export default function TodayScreen() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [replan, setReplan] = useState<ReplanResponse | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/daily-plan`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPlan(data))
      .catch(() => setPlan(null));
  }, []);

  async function triggerReplan() {
    const res = await fetch(`${API_URL}/replan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scheduled: plan?.scheduled ?? [],
        remainingBudgetMinutes: 100,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as ReplanResponse;
      setReplan(data);
    }
  }

  const focus = plan?.currentFocus?.quest;

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 12 }}>
          <View flexDirection="row" alignItems="center" justifyContent="space-between">
            <View>
              <Text fontFamily="$display" fontSize="$9" fontWeight="700" color="$ink">
                Today
              </Text>
              <Text fontFamily="$serif" fontSize={12} fontStyle="italic" color="$muted" marginTop="$1">
                Mon · Aug 16 · Day 214
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
              <View position="absolute" top={8} right={9} width={7} height={7} borderRadius={99} backgroundColor="$accent" />
            </View>
          </View>

          {focus && (
            <View
              borderWidth={1}
              borderColor="$stroke2"
              borderRadius="$5"
              padding="$4.5"
              backgroundColor="$surface"
              overflow="hidden"
              marginTop="$2"
            >
              <View flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$accentBright">
                  Current Focus
                </Text>
                <View borderWidth={1} borderColor="$stroke2" borderRadius="$6" paddingVertical="$1" paddingHorizontal="$2.5">
                  <Text fontFamily="$mono" fontSize={9} color="$muted">
                    Reward <Text color="$accentBright" fontWeight="600">+180 XP</Text>
                  </Text>
                </View>
              </View>

              <Text fontFamily="$serif" fontSize={24} fontWeight="500" color="$ink" lineHeight={28} marginTop="$4">
                {focus.title}
              </Text>
              <Text fontFamily="$mono" fontSize={10} color="$faint" marginTop="$2">
                {focus.tier} · {focus.estimateMinutes} min · 72% complete
              </Text>

              <View flexDirection="row" gap="$2.5" alignItems="flex-start" marginTop="$4" borderTopWidth={1} borderTopColor="$stroke" paddingTop="$4">
                <View width={28} height={28} borderRadius="$2" backgroundColor="$accentTint" borderWidth={1} borderColor="$accent" alignItems="center" justifyContent="center">
                  <Icon name="Eye" size={13} color={palette.redBright} />
                </View>
                <View flex={1}>
                  <Text fontFamily="$mono" fontSize={8} letterSpacing={2} textTransform="uppercase" color="$accentBright">
                    Why this?
                  </Text>
                  <Text fontFamily="$serif" fontSize={12} color="$muted" lineHeight={18} marginTop="$1">
                    {plan?.why.text}
                  </Text>
                </View>
              </View>

              <Button marginTop="$4">
                <Icon name="Play" size={17} color={palette.white} />
                CONTINUE
              </Button>
            </View>
          )}

          <View flexDirection="row" alignItems="baseline" justifyContent="space-between" marginTop="$2">
            <Text fontFamily="$display" fontSize={14} fontWeight="700" color="$ink">
              Today&apos;s Quests
            </Text>
            <Text fontFamily="$mono" fontSize={8} letterSpacing={1} textTransform="uppercase" color="$faint">
              Must → Should → Optional
            </Text>
          </View>

          {replan && (
            <View borderWidth={1} borderStyle="dashed" borderColor="$accent" borderRadius="$4" padding="$3.5" backgroundColor="$accentTint">
              <Text fontFamily="$mono" fontSize={10} letterSpacing={2} textTransform="uppercase" color="$accentBright">
                ADAPTIVE REPLAN
              </Text>
              <Text fontFamily="$serif" fontSize={12} color="$ink" lineHeight={18} marginTop="$1.5">
                {replan.systemMessage.text}
              </Text>
              <View flexDirection="row" flexWrap="wrap" gap="$1.5" marginTop="$2.5">
                {replan.decisions.map((d) => (
                  <Text key={d.questId} fontFamily="$mono" fontSize={9} letterSpacing={1} color="$muted" borderWidth={1} borderColor="$stroke" borderRadius="$2" paddingVertical="$1" paddingHorizontal="$2">
                    {d.outcome}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Pressable onPress={triggerReplan} style={{ borderWidth: 1, borderColor: palette.stroke2, borderRadius: 12, paddingVertical: 10, alignItems: "center" }}>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$muted">
              TRIGGER REPLAN
            </Text>
          </Pressable>

          <View flexDirection="row" flexWrap="wrap" gap="$2.5">
            {plan?.scheduled.map((quest) => (
              <QuestTile key={quest.id} style={{ width: "48%" }}>
                <View
                  width={36}
                  height={36}
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={quest.completed ? palette.red : "rgba(255,255,255,0.03)"}
                  borderWidth={1}
                  borderColor={quest.completed ? palette.red : palette.stroke}
                >
                  <Icon name={TIER_ICONS[quest.tier]} size={17} color={quest.completed ? palette.white : tierColor[quest.tier]} />
                </View>
                <View flex={1}>
                  <Text fontFamily="$display" fontSize={13} fontWeight="600" color={quest.completed ? "$muted" : "$ink"} numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <Text fontFamily="$mono" fontSize={8} color="$faint" marginTop="$1" numberOfLines={1}>
                    {quest.tier} · {quest.estimateMinutes} min
                  </Text>
                </View>
              </QuestTile>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
