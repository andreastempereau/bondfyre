import { Redirect } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AuthScreen from "../../app/auth";

export default function HomeScreen() {
  const { user, loading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is not authenticated, show the unauthenticated view
  if (!user) {
    return <AuthScreen />;
  }

  // If user is authenticated, redirect to discover tab
  return <Redirect href="/discover" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
