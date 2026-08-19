import { Text, View } from "@tamagui/core";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AuthResponse } from "@ascent/types";
import { ScreenBackground } from "../components/ScreenBackground";
import { Icon } from "../components/Icon";
import { Button } from "../components/ui";
import { palette } from "../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const DEMO_EMAIL = "demo@ascent.app";
const DEMO_PASSWORD = "demo1234";

const inputStyle = {
  borderWidth: 1,
  borderColor: palette.stroke2,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 16,
  color: palette.ink,
  fontSize: 15,
  fontFamily: "JetBrainsMono_400Regular",
  backgroundColor: "rgba(255,255,255,0.03)",
} as const;

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
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <View paddingHorizontal="$6" paddingTop="$9">
          <View flexDirection="row" alignItems="center" gap="$3">
            <View
              width={10}
              height={10}
              borderRadius={99}
              backgroundColor="$accent"
              shadowColor="$accent"
              shadowOpacity={0.9}
              shadowRadius={12}
            />
            <Text
              fontFamily="$mono"
              fontSize={11}
              letterSpacing={4}
              textTransform="uppercase"
              color="$faint"
            >
              Status Window
            </Text>
          </View>

          <Text
            fontFamily="$display"
            fontSize="$11"
            fontWeight="700"
            letterSpacing={4}
            color="$ink"
            marginTop="$6"
          >
            ASCENT
          </Text>
          <Text
            fontFamily="$serif"
            fontSize={14}
            fontStyle="italic"
            color="$muted"
            marginTop="$2"
          >
            Daily Quest OS
          </Text>

          <View gap="$2.5" marginTop="$9">
            <Text fontFamily="$mono" fontSize={11} letterSpacing={3} textTransform="uppercase" color="$faint">
              EMAIL
            </Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text fontFamily="$mono" fontSize={11} letterSpacing={3} textTransform="uppercase" color="$faint" marginTop="$2">
              PASSWORD
            </Text>
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View gap="$2.5" marginTop="$6">
              <Button onPress={() => submit("login")} disabled={busy}>
                <Icon name="LogIn" size={17} color={palette.white} />
                SIGN IN
              </Button>
              <Button variant="ghost" onPress={() => submit("signup")} disabled={busy}>
                CREATE ACCOUNT
              </Button>
            </View>
          </View>

          <Pressable style={styles.demo} onPress={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}>
            <View flexDirection="row" alignItems="center" gap="$2">
              <Icon name="Zap" size={14} color={palette.redBright} />
              <Text fontFamily="$mono" fontSize={10} letterSpacing={3} textTransform="uppercase" color="$accentBright">
                DEMO ACCOUNT
              </Text>
            </View>
            <Text fontFamily="$mono" fontSize={13} color="$muted" marginTop="$2">
              {DEMO_EMAIL}
            </Text>
            <Text fontFamily="$mono" fontSize={13} color="$muted">
              {DEMO_PASSWORD}
            </Text>
          </Pressable>

          {message && (
            <Text fontFamily="$mono" fontSize={13} color="$faint" textAlign="center" marginTop="$5">
              {message}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  demo: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: "rgba(244,66,62,0.35)",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(244,66,62,0.08)",
  },
});
