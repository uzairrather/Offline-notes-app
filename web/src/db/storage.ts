import { idbDeleteNote, idbGetAllNotes, idbGetMeta, idbPutNote, idbSetMeta } from './idb';
import type { Note } from '../types';

const HAS_INDEXEDDB = typeof indexedDB !== 'undefined';

const LS_NOTES_KEY = 'offline_notes_notes';
const LS_META_LAST_SYNC = 'offline_notes_last_sync';

export async function storageGetAllNotes(): Promise<Note[]> {
  if (HAS_INDEXEDDB) {
    return idbGetAllNotes();
  }
  const raw = localStorage.getItem(LS_NOTES_KEY);
  return raw ? (JSON.parse(raw) as Note[]) : [];
}

export async function storagePutNote(note: Note): Promise<void> {
  if (HAS_INDEXEDDB) {
    await idbPutNote(note);
  } else {
    const notes = await storageGetAllNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx === -1) notes.push(note);
    else notes[idx] = note;
    localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes));
  }
}

export async function storageDeleteNote(id: string): Promise<void> {
  if (HAS_INDEXEDDB) {
    await idbDeleteNote(id);
  } else {
    const notes = await storageGetAllNotes();
    const filtered = notes.filter((n) => n.id !== id);
    localStorage.setItem(LS_NOTES_KEY, JSON.stringify(filtered));
  }
}

export async function storageSetLastSync(ts: string | null): Promise<void> {
  if (HAS_INDEXEDDB) {
    await idbSetMeta('lastSync', ts);
  } else {
    if (ts) localStorage.setItem(LS_META_LAST_SYNC, ts);
    else localStorage.removeItem(LS_META_LAST_SYNC);
  }
}

export async function storageGetLastSync(): Promise<string | null> {
  if (HAS_INDEXEDDB) {
    const v = await idbGetMeta<string>('lastSync');
    return v ?? null;
  } else {
    return localStorage.getItem(LS_META_LAST_SYNC);
  }
}
