import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import {
  TextInput,
  IconButton,
  Text,
  ActivityIndicator,
  Chip,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import ChatBubble from "../../src/components/ChatBubble";
import { chat, ChatMessage } from "../../src/services/ai";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transcript, setTranscript] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [error, setError] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const noteDoc = await getDoc(doc(db, "voiceNotes", id));
      if (noteDoc.exists()) {
        const data = noteDoc.data();
        setTranscript(data.transcript || "");
        setNoteTitle(data.title || "Voice Note");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load note");
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await chat(transcript, updatedMessages);
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {/* Transcript toggle */}
        <View style={styles.header}>
          <Chip
            icon={showTranscript ? "eye-off" : "eye"}
            onPress={() => setShowTranscript(!showTranscript)}
            compact
          >
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </Chip>
        </View>

        {showTranscript && (
          <View
            style={[
              styles.transcriptBox,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text variant="labelMedium" style={{ marginBottom: 4 }}>
              Transcript
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {transcript || "No transcript available."}
            </Text>
          </View>
        )}

        {/* Chat messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} content={item.content} />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
              >
                Ask anything about your note "{noteTitle}"
              </Text>
              <View style={styles.suggestions}>
                {[
                  "Summarize this note",
                  "What are the key points?",
                  "List action items",
                ].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    onPress={() => setInput(suggestion)}
                    compact
                    style={styles.suggestionChip}
                  >
                    {suggestion}
                  </Chip>
                ))}
              </View>
            </View>
          }
        />

        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" />
            <Text variant="bodySmall" style={{ marginLeft: 8, opacity: 0.6 }}>
              AI is thinking...
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your note..."
            mode="outlined"
            style={styles.textInput}
            dense
            onSubmitEditing={sendMessage}
            disabled={loading}
          />
          <IconButton
            icon="send"
            mode="contained"
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          />
        </View>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: "OK", onPress: () => setError("") }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 4,
  },
  transcriptBox: {
    margin: 12,
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    maxHeight: 150,
  },
  messagesList: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    paddingTop: 80,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  suggestionChip: {
    marginBottom: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  textInput: {
    flex: 1,
    marginRight: 4,
  },
});
