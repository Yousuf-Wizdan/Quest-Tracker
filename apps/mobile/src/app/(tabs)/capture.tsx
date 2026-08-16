import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface InboxItem {
  id: string;
  kind: "task" | "idea" | "note";
  content: string;
}

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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Capture</Text>

        <View style={styles.kindRow}>
          {(["task", "idea", "note"] as const).map((k) => (
            <Pressable
              key={k}
              style={[styles.kindButton, kind === k && styles.kindActive]}
              onPress={() => setKind(k)}
            >
              <Text style={[styles.kindText, kind === k && styles.kindTextActive]}>
                {k.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Capture a thought…"
          placeholderTextColor={colors.faint}
          multiline
        />

        <Pressable style={styles.captureButton} onPress={capture}>
          <Text style={styles.captureText}>+ CAPTURE</Text>
        </Pressable>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemKind}>{item.kind.toUpperCase()}</Text>
              <Text style={styles.itemContent}>{item.content}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, padding: 20 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "700" },
  kindRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  kindButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  kindActive: { backgroundColor: colors.red, borderColor: colors.red },
  kindText: { color: colors.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  kindTextActive: { color: "#ffffff" },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 14,
    padding: 14,
    color: colors.ink,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  captureButton: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  captureText: { color: "#ffffff", fontSize: 14, letterSpacing: 2, fontWeight: "700", fontFamily: "monospace" },
  list: { flex: 1, marginTop: 16 },
  listContent: { gap: 8, paddingBottom: 24 },
  item: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.surface2,
  },
  itemKind: { color: colors.faint, fontSize: 9, letterSpacing: 2, fontFamily: "monospace" },
  itemContent: { color: colors.ink, fontSize: 13, marginTop: 4 },
});
