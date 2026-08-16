import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface QuestDetail {
  quest: {
    id: string;
    title: string;
    narrative: string | null;
    estimateMinutes: number;
    xpReward: number;
    cognitiveLoad: "light" | "standard" | "heavy";
    completedAt: string | null;
  };
  steps: Array<{
    id: string;
    title: string;
    order: number;
    xpReward: number;
    completedAt: string | null;
  }>;
}

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<QuestDetail | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/quests/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDetail(data))
      .catch(() => setDetail(null));
  }, [id]);

  async function suggestSteps() {
    const res = await fetch(`${API_URL}/quests/${id}/suggest-steps`, { method: "POST" });
    if (res.ok) {
      const body = (await res.json()) as { suggestions: Array<{ text: string }> };
      setSuggestion(body.suggestions[0]?.text ?? null);
    }
  }

  const quest = detail?.quest;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {quest && (
            <View style={styles.hero}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              {quest.narrative && <Text style={styles.narrative}>{quest.narrative}</Text>}
              <Text style={styles.meta}>
                {quest.estimateMinutes} min · +{quest.xpReward} XP · {quest.cognitiveLoad}
              </Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>STEPS</Text>
          {detail?.steps.map((step) => (
            <View key={step.id} style={styles.step}>
              <View style={[styles.check, step.completedAt && styles.checkDone]} />
              <View style={styles.stepBody}>
                <Text style={[styles.stepTitle, step.completedAt && styles.done]}>
                  {step.title}
                </Text>
                <Text style={styles.stepMeta}>+{step.xpReward} XP</Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.suggestButton} onPress={suggestSteps}>
            <Text style={styles.suggestText}>SUGGEST NEXT STEPS</Text>
          </Pressable>

          {suggestion && <Text style={styles.suggestion}>{suggestion}</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 12 },
  hero: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.surface,
  },
  questTitle: { color: colors.ink, fontSize: 26, fontWeight: "700" },
  narrative: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
  meta: { color: colors.faint, fontSize: 11, fontFamily: "monospace", marginTop: 10 },
  sectionLabel: {
    color: colors.faint,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "monospace",
    marginTop: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.surface2,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.faint,
  },
  checkDone: { backgroundColor: colors.red, borderColor: colors.red },
  stepBody: { flex: 1 },
  stepTitle: { color: colors.ink, fontSize: 13, fontWeight: "600" },
  done: { color: colors.muted, textDecorationLine: "line-through" },
  stepMeta: { color: colors.redBright, fontSize: 10, fontFamily: "monospace", marginTop: 4 },
  suggestButton: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  suggestText: { color: colors.ink, fontSize: 12, letterSpacing: 2, fontFamily: "monospace" },
  suggestion: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
