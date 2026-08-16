import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AuthResponse } from "@ascent/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const DEMO_EMAIL = "demo@ascent.app";
const DEMO_PASSWORD = "demo1234";

export default function LoginScreen() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(mode: "login" | "signup") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const auth = (await res.json()) as AuthResponse;
        setMessage(`Signed in as ${auth.user.email}`);
        router.replace("/(tabs)/status");
      } else {
        const body = (await res.json()) as { error?: string };
        setMessage(body.error ?? "Authentication failed");
      }
    } catch {
      setMessage("API unreachable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.brand}>ASCENT</Text>
        <Text style={styles.eyebrow}>Daily Quest OS</Text>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.button, styles.primary]}
            onPress={() => submit("login")}
            disabled={busy}
          >
            <Text style={styles.buttonText}>SIGN IN</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.ghost]}
            onPress={() => submit("signup")}
            disabled={busy}
          >
            <Text style={styles.ghostText}>CREATE ACCOUNT</Text>
          </Pressable>
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoLabel}>DEMO ACCOUNT</Text>
          <Text style={styles.demoValue}>{DEMO_EMAIL}</Text>
          <Text style={styles.demoValue}>{DEMO_PASSWORD}</Text>
        </View>

        {message && <Text style={styles.message}>{message}</Text>}
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
    paddingHorizontal: 24,
    paddingTop: 48,
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
    marginBottom: 40,
  },
  form: {
    gap: 10,
  },
  label: {
    color: "#5c5c6b",
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "monospace",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#f0443e",
  },
  ghost: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  ghostText: {
    color: "#ffffff",
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  demo: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: "rgba(244,66,62,0.35)",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(244,66,62,0.08)",
  },
  demoLabel: {
    color: "#f0443e",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginBottom: 6,
  },
  demoValue: {
    color: "#d9d9e3",
    fontSize: 13,
    fontFamily: "monospace",
  },
  message: {
    marginTop: 20,
    color: "#8a8a96",
    fontSize: 13,
    fontFamily: "monospace",
    textAlign: "center",
  },
});
