import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../theme";

function TabLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <Text
      style={{
        color: active ? colors.redBright : colors.faint,
        fontSize: 9,
        letterSpacing: 1,
        textTransform: "uppercase",
        fontFamily: "monospace",
      }}
    >
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.stroke,
        },
        tabBarActiveTintColor: colors.redBright,
        tabBarInactiveTintColor: colors.faint,
      }}
    >
      <Tabs.Screen
        name="status"
        options={{
          title: "Status",
          tabBarLabel: ({ focused }) => <TabLabel label="Status" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarLabel: ({ focused }) => <TabLabel label="Today" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: "Capture",
          tabBarLabel: ({ focused }) => <TabLabel label="Capture" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarLabel: ({ focused }) => <TabLabel label="Progress" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarLabel: ({ focused }) => <TabLabel label="Goals" active={focused} />,
        }}
      />
    </Tabs>
  );
}
