import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { Language } from "../i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
});

const STORAGE_KEY = "app_language";

function isValidLang(v: unknown): v is Language {
  return v === "en" || v === "es";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const { user } = useAuth();

  // 1. Load from AsyncStorage immediately on mount (fast, local)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (isValidLang(saved)) setLanguageState(saved);
    });
  }, []);

  // 2. When user logs in, sync from Firestore (overrides local if set)
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (!snap.exists()) return;
        const lang = snap.data()?.language;
        if (isValidLang(lang)) {
          setLanguageState(lang);
          AsyncStorage.setItem(STORAGE_KEY, lang);
        }
      })
      .catch(() => {
        // If Firestore fails, keep the locally persisted value — no-op
      });
  }, [user?.uid]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Always persist locally for instant restore on next launch
    AsyncStorage.setItem(STORAGE_KEY, lang);
    // Persist to Firestore so preference syncs across devices
    if (user) {
      setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true }).catch(
        () => {} // ignore network errors — local copy is the source of truth
      );
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
