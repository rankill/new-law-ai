import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, Text, useTheme, Snackbar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import NoteCard from "../src/components/NoteCard";
import { VoiceNote, getAllNotes, deleteNote } from "../src/services/storage";

export default function HomeScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useTheme();

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllNotes();
      setNotes(data);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

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
      {notes.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            No voice notes yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap the mic button to record your first note
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => router.push(`/chat/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="microphone"
        label="Record"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push("/record")}
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: "OK", onPress: () => setError("") }}
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
