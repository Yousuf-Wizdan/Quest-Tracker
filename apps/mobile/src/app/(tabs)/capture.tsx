import { Text, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/ui";
import { palette } from "../../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface InboxItem {
  id: string;
  kind: "task" | "idea" | "note";
  content: string;
}

const KIND_ICONS = {
  task: "SquareCheck",
  idea: "Lightbulb",
  note: "FileText",
} as const;

const inputStyle = {
  marginTop: 16,
  borderWidth: 1,
  borderColor: palette.stroke2,
  borderRadius: 16,
  padding: 14,
  color: palette.ink,
  fontSize: 15,
  minHeight: 80,
  textAlignVertical: "top",
  fontFamily: "JetBrainsMono_400Regular",
} as const;

export default function CaptureScreen() {
  const [kind, setKind] = useState<"task" | "idea" | "note">("task");
  const [content, setContent] = useState("");
  const [items, setItems] = useState<InboxItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/inbox`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  async function capture() {
    if (!content.trim()) return;

    const res = await fetch(`${API_URL}/inbox`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, content }),
    });

    if (res.ok) {
      const item = (await res.json()) as InboxItem;
      setItems((prev) => [...prev, item]);
      setContent("");
    }
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text fontFamily="$display" fontSize="$9" fontWeight="700" color="$ink">
          Capture
        </Text>

        <View flexDirection="row" gap="$2" marginTop="$4">
          {(["task", "idea", "note"] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: kind === k ? palette.red : palette.stroke2,
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: "center",
                gap: 6,
                backgroundColor: kind === k ? palette.red : "transparent",
              }}
            >
              <Icon name={KIND_ICONS[k]} size={16} color={kind === k ? palette.white : palette.muted} />
              <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color={kind === k ? "$white" : "$muted"}>
                {k.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={inputStyle}
          value={content}
          onChangeText={setContent}
          placeholder="Capture a thought…"
          placeholderTextColor={palette.faint}
          multiline
        />

        <Button onPress={capture} marginTop="$3">
          <Icon name="Plus" size={17} color={palette.white} />
          CAPTURE
        </Button>

        <ScrollView style={{ flex: 1, marginTop: 16 }} contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
          {items.map((item) => (
            <View key={item.id} borderWidth={1} borderColor="$stroke" borderRadius="$3" padding="$3" backgroundColor="$surface2">
              <View flexDirection="row" alignItems="center" gap="$2">
                <Icon name={KIND_ICONS[item.kind]} size={14} color={palette.faint} />
                <Text fontFamily="$mono" fontSize={9} letterSpacing={2} color="$faint">
                  {item.kind.toUpperCase()}
                </Text>
              </View>
              <Text fontFamily="$display" fontSize={13} color="$ink" marginTop="$2">
                {item.content}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
