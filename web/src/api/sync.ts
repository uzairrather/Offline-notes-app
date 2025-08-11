import { apiPost } from './client';
import type { Note, SyncPayload, SyncResponse } from '../types';
import {
  storageGetAllNotes,
  storageGetLastSync,
  storagePutNote,
  storageSetLastSync,
} from '../db/storage';

/**
 * Sync flow:
 * - If this is the FIRST sync (lastSync is null), push ALL local notes.
 * - Otherwise, push only notes returned by getDirtyNotes().
 * - Always pull server changes since `since`.
 */
export async function syncWithServer(
  getDirtyNotes: () => Note[],
  onServerNotes?: (notes: Note[]) => Promise<void> | void
) {
  const since = await storageGetLastSync();

  let changes: Note[];
  if (!since) {
    // First ever sync: push everything we have locally
    changes = await storageGetAllNotes();
  } else {
    changes = getDirtyNotes();
  }

  const payload: SyncPayload = { since, changes };
  const resp = await apiPost<SyncResponse>('/sync', payload);

  // Apply server changes locally
  if (resp.notes?.length) {
    if (onServerNotes) {
      await onServerNotes(resp.notes);
    } else {
      for (const n of resp.notes) {
        await storagePutNote(n);
      }
    }
  }

  // Save last sync time
  await storageSetLastSync(resp.serverTime);
  return resp.serverTime;
}

// Utility to load everything (initial hydration)
export async function hydrateFromStorage(): Promise<Note[]> {
  return storageGetAllNotes();
}
