import { Text, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground } from "../components/ScreenBackground";
import { Icon } from "../components/Icon";
import { Button } from "../components/ui";
import { palette } from "../palette";
import {
  createFocusSessionState,
  pause,
  resume,
  end,
  complete,
  tick,
  type FocusSessionState,
} from "../focus-session";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function FocusModeScreen() {
  const [state, setState] = useState<FocusSessionState>(() =>
    createFocusSessionState({ targetMs: 90 * 60_000 }),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setState((current) => tick(current, 1_000));
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(state.elapsedMs / 60_000);
  const seconds = Math.floor((state.elapsedMs % 60_000) / 1_000);

  async function sync(next: FocusSessionState) {
    try {
      await fetch(`${API_URL}/focus/end`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: "demo-session",
          focusedMinutes: Math.floor(next.elapsedMs / 60_000),
          xpEarned: 0,
        }),
      });
    } catch {
      // offline: timer state remains local and syncs on next transition
    }
  }

  function onPause() {
    setState((current) => {
      const next = pause(current);
      void sync(next);
      return next;
    });
  }

  function onResume() {
    setState(resume);
  }

  function onEnd() {
    setState((current) => {
      const next = end(current);
      void sync(next);
      return next;
    });
  }

  function onComplete() {
    setState((current) => {
      const next = complete(current);
      void sync(next);
      return next;
    });
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: "center", gap: 16 }}>
        <View flexDirection="row" alignItems="center" gap="$2.5">
          <View width={8} height={8} borderRadius={99} backgroundColor="$accent" />
          <Text fontFamily="$mono" fontSize={11} letterSpacing={3} textTransform="uppercase" color="$accentBright">
            FOCUS MODE
          </Text>
        </View>

        <Text fontFamily="$mono" fontSize={64} fontWeight="700" color="$ink" fontVariant={["tabular-nums"]}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>
        <Text fontFamily="$mono" fontSize={13} color="$faint" textTransform="uppercase" letterSpacing={2}>
          {state.status}
        </Text>

        <View flexDirection="row" gap="$2.5" marginTop="$6">
          {state.status === "running" && (
            <Button variant="ghost" onPress={onPause} flex={1}>
              <Icon name="Pause" size={16} color={palette.ink} />
              PAUSE
            </Button>
          )}
          {state.status === "paused" && (
            <Button variant="ghost" onPress={onResume} flex={1}>
              <Icon name="Play" size={16} color={palette.ink} />
              RESUME
            </Button>
          )}
          <Button variant="soft" onPress={onEnd} flex={1}>
            <Icon name="StopCircle" size={16} color={palette.redBright} />
            END
          </Button>
          <Button onPress={onComplete} flex={1}>
            <Icon name="Check" size={16} color={palette.white} />
            COMPLETE
          </Button>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
