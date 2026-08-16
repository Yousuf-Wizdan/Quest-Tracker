import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface GoalHierarchy {
  id: string;
  title: string;
  areas: Array<{
    id: string;
    title: string;
    projects: Array<{
      id: string;
      title: string;
      quests: Array<{ id: string; title: string; completedAt: string | null }>;
    }>;
  }>;
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<GoalHierarchy[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/goals/hierarchy`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setGoals(data))
      .catch(() => setGoals([]));
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Goals</Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goal}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.areas.map((area) => (
                <View key={area.id} style={styles.area}>
                  <Text style={styles.areaTitle}>{area.title}</Text>
                  {area.projects.map((project) => {
                    const done = project.quests.filter((q) => q.completedAt).length;
                    const total = project.quests.length;
                    return (
                      <View key={project.id} style={styles.project}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.projectMeta}>
                          {done}/{total} quests complete
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
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
  goal: {
    borderWidth: 1,
    borderColor: colors.stroke2,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface,
  },
  goalTitle: { color: colors.ink, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  area: { marginTop: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: colors.stroke2 },
  areaTitle: {
    color: colors.redBright,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  project: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface2,
  },
  projectTitle: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  projectMeta: { color: colors.faint, fontSize: 11, fontFamily: "monospace", marginTop: 4 },
});
