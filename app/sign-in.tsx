import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Snackbar,
  TextInput,
} from "react-native-paper";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../src/config/firebase";
import { useLanguage } from "../src/context/LanguageContext";
import { t } from "../src/i18n";
import LanguageToggle from "../src/components/LanguageToggle";

export default function SignInScreen() {
  const theme = useTheme();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      // If user doesn't exist, create account
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text
          variant="displaySmall"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          {t("appName", language)}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {t("appTagline", language)}
        </Text>

        <View style={styles.form}>
          <TextInput
            label={t("email", language)}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="email-outline" />}
          />
          <TextInput
            label={t("password", language)}
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="lock-outline" />}
            onSubmitEditing={handleEmailSignIn}
          />
          <Button
            mode="contained"
            onPress={handleEmailSignIn}
            loading={loading}
            disabled={loading || !email.trim() || !password.trim()}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="login"
          >
            {t("signInOrCreate", language)}
          </Button>
        </View>

        <Text
          variant="bodySmall"
          style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
        >
          {t("signInHint", language)}
        </Text>
      </View>

      <LanguageToggle />

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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 48,
  },
  form: {
    width: "100%",
    maxWidth: 360,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  hint: {
    marginTop: 24,
    textAlign: "center",
    opacity: 0.7,
  },
});
