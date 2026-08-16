import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";

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

const tierColor: Record<Tier, string> = {
  MUST: colors.redBright,
  SHOULD: colors.blueBright,
  OPTIONAL: colors.faint,
};

export default function TodayScreen() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/daily-plan`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPlan(data))
      .catch(() => setPlan(null));
  }, []);

  const focus = plan?.currentFocus?.quest;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Today</Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          {focus && (
            <View style={styles.focusCard}>
              <Text style={styles.focusLabel}>CURRENT FOCUS</Text>
              <Text style={styles.focusTitle}>{focus.title}</Text>
              <Text style={styles.focusMeta}>
                {focus.tier} · {focus.estimateMinutes} min
              </Text>
              {plan?.why.text ? (
                <View style={styles.why}>
                  <Text style={styles.whyLabel}>WHY THIS?</Text>
                  <Text style={styles.whyText}>{plan.why.text}</Text>
                </View>
              ) : null}
              <Pressable style={styles.continueButton}>
                <Text style={styles.continueText}>CONTINUE</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionLabel}>TODAY'S QUESTS</Text>

          {plan?.scheduled.map((quest) => (
            <View
              key={quest.id}
              style={[
                styles.quest,
                { borderLeftColor: tierColor[quest.tier] },
              ]}
            >
              <View style={styles.questBody}>
                <Text style={[styles.questTier, { color: tierColor[quest.tier] }]}>
                  {quest.tier}
                </Text>
                <Text style={[styles.questTitle, quest.completed && styles.done]}>
                  {quest.title}
                </Text>
                <Text style={styles.questMeta}>
                  {quest.estimateMinutes} min · {quest.cognitiveLoad}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "700", padding: 20 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  focusCard: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 20,
    padding: 18,
    backgroundColor: "rgba(244,66,62,0.08)",
  },
  focusLabel: {
    color: colors.redBright,
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "monospace",
  },
  focusTitle: { color: colors.ink, fontSize: 22, fontWeight: "700", marginTop: 8 },
  focusMeta: { color: colors.muted, fontSize: 12, fontFamily: "monospace", marginTop: 4 },
  why: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    paddingTop: 12,
  },
  whyLabel: { color: colors.redBright, fontSize: 9, letterSpacing: 2, fontFamily: "monospace" },
  whyText: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  continueButton: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  continueText: {
    color: "#ffffff",
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  sectionLabel: {
    color: colors.faint,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "monospace",
    marginTop: 16,
    marginBottom: 4,
  },
  quest: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.surface2,
  },
  questBody: { gap: 4 },
  questTier: {
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  questTitle: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  done: { color: colors.muted, textDecorationLine: "line-through" },
  questMeta: { color: colors.faint, fontSize: 11, fontFamily: "monospace" },
});
