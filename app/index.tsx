import { Redirect } from "expo-router";

export default function Index() {
  // This root index file redirects to the app/(tabs) route
  return <Redirect href="/(tabs)" />;
}
