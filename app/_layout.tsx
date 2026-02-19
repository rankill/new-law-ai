import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useColorScheme, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { lightTheme, darkTheme } from "../src/theme";
import { LanguageProvider } from "../src/context/LanguageContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const onSignIn = segments[0] === "sign-in";

    if (!user && !onSignIn) {
      router.replace("/sign-in");
    } else if (user && onSignIn) {
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <AuthGate />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.onSurface,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ title: "" }} />
            <Stack.Screen name="record" options={{ title: "" }} />
            <Stack.Screen name="chat/[id]" options={{ title: "" }} />
          </Stack>
        </PaperProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
