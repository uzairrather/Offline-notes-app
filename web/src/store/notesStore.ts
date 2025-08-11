import { v4 as uuid } from 'uuid';
import type { Note } from '../types';
import { storagePutNote } from '../db/storage';

type Listener = () => void;

export type StoreSnapshot = {
  version: number;
  notes: Note[]; // full list; components can filter
};

class NotesStore {
  private notes = new Map<string, Note>();
  private dirty = new Set<string>(); // ids changed since last sync
  private listeners = new Set<Listener>();

  // ---- snapshot caching to keep getSnapshot stable ----
  private version = 0;
  private cachedAll: Note[] = [];
  private snapshotCache: StoreSnapshot = { version: 0, notes: [] };

  private lastServerApply = 0; // avoid marking server-applied changes as dirty

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private rebuildCache() {
    // Build the notes array once per change (stable between changes)
    this.cachedAll = Array.from(this.notes.values());
    this.snapshotCache = { version: this.version, notes: this.cachedAll };
  }

  private emit() {
    this.version++;
    this.rebuildCache();
    for (const fn of this.listeners) fn();
  }

  // ----- Public API -----
  hydrate(all: Note[]) {
    this.notes.clear();
    for (const n of all) this.notes.set(n.id, n);
    this.emit();
  }

  // Stable object; identity only changes when store emits
  snapshot(): StoreSnapshot {
    return this.snapshotCache;
  }

  get(id: string) {
    return this.notes.get(id);
  }

  create() {
    const now = new Date().toISOString();
    const n: Note = { id: uuid(), title: '', body: '', updatedAt: now };
    this.notes.set(n.id, n);
    this.markDirty(n.id);
    this.persist(n);
    this.emit();
    return n.id;
  }

  update(id: string, patch: Partial<Omit<Note, 'id' | 'updatedAt'>>) {
    const existing = this.notes.get(id);
    if (!existing) return;
    const updated: Note = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.notes.set(id, updated);
    this.markDirty(id);
    this.persist(updated);
    this.emit();
  }

  softDelete(id: string) {
    const existing = this.notes.get(id);
    if (!existing) return;
    const updated: Note = { ...existing, deleted: true, updatedAt: new Date().toISOString() };
    this.notes.set(id, updated);
    this.markDirty(id);
    this.persist(updated);
    this.emit();
  }

  applyFromServer(serverNotes: Note[]) {
    this.lastServerApply = Date.now();
    for (const sn of serverNotes) {
      const current = this.notes.get(sn.id);
      if (!current || new Date(sn.updatedAt) >= new Date(current.updatedAt)) {
        this.notes.set(sn.id, sn);
      }
    }
    this.emit();
    setTimeout(() => (this.lastServerApply = 0), 0);
  }

  getDirty(): Note[] {
    return Array.from(this.dirty).map((id) => this.notes.get(id)!).filter(Boolean);
  }

  clearDirty(ids: string[]) {
    for (const id of ids) this.dirty.delete(id);
  }

  private markDirty(id: string) {
    if (this.lastServerApply) return;
    this.dirty.add(id);
  }

  private async persist(n: Note) {
    await storagePutNote(n);
  }
}

export const notesStore = new NotesStore();
