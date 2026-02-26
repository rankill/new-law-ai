import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider, useTheme } from "react-native-paper";
import { useColorScheme, View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { lightTheme, darkTheme } from "../src/theme";
import { LanguageProvider } from "../src/context/LanguageContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (loading) return;

    const onSignIn = segments[0] === "sign-in";

    if (!user && !onSignIn) {
      router.replace("/sign-in");
    } else if (user && onSignIn) {
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (!loading) return null;

  // Full-screen splash while Firebase resolves auth state
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.splash, { backgroundColor: theme.colors.background }]}>
      <View style={styles.splashDot} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.surface,
              },
              headerTintColor: theme.colors.onSurface,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="record" options={{ title: "" }} />
            <Stack.Screen name="chat/[id]" options={{ title: "" }} />
          </Stack>
          {/* AuthGate overlays everything until auth resolves */}
          <AuthGate />
        </PaperProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  splashDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#71717a",
    opacity: 0.6,
  },
});
