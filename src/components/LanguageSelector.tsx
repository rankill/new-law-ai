import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES, Language } from "../i18n";

interface LanguageSelectorProps {
  value?: Language;
  onChange?: (lang: Language) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { language: contextLang, setLanguage: setContextLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const border = dark ? "#3f3f46" : "#e4e4e7";
  const text = dark ? "#fafafa" : "#18181b";
  const muted = dark ? "#71717a" : "#a1a1aa";
  const surface = dark ? "#18181b" : "#ffffff";
  const selectedBg = dark ? "#27272a" : "#f4f4f5";
  const mutedText = dark ? "#a1a1aa" : "#71717a";
  const overlay = dark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)";

  const currentLang = value ?? contextLang;
  const handleChange = onChange ?? setContextLang;

  const currentLabel =
    LANGUAGES.find((l) => l.code === currentLang)?.flag ?? currentLang.toUpperCase();

  return (
    <>
      {/* Minimal trigger — language flag + chevron */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.55}
        accessibilityLabel="Select language"
      >
        <MaterialCommunityIcons name="translate" size={16} color={mutedText} style={styles.triggerIcon} />
        <Text style={[styles.triggerCode, { color: text }]}>{currentLabel}</Text>
        <Text style={[styles.triggerChevron, { color: mutedText }]}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: overlay }]}
          onPress={() => setOpen(false)}
        >
          <Pressable style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.cardTitle, { color: text }]}>Language</Text>
            <View style={[styles.divider, { backgroundColor: border }]} />
            {LANGUAGES.map((lang) => {
              const selected = lang.code === currentLang;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.row, selected && { backgroundColor: selectedBg }]}
                  onPress={() => {
                    handleChange(lang.code);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rowCode, { color: muted }]}>{lang.flag}</Text>
                  <Text style={[styles.rowLabel, { color: text }]}>{lang.label}</Text>
                  {selected && (
                    <Text style={[styles.checkmark, { color: text }]}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  triggerIcon: {
    marginRight: -1,
  },
  triggerCode: {
    fontSize: 16,
    fontWeight: "600",
  },
  triggerChevron: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 240,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    opacity: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 12,
  },
  rowCode: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    minWidth: 24,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "600",
  },
});
