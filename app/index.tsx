import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, Text, IconButton, useTheme, Snackbar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../src/config/firebase";
import NoteCard from "../src/components/NoteCard";
import LanguageToggle from "../src/components/LanguageToggle";
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

  const handleDelete = async (note: VoiceNote) => {
    try {
      await deleteNote(note.id, note.audioUrl);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with title and sign out */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
          {t("voiceNotes", language)}
        </Text>
        <IconButton
          icon="logout"
          size={22}
          onPress={() => signOut(auth)}
          accessibilityLabel={t("signOut", language)}
        />
      </View>
      <LanguageToggle />

      {notes.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            {t("noNotesYet", language)}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
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
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="microphone"
        label={t("record", language)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push("/record")}
      />

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.4,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 32,
  },
});
