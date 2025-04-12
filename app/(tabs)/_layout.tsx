import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect } from "react";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false, // Hide labels
          tabBarActiveTintColor: "#3b82f6", // Active icon color
          tabBarInactiveTintColor: "#888", // Inactive icon color
          headerShown: false, // Hide top bar
        }}
      >
        <Tabs.Screen
          name="index" // ✅ This is correct
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconActive]}>
                <Ionicons name="calculator" size={size} color={color} />
              </View>
            ),
            tabBarButton: (props) => <TouchableOpacity {...props} />,
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconActive]}>
                <Ionicons name="bookmark" size={size} color={color} />
              </View>
            ),
            tabBarButton: (props) => <TouchableOpacity {...props} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  tabBar: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#111111ff", // Dark semi-transparent
    borderTopWidth: 0,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 120,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    minHeight: 50,
    minWidth: 50,
    position: "relative",
    bottom: 13.7,
  },
  iconActive: {
    backgroundColor: "#3b82f633", // Light orange background when active
  },
});
