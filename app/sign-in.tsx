import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../src/config/firebase";
import { useLanguage } from "../src/context/LanguageContext";
import { t } from "../src/i18n";
import LanguageSelector from "../src/components/LanguageSelector";

export default function SignInScreen() {
  const theme = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (createError: any) {
          setError(createError.message || t("signInError", language));
        }
      } else {
        setError(e.message || t("signInError", language));
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email.trim() || !password.trim();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top bar with language selector */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <LanguageSelector />
      </View>

      {/* Centered content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t("appName", language)}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t("appTagline", language)}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: emailFocused ? theme.colors.onSurface : theme.colors.outline,
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder={t("email", language)}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
          <TextInput
            style={[
              styles.input,
              {
                borderColor: passwordFocused ? theme.colors.onSurface : theme.colors.outline,
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder={t("password", language)}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            onSubmitEditing={handleEmailSignIn}
          />
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            onPress={handleEmailSignIn}
            disabled={disabled}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : null}
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
              {t("signInOrCreate", language)}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {t("signInHint", language)}
        </Text>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
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
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 22,
  },
  form: {
    width: "100%",
    maxWidth: 360,
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    textAlign: "center",
    opacity: 0.7,
  },
});
