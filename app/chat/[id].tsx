import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  IconButton,
  ActivityIndicator,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import ChatBubble from "../../src/components/ChatBubble";
import AudioPlayer from "../../src/components/AudioPlayer";
import { chat, ChatMessage } from "../../src/services/ai";
import { useLanguage } from "../../src/context/LanguageContext";
import { t, Language } from "../../src/i18n";

type Tab = "transcript" | "chat";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language: appLanguage } = useLanguage();
  const [transcript, setTranscript] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteLanguage, setNoteLanguage] = useState<Language>("es");
  const [audioUrl, setAudioUrl] = useState("");
  const [noteDuration, setNoteDuration] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("transcript");
  const [error, setError] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();

  const uiLang = appLanguage;

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
        setNoteLanguage(data.language || "es");
        setAudioUrl(data.audioUrl || "");
        setNoteDuration(data.duration || 0);
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
      const reply = await chat(transcript, updatedMessages, noteLanguage);
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    t("summarize", uiLang),
    t("keyPoints", uiLang),
    t("actionItems", uiLang),
  ];

  if (initialLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Audio player */}
      {audioUrl ? (
        <View style={[styles.audioBar, { borderBottomColor: theme.colors.outline }]}>
          <AudioPlayer url={audioUrl} duration={noteDuration} />
        </View>
      ) : null}

      {/* Underline tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.outline }]}>
        {(["transcript", "chat"] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                active && { borderBottomColor: theme.colors.onSurface },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: active ? "600" : "400",
                  },
                ]}
              >
                {tab === "transcript" ? t("transcript", uiLang) : t("chat", uiLang)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transcript tab */}
      {activeTab === "transcript" && (
        <ScrollView
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptContent}
        >
          {transcript ? (
            <Text style={{ color: theme.colors.onSurface, lineHeight: 24, fontSize: 15 }}>
              {transcript}
            </Text>
          ) : (
            <View style={styles.emptyTranscript}>
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", fontSize: 15 }}>
                {t("noTranscript", uiLang)}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Chat tab */}
      {activeTab === "chat" && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={140}
        >
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
                  style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", fontSize: 15 }}
                >
                  {t("askAnything", uiLang, { title: noteTitle })}
                </Text>
                <View style={styles.suggestions}>
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      onPress={() => setInput(suggestion)}
                      style={[
                        styles.suggestionChip,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          borderColor: theme.colors.outline,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: theme.colors.onSurface, fontSize: 13 }}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
          />

          {loading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" />
              <Text style={{ marginLeft: 8, opacity: 0.6, color: theme.colors.onSurface, fontSize: 13 }}>
                {t("aiThinking", uiLang)}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outline,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("askPlaceholder", uiLang)}
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
        </KeyboardAvoidingView>
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: t("ok", uiLang), onPress: () => setError("") }}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  audioBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // Underline tab bar
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 15,
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyTranscript: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  chatContainer: {
    flex: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
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
  },
  textInput: {
    flex: 1,
    marginRight: 4,
  },
});
