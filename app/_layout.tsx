import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { AuthProvider } from "./../src/contexts/AuthContext";
import NetworkNotification from "./../src/components/ui/NetworkNotification";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  // Load the Space Mono font
  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {/* Global notification component that listens for API errors */}
        <NetworkNotification />

        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "#000",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShadowVisible: false,
          }}
        >
          {/* Home screen - redirects to auth or tabs based on login state */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          {/* Authentication screens */}
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
            }}
          />

          {/* Main tab screens */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
