import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "red",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home", // You can still keep the tab label if you want
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false, // Remove the title/header
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan", // You can still keep the tab label if you want
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
          headerShown: false, // Remove the title/header
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add New", // You can still keep the tab label if you want
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          headerShown: false, // Remove the title/header
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Orders", // You can still keep the tab label if you want
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerShown: false, // Remove the title/header
        }}
      />
    </Tabs>
  );
}
