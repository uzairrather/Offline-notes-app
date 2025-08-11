import { v4 as uuid } from 'uuid';
import type { Note } from '../types';
import { storageGetAllNotes, storagePutNote, storageRemoveNote } from './storage';

type Listener = () => void;

export type StoreSnapshot = {
  version: number;
  notes: Note[];
};

class NotesStore {
  private notes = new Map<string, Note>();
  private dirty = new Set<string>();
  private listeners = new Set<Listener>();

  private version = 0;
  private cachedAll: Note[] = [];
  private snapshotCache: StoreSnapshot = { version: 0, notes: [] };
  private lastServerApply = 0;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private rebuildCache() {
    this.cachedAll = Array.from(this.notes.values());
    this.snapshotCache = { version: this.version, notes: this.cachedAll };
  }

  private emit() {
    this.version++;
    this.rebuildCache();
    for (const fn of this.listeners) fn();
  }

  async hydrateFromStorage() {
    const all = await storageGetAllNotes();
    this.notes.clear();
    for (const n of all) this.notes.set(n.id, n);
    this.emit();
  }

  snapshot(): StoreSnapshot {
    return this.snapshotCache;
  }

  getAllActive(): Note[] {
    return Array.from(this.notes.values()).filter(n => !n.deleted);
  }

  create() {
    const now = new Date().toISOString();
    const n: Note = { id: uuid(), title: '', body: '', updatedAt: now };
    this.notes.set(n.id, n);
    this.markDirty(n.id);
    storagePutNote(n);
    this.emit();
    return n.id;
  }

  update(id: string, patch: Partial<Omit<Note, 'id' | 'updatedAt'>>) {
    const existing = this.notes.get(id);
    if (!existing) return;
    const updated: Note = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.notes.set(id, updated);
    this.markDirty(id);
    storagePutNote(updated);
    this.emit();
  }

  softDelete(id: string) {
    const existing = this.notes.get(id);
    if (!existing) return;
    const updated: Note = { ...existing, deleted: true, updatedAt: new Date().toISOString() };
    this.notes.set(id, updated);
    this.markDirty(id);
    storagePutNote(updated);
    this.emit();
  }

  // Purge a note locally (after server confirmed deletion)
  async purgeLocal(id: string) {
    this.notes.delete(id);
    await storageRemoveNote(id);
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
    return Array.from(this.dirty).map(id => this.notes.get(id)!).filter(Boolean);
  }

  clearDirty(ids: string[]) {
    for (const id of ids) this.dirty.delete(id);
  }

  private markDirty(id: string) {
    if (this.lastServerApply) return;
    this.dirty.add(id);
  }
}

export const notesStore = new NotesStore();
