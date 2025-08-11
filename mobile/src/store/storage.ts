import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Note} from '../types';

const NOTES_KEY = 'offline_notes_mobile_notes';
const LAST_SYNC_KEY = 'offline_notes_mobile_last_sync';

export async function storageGetAllNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Note[]; } catch { return []; }
}

export async function storagePutNote(note: Note): Promise<void> {
  const notes = await storageGetAllNotes();
  const idx = notes.findIndex(n => n.id === note.id);
  if (idx === -1) notes.push(note);
  else notes[idx] = note;
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function storageRemoveNote(id: string): Promise<void> {
  const notes = await storageGetAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
}

export async function storageSetAllNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function storageGetLastSync(): Promise<string | null> {
  return (await AsyncStorage.getItem(LAST_SYNC_KEY)) || null;
}

export async function storageSetLastSync(ts: string | null) {
  if (ts) await AsyncStorage.setItem(LAST_SYNC_KEY, ts);
  else await AsyncStorage.removeItem(LAST_SYNC_KEY);
}
