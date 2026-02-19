import React from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons, useTheme } from "react-native-paper";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES, Language } from "../i18n";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={language}
        onValueChange={(value) => setLanguage(value as Language)}
        density="small"
        buttons={LANGUAGES.map((lang) => ({
          value: lang.code,
          label: `${lang.flag} ${lang.label}`,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
