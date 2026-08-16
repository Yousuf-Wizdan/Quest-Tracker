import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AttributeMap } from "@ascent/types";
import { colors } from "../../theme";

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

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>Status Window</Text>
          <Text style={styles.title}>Daily Quest OS</Text>

          <View style={styles.ribbon}>
            <View style={styles.ribbonTop}>
              <Text style={styles.levelTag}>LV {level}</Text>
              <Text style={styles.next}>LV {level + 1} · {Math.round((xpIntoLevel / 10_000) * 100)}%</Text>
            </View>
            <Text style={styles.xp}>
              {xpIntoLevel.toLocaleString()} <Text style={styles.xpDim}>/ 10,000 XP</Text>
            </Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${Math.min(100, (xpIntoLevel / 10_000) * 100)}%` }]} />
            </View>
          </View>

          <View style={styles.attrs}>
            {(Object.keys(data.attributes) as Array<keyof AttributeMap>).map((key) => (
              <View key={key} style={styles.attr}>
                <Text style={styles.attrValue}>{data.attributes[key]}</Text>
                <Text style={styles.attrLabel}>{key}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STREAK</Text>
            <Text style={styles.statusValue}>{data.streak} days</Text>
          </View>

          <Pressable style={styles.button} onPress={() => undefined}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    color: colors.faint,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "monospace",
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  ribbon: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.surface,
    marginTop: 12,
  },
  ribbonTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  levelTag: {
    color: colors.redBright,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  next: {
    color: colors.faint,
    fontSize: 11,
    fontFamily: "monospace",
  },
  xp: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 8,
  },
  xpDim: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "400",
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginTop: 12,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.red,
    borderRadius: 4,
  },
  attrs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  attr: {
    alignItems: "center",
  },
  attrValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  attrLabel: {
    color: colors.faint,
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 14,
    padding: 16,
  },
  statusLabel: {
    color: colors.faint,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  statusValue: {
    color: colors.ink,
    fontSize: 13,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "700",
    fontFamily: "monospace",
  },
});
