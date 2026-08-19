import { Text, View } from "@tamagui/core";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground } from "../../components/ScreenBackground";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/ui";
import { palette } from "../../palette";

const steps = [
  { title: "Warm-up — adjacency list & BFS on LeetCode 199", meta: "~20 min · easy", xp: "+20", done: true },
  { title: "Topological sort — course schedule (LC 207)", meta: "~20 min · medium", xp: "+35", done: false },
  { title: "Shortest path — network delay (LC 743)", meta: "~20 min · medium", xp: "+35", done: false },
];

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View flexDirection="row" alignItems="center" gap="$3" paddingHorizontal="$5" paddingVertical="$4">
          <View width={40} height={40} borderRadius="$3" borderWidth={1} borderColor="$stroke2" alignItems="center" justifyContent="center">
            <Icon name="ArrowLeft" size={16} color={palette.muted} onPress={() => router.back()} />
          </View>
          <Text fontFamily="$display" fontSize={17} fontWeight="700" color="$ink">
            Quest {id ? `· ${id}` : ""}
          </Text>
          <View marginLeft="auto" borderWidth={1} borderColor="$stroke2" borderRadius="$6" paddingVertical="$1" paddingHorizontal="$2.5">
            <Text fontFamily="$mono" fontSize={9} color="$muted">
              Secondary · <Text color="$accentBright" fontWeight="600">Due today</Text>
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 136, gap: 16 }}>
          <View borderWidth={1} borderColor="$blueTint" borderRadius="$6" padding="$6" backgroundColor="$surface" overflow="hidden">
            <Text fontFamily="$mono" fontSize={9} letterSpacing={2} textTransform="uppercase" color="$blueBright">
              Secondary Quest · DSA / Career
            </Text>
            <Text fontFamily="$serif" fontSize={30} fontWeight="500" color="$ink" lineHeight={34} marginTop="$3">
              Graph algorithms
            </Text>
            <Text fontFamily="$serif" fontSize={12.5} lineHeight={20} color="$muted" marginTop="$3" maxWidth={320}>
              Three problems on graph traversal, topo sort and shortest path. What the mock rounds keep testing — and the fastest way to raise INT this week.
            </Text>
            <View flexDirection="row" alignItems="center" gap="$2.5" flexWrap="wrap" marginTop="$5">
              <View flexDirection="row" alignItems="center" gap="$2" backgroundColor="$accent" borderRadius="$3" paddingVertical="$2" paddingHorizontal="$3">
                <Icon name="Sparkle" size={13} color={palette.white} />
                <Text fontFamily="$mono" fontSize={10} fontWeight="600" color="$white" letterSpacing={1}>
                  Reward +90 XP
                </Text>
              </View>
              <View borderWidth={1} borderColor="$stroke" borderRadius="$2" paddingVertical="$1" paddingHorizontal="$2">
                <Text fontFamily="$mono" fontSize={8.5} color="$muted">60 min</Text>
              </View>
              <View borderWidth={1} borderColor="$stroke" borderRadius="$2" paddingVertical="$1" paddingHorizontal="$2">
                <Text fontFamily="$mono" fontSize={8.5} color="$muted">INT +2</Text>
              </View>
            </View>
          </View>

          <View flexDirection="row" alignItems="baseline" justifyContent="space-between">
            <Text fontFamily="$display" fontSize={14} fontWeight="700" color="$ink">
              Steps
            </Text>
            <Text fontFamily="$mono" fontSize={8.5} letterSpacing={1} textTransform="uppercase" color="$faint">
              1 of 3 complete
            </Text>
          </View>

          <View gap="$2">
            {steps.map((step) => (
              <View key={step.title} borderWidth={1} borderColor="$stroke" borderRadius="$4" padding="$3.5" backgroundColor="$surface2" flexDirection="row" alignItems="flex-start" gap="$3">
                <View
                  width={22}
                  height={22}
                  borderRadius={99}
                  borderWidth={2}
                  borderColor={step.done ? palette.red : palette.faint}
                  backgroundColor={step.done ? palette.red : "transparent"}
                  alignItems="center"
                  justifyContent="center"
                >
                  {step.done && <Icon name="Check" size={12} color={palette.white} strokeWidth={3} />}
                </View>
                <View flex={1}>
                  <Text fontFamily="$display" fontSize={12.5} fontWeight="600" color={step.done ? "$muted" : "$ink"} lineHeight={18}>
                    {step.title}
                  </Text>
                  <Text fontFamily="$mono" fontSize={8.5} color="$faint" marginTop="$1">
                    {step.meta}
                  </Text>
                </View>
                <View backgroundColor="$accentTint" borderWidth={1} borderColor="$accent" borderRadius="$2" paddingVertical="$1" paddingHorizontal="$2">
                  <Text fontFamily="$mono" fontSize={9} fontWeight="600" color="$accentBright">
                    {step.xp}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View flexDirection="row" gap="$2.5" borderWidth={1} borderColor="$stroke" borderRadius="$4" padding="$3.5">
            <View width={28} height={28} borderRadius="$2" backgroundColor="$accentTint" borderWidth={1} borderColor="$accent" alignItems="center" justifyContent="center">
              <Icon name="Info" size={14} color={palette.redBright} />
            </View>
            <View flex={1}>
              <Text fontFamily="$mono" fontSize={8} letterSpacing={2} textTransform="uppercase" color="$accentBright">
                Why this?
              </Text>
              <Text fontFamily="$serif" fontSize={12} lineHeight={18} color="$muted" marginTop="$1">
                DSA is your current bottleneck — project progress is healthy, but consistency here is below target. Three problems today keeps the streak alive.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View position="absolute" left={0} right={0} bottom={70} paddingHorizontal="$5" paddingTop="$3.5" paddingBottom="$2" backgroundColor="$background">
          <Button size="lg">
            <Icon name="Play" size={17} color={palette.white} />
            Start quest
          </Button>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
