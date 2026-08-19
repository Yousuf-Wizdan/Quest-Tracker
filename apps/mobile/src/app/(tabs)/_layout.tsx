import { Tabs } from "expo-router";
import { QuestTabBar } from "../../components/QuestTabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <QuestTabBar {...props} />}
    >
      <Tabs.Screen name="status" />
      <Tabs.Screen name="today" />
      <Tabs.Screen name="capture" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="goals" />
    </Tabs>
  );
}
