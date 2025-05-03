import React from "react";
import { Stack } from "expo-router";
import { SignupProvider } from "../../contexts/SignupContext";

export default function SignUpStepsLayout() {
  return (
    <SignupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          presentation: "card",
          cardStyle: { backgroundColor: "white" },
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </SignupProvider>
  );
}
