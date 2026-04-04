import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Platform, TextStyle, ViewStyle } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

const tabBarStyle: ViewStyle = {
  backgroundColor: Colors.card,
  borderTopWidth: 4,
  borderTopColor: Colors.cardBorder,
  height: Platform.OS === "ios" ? 88 : 72,
  paddingBottom: Platform.OS === "ios" ? 24 : 10,
  paddingTop: 8,
};

const tabLabelStyle: TextStyle = {
  fontFamily: Fonts.pixelBold,
  fontSize: 8,
  marginTop: 4,
};

export default function ParentLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: "transparent" },
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "rgba(0,0,0,0.4)",
        tabBarLabelStyle: tabLabelStyle,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "OVERVIEW",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "LOGS",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointment"
        options={{
          title: "REPORTS",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "CLAUDE",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
