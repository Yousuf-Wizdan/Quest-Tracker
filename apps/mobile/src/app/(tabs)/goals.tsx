import { Text, View } from "@tamagui/core";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { palette } from "../../palette";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface GoalHierarchy {
  id: string;
  title: string;
  areas: {
    id: string;
    title: string;
    projects: {
      id: string;
      title: string;
      quests: { id: string; title: string; completedAt: string | null }[];
    }[];
  }[];
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
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Text fontFamily="$display" fontSize="$9" fontWeight="700" color="$ink">
            Goals
          </Text>

          {goals.map((goal) => (
            <View key={goal.id} borderWidth={1} borderColor="$stroke2" borderRadius="$5" padding="$4" backgroundColor="$surface">
              <View flexDirection="row" alignItems="center" gap="$2.5">
                <Icon name="Target" size={18} color={palette.redBright} />
                <Text fontFamily="$display" fontSize={18} fontWeight="700" color="$ink">
                  {goal.title}
                </Text>
              </View>

              {goal.areas.map((area) => (
                <View key={area.id} marginTop="$3" paddingLeft="$3" borderLeftWidth={1} borderLeftColor="$stroke2">
                  <Text fontFamily="$mono" fontSize={12} letterSpacing={2} textTransform="uppercase" color="$accentBright">
                    {area.title}
                  </Text>

                  {area.projects.map((project) => {
                    const done = project.quests.filter((q) => q.completedAt).length;
                    const total = project.quests.length;
                    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                    return (
                      <View key={project.id} borderWidth={1} borderColor="$stroke" borderRadius="$4" padding="$3" marginTop="$2" backgroundColor="$surface2">
                        <View flexDirection="row" alignItems="center" justifyContent="space-between">
                          <View flexDirection="row" alignItems="center" gap="$2" flex={1}>
                            <Icon name="FolderKanban" size={16} color={palette.muted} />
                            <Text fontFamily="$display" fontSize={14} fontWeight="600" color="$ink" numberOfLines={1}>
                              {project.title}
                            </Text>
                          </View>
                          <Text fontFamily="$mono" fontSize={11} color="$faint">
                            {done}/{total}
                          </Text>
                        </View>
                        <View height={5} borderRadius={3} backgroundColor="rgba(255,255,255,0.08)" overflow="hidden" marginTop="$2">
                          <View height="100%" width={`${pct}%` as `${number}%`} backgroundColor="$accentBright" borderRadius={3} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
