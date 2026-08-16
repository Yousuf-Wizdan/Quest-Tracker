import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AttributeMap } from "@ascent/types";
import { colors } from "../../theme";

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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Progress</Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>CHARACTER</Text>
            <Text style={styles.level}>LV {d.level}</Text>
            <Text style={styles.xp}>{d.totalXp.toLocaleString()} XP</Text>
            <Text style={styles.streak}>Streak: {d.streak} days</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>ATTRIBUTES</Text>
            <View style={styles.attrGrid}>
              {(Object.keys(d.attributes) as Array<keyof AttributeMap>).map((key) => (
                <View key={key} style={styles.attr}>
                  <Text style={styles.attrValue}>{d.attributes[key]}</Text>
                  <Text style={styles.attrLabel}>{key}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>PERFORMANCE</Text>
            <Text style={styles.perf}>Focused hours: {d.focusedHours}</Text>
            <Text style={styles.perf}>Quests completed: {d.tasksCompleted}</Text>
            <Text style={styles.perf}>Completion rate: {Math.round(d.completionRate * 100)}%</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "700", padding: 20 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  card: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.surface,
  },
  cardLabel: {
    color: colors.redBright,
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "monospace",
    marginBottom: 12,
  },
  level: { color: colors.ink, fontSize: 40, fontWeight: "700", fontFamily: "monospace" },
  xp: { color: colors.muted, fontSize: 14, fontFamily: "monospace", marginTop: 4 },
  streak: { color: colors.faint, fontSize: 12, fontFamily: "monospace", marginTop: 8 },
  attrGrid: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  attr: { alignItems: "center", minWidth: 48 },
  attrValue: { color: colors.ink, fontSize: 22, fontWeight: "700", fontFamily: "monospace" },
  attrLabel: { color: colors.faint, fontSize: 10, letterSpacing: 1, fontFamily: "monospace" },
  perf: { color: colors.ink, fontSize: 14, fontFamily: "monospace", marginTop: 6 },
});
