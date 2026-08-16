import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";
import { createFocusSessionState, pause, resume, end, complete, tick } from "../focus-session";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function FocusModeScreen() {
  const stateRef = useRef(createFocusSessionState({ targetMs: 90 * 60_000 }));
  const [, forceRender] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      stateRef.current = tick(stateRef.current, 1_000);
      forceRender((n) => n + 1);
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  const state = stateRef.current;
  const minutes = Math.floor(state.elapsedMs / 60_000);
  const seconds = Math.floor((state.elapsedMs % 60_000) / 1_000);

  async function sync() {
    try {
      await fetch(`${API_URL}/focus/end`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: "demo-session",
          focusedMinutes: Math.floor(state.elapsedMs / 60_000),
          xpEarned: 0,
        }),
      });
    } catch {
      // offline: timer state remains local and syncs on next transition
    }
  }

  function onPause() {
    stateRef.current = pause(stateRef.current);
    forceRender((n) => n + 1);
    void sync();
  }

  function onResume() {
    stateRef.current = resume(stateRef.current);
    forceRender((n) => n + 1);
  }

  function onEnd() {
    stateRef.current = end(stateRef.current);
    forceRender((n) => n + 1);
    void sync();
  }

  function onComplete() {
    stateRef.current = complete(stateRef.current);
    forceRender((n) => n + 1);
    void sync();
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.label}>FOCUS MODE</Text>
        <Text style={styles.timer}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>
        <Text style={styles.status}>{state.status.toUpperCase()}</Text>

        <View style={styles.controls}>
          {state.status === "running" && (
            <Pressable style={styles.button} onPress={onPause}>
              <Text style={styles.buttonText}>PAUSE</Text>
            </Pressable>
          )}
          {state.status === "paused" && (
            <Pressable style={styles.button} onPress={onResume}>
              <Text style={styles.buttonText}>RESUME</Text>
            </Pressable>
          )}
          <Pressable style={[styles.button, styles.endButton]} onPress={onEnd}>
            <Text style={styles.buttonText}>END</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.completeButton]} onPress={onComplete}>
            <Text style={styles.buttonText}>COMPLETE</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, padding: 20, justifyContent: "center", gap: 16 },
  label: {
    color: colors.redBright,
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: "monospace",
  },
  timer: {
    color: colors.ink,
    fontSize: 64,
    fontWeight: "700",
    fontFamily: "monospace",
    fontVariant: ["tabular-nums"],
  },
  status: { color: colors.faint, fontSize: 13, fontFamily: "monospace" },
  controls: { flexDirection: "row", gap: 10, marginTop: 24 },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  endButton: { borderColor: colors.red, backgroundColor: "rgba(244,66,62,0.08)" },
  completeButton: { backgroundColor: colors.red, borderColor: colors.red },
  buttonText: { color: colors.ink, fontSize: 12, letterSpacing: 2, fontFamily: "monospace" },
});
