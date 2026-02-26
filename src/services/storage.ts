import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Language } from "../i18n";
import { TranscriptSegment } from "./transcription";

export interface VoiceNote {
  id: string;
  title: string;
  duration: number; // seconds
  audioUrl: string;
  transcript: string;
  segments?: TranscriptSegment[]; // Speaker-separated segments
  language: Language;
  userId: string;
  createdAt: Date;
  status: "recording" | "transcribing" | "ready" | "error";
}

const COLLECTION = "voiceNotes";

export async function saveVoiceNote(
  localAudioUri: string,
  title: string,
  duration: number,
  language: Language = "es",
  userId: string
): Promise<{ noteId: string; audioUrl: string }> {
  // Upload audio to Firebase Storage under user's folder
  const filename = `recordings/${userId}/${Date.now()}.m4a`;
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
    language,
    userId,
    createdAt: Timestamp.now(),
    status: "transcribing",
  });

  return { noteId: docRef.id, audioUrl };
}

export async function updateTranscript(
  noteId: string,
  transcript: string,
  segments?: TranscriptSegment[]
): Promise<void> {
  const noteRef = doc(db, COLLECTION, noteId);
  await updateDoc(noteRef, {
    transcript,
    segments: segments || [],
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

export async function getAllNotes(userId: string): Promise<VoiceNote[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
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
