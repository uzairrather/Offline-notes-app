import { apiPost } from './client';
import type { Note, SyncPayload, SyncResponse } from '../types'; // <-- adjust path if your types live here
import { notesStore } from '../store/notesStore';
import {
  storageGetAllNotes,
  storageGetLastSync,
  storageSetLastSync,
  storageSetAllNotes,
} from '../store/storage';
import { SERVER_URL } from './config';

export async function initialHydrate() {
  await notesStore.hydrateFromStorage();
}

export async function syncNow() {
  const since = await storageGetLastSync();
  let changes: Note[];

  if (!since) {
    changes = await storageGetAllNotes();  // first sync: push everything
  } else {
    changes = notesStore.getDirty();
  }

  console.log('[MOBILE] Sync →', { SERVER_URL, since, changesCount: changes.length });

  let resp: SyncResponse;
  try {
    const payload: SyncPayload = { since, changes };
    resp = await apiPost<SyncResponse>('/sync', payload);
  } catch (e: any) {
    console.log('[MOBILE] Sync failed:', e?.message || e);
    throw e;
  }

  console.log('[MOBILE] Sync OK ←', { serverTime: resp.serverTime, serverNotes: resp.notes?.length ?? 0 });

  if (resp.notes?.length) {
    notesStore.applyFromServer(resp.notes);
  }

  const ids = changes.map(c => c.id);
  notesStore.clearDirty(ids);
  await storageSetAllNotes(notesStore.snapshot().notes);
  await storageSetLastSync(resp.serverTime);
  return resp.serverTime;
}
