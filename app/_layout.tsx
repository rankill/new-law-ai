import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { lightTheme, darkTheme } from "../src/theme";
import { LanguageProvider } from "../src/context/LanguageContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <LanguageProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.onSurface,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: "" }} />
          <Stack.Screen name="record" options={{ title: "" }} />
          <Stack.Screen name="chat/[id]" options={{ title: "" }} />
        </Stack>
      </PaperProvider>
    </LanguageProvider>
  );
}
