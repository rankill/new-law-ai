import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { lightTheme, darkTheme } from "../src/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
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
        <Stack.Screen
          name="index"
          options={{ title: "Voice Notes" }}
        />
        <Stack.Screen
          name="record"
          options={{ title: "Record" }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: "Chat" }}
        />
      </Stack>
    </PaperProvider>
  );
}
