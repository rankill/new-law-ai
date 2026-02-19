import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6750A4",
    primaryContainer: "#EADDFF",
    secondary: "#625B71",
    secondaryContainer: "#E8DEF8",
    tertiary: "#7D5260",
    tertiaryContainer: "#FFD8E4",
    surface: "#FFFBFE",
    surfaceVariant: "#E7E0EC",
    background: "#FFFBFE",
    error: "#B3261E",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#21005D",
    onSecondary: "#FFFFFF",
    onSecondaryContainer: "#1D192B",
    onSurface: "#1C1B1F",
    onSurfaceVariant: "#49454F",
    outline: "#79747E",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#D0BCFF",
    primaryContainer: "#4F378B",
    secondary: "#CCC2DC",
    secondaryContainer: "#4A4458",
    tertiary: "#EFB8C8",
    tertiaryContainer: "#633B48",
    surface: "#1C1B1F",
    surfaceVariant: "#49454F",
    background: "#1C1B1F",
    error: "#F2B8B5",
    onPrimary: "#381E72",
    onPrimaryContainer: "#EADDFF",
    onSecondary: "#332D41",
    onSecondaryContainer: "#E8DEF8",
    onSurface: "#E6E1E5",
    onSurfaceVariant: "#CAC4D0",
    outline: "#938F99",
  },
};
