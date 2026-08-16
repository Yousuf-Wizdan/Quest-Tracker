import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { HealthResponse } from "@ascent/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type State =
  | { kind: "checking" }
  | { kind: "online"; health: HealthResponse }
  | { kind: "offline"; health: HealthResponse }
  | { kind: "error"; message: string };

export default function HomeScreen() {
  const [state, setState] = useState<State>({ kind: "checking" });

  const check = useCallback(async () => {
    setState({ kind: "checking" });
    try {
      const res = await fetch(`${API_URL}/health`);
      const health = (await res.json()) as HealthResponse;
      setState(health.status === "online" ? { kind: "online", health } : { kind: "offline", health });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const isOnline = state.kind === "online";

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.brand}>ASCENT</Text>
        <Text style={styles.eyebrow}>Daily Quest OS</Text>

        <View style={styles.panel}>
          <View style={styles.row}>
            <Text style={styles.label}>SYSTEM</Text>
            <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.status}>{isOnline ? "online" : "offline"}</Text>
          </View>

          {state.kind === "online" && (
            <Text style={styles.detail}>
              database {state.health.database} · {new Date(state.health.timestamp).toLocaleTimeString()}
            </Text>
          )}
          {state.kind === "offline" && (
            <Text style={styles.detail}>database unavailable</Text>
          )}
          {state.kind === "checking" && <Text style={styles.detail}>checking connection…</Text>}
          {state.kind === "error" && <Text style={styles.detail}>unreachable: {state.message}</Text>}
        </View>

        <Pressable style={styles.button} onPress={check}>
          <Text style={styles.buttonText}>CHECK AGAIN</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  brand: {
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 4,
    fontFamily: "monospace",
  },
  eyebrow: {
    color: "#5c5c6b",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginBottom: 32,
  },
  panel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#5c5c6b",
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "monospace",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: "#f0443e",
  },
  dotOffline: {
    backgroundColor: "#5c5c6b",
  },
  status: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "monospace",
  },
  detail: {
    color: "#8a8a96",
    fontSize: 12,
    fontFamily: "monospace",
  },
  button: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    letterSpacing: 3,
    fontFamily: "monospace",
  },
});
