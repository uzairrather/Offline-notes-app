import { useMemo, useSyncExternalStore } from 'react';
import { notesStore, type StoreSnapshot } from '../store/notesStore';
import type { Note } from '../types';

function subscribe(callback: () => void) {
  return notesStore.subscribe(callback);
}

function getSnapshot(): StoreSnapshot {
  return notesStore.snapshot();
}

export function useNotes(search: string): Note[] {
  const snap = useSyncExternalStore<StoreSnapshot>(subscribe, getSnapshot, getSnapshot);
  const all = snap.notes.filter((n) => !n.deleted);

  const q = search.trim().toLowerCase();
  return useMemo(() => {
    if (!q) return all;
    return all.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }, [all, q]);
}
