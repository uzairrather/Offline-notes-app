import { openDB, type IDBPDatabase } from 'idb';
import type { Note } from '../types';

const DB_NAME = 'offline-notes-db';
const STORE = 'notes';
const META = 'meta';

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(META)) {
          db.createObjectStore(META);
        }
      },
    });
  }
  return dbPromise;
}

export async function idbPutNote(note: Note) {
  const db = await getDb();
  await db.put(STORE, note);
}

export async function idbGetAllNotes(): Promise<Note[]> {
  const db = await getDb();
  return await db.getAll(STORE);
}

export async function idbDeleteNote(id: string) {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function idbSetMeta(key: string, value: unknown) {
  const db = await getDb();
  await db.put(META, value, key);
}

export async function idbGetMeta<T = unknown>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return await db.get(META, key);
}
