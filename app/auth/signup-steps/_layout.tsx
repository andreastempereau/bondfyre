import React from "react";
import { Stack } from "expo-router";
import { SignupProvider } from "../../../src/contexts/SignupContext";

export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="email" />
        <Stack.Screen name="name" />
        <Stack.Screen name="password" />
        <Stack.Screen name="age" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="bio" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="username" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="complete" />
      </Stack>
    </SignupProvider>
  );
}
