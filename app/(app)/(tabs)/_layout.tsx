import { Tabs } from 'expo-router';
import { House, ScrollText } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: ({ focused }) => <House opacity={focused ? 1 : 0.75} accessible={false} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarAccessibilityLabel: 'Transações',
          tabBarIcon: ({ focused }) => (
            <ScrollText opacity={focused ? 1 : 0.75} accessible={false} />
          ),
        }}
      />
    </Tabs>
  );
}
