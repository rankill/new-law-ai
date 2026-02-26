import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { IconButton, Snackbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../src/config/firebase";
import NoteCard from "../src/components/NoteCard";
import NoteCardSkeleton from "../src/components/NoteCardSkeleton";
import LanguageSelector from "../src/components/LanguageSelector";
import { VoiceNote, getAllNotes, deleteNote } from "../src/services/storage";
import { useLanguage } from "../src/context/LanguageContext";
import { useAuth } from "../src/context/AuthContext";
import { t } from "../src/i18n";

export default function HomeScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const loadNotes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getAllNotes(user.uid);
      setNotes(data);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleDelete = async (note: VoiceNote): Promise<void> => {
    await deleteNote(note.id, note.audioUrl);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.outline,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {t("voiceNotes", language)}
        </Text>
        <View style={styles.headerRight}>
          <LanguageSelector />
          <IconButton
            icon="logout"
            size={18}
            onPress={() => signOut(auth)}
            iconColor={theme.colors.onSurfaceVariant}
            accessibilityLabel={t("signOut", language)}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2, 3].map((i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyIcon, { color: theme.colors.onSurfaceVariant }]}>
            🎙
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
            {t("noNotesYet", language)}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            {t("tapMicToRecord", language)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              language={language}
              onPress={() => router.push(`/chat/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 88 }]}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary, bottom: insets.bottom + 24 },
        ]}
        onPress={() => router.push("/record")}
        activeOpacity={0.85}
        accessibilityLabel={t("record", language)}
      >
        <MaterialCommunityIcons
          name="microphone"
          size={20}
          color={theme.colors.onPrimary}
          style={styles.fabIcon}
        />
        <Text style={[styles.fabLabel, { color: theme.colors.onPrimary }]}>
          {t("record", language)}
        </Text>
      </TouchableOpacity>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: t("ok", language), onPress: () => setError("") }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginRight: -6,
  },
  skeletonList: {
    paddingTop: 8,
  },
  list: {
    paddingTop: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    opacity: 0.45,
    lineHeight: 19,
  },
  fab: {
    position: "absolute",
    right: 20,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabIcon: {
    marginTop: 1,
  },
  fabLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});
