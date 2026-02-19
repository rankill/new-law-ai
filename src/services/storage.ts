import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import * as FileSystem from "expo-file-system";

export interface VoiceNote {
  id: string;
  title: string;
  duration: number; // seconds
  audioUrl: string;
  transcript: string;
  createdAt: Date;
  status: "recording" | "transcribing" | "ready" | "error";
}

const COLLECTION = "voiceNotes";

export async function saveVoiceNote(
  localAudioUri: string,
  title: string,
  duration: number
): Promise<string> {
  // Upload audio to Firebase Storage
  const filename = `recordings/${Date.now()}.m4a`;
  const storageRef = ref(storage, filename);

  const response = await fetch(localAudioUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);

  const audioUrl = await getDownloadURL(storageRef);

  // Save metadata to Firestore
  const docRef = await addDoc(collection(db, COLLECTION), {
    title,
    duration,
    audioUrl,
    transcript: "",
    createdAt: Timestamp.now(),
    status: "transcribing",
  });

  return docRef.id;
}

export async function updateTranscript(
  noteId: string,
  transcript: string
): Promise<void> {
  const noteRef = doc(db, COLLECTION, noteId);
  await updateDoc(noteRef, {
    transcript,
    status: "ready",
  });
}

export async function updateNoteStatus(
  noteId: string,
  status: VoiceNote["status"]
): Promise<void> {
  const noteRef = doc(db, COLLECTION, noteId);
  await updateDoc(noteRef, { status });
}

export async function getAllNotes(): Promise<VoiceNote[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as VoiceNote[];
}

export async function deleteNote(noteId: string, audioUrl: string): Promise<void> {
  // Delete from Storage
  try {
    const storageRef = ref(storage, audioUrl);
    await deleteObject(storageRef);
  } catch {
    // Audio file may already be deleted
  }

  // Delete from Firestore
  await deleteDoc(doc(db, COLLECTION, noteId));
}
