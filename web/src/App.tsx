import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import { useNotes } from "./hooks/useNotes";
import { notesStore } from "./store/notesStore";
import { hydrateFromStorage, syncWithServer } from "./api/sync";
import SyncStatus from "./components/SyncStatus";
import SearchBar from "./components/SearchBar";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import type { Note } from "./types";

export default function App() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const notes = useNotes(debounced);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await hydrateFromStorage();
      notesStore.hydrate(stored);
    })();
  }, []);

  const selectedNote: Note | null = useMemo(
    () => (selectedId ? notes.find((n) => n.id === selectedId) || null : null),
    [selectedId, notes]
  );

  async function handleSync() {
    const dirty = notesStore.getDirty();
    const serverTime = await syncWithServer(
      () => dirty,
      async (serverNotes) => {
        notesStore.applyFromServer(serverNotes);
        const ids = dirty.map((d) => d.id);
        notesStore.clearDirty(ids);
      }
    );
    setLastSync(new Date(serverTime).toISOString()); // store as string
  }

  async function handleNew() {
    const id = notesStore.create();
    setSelectedId(id);
    await handleSync(); // ← trigger sync after create
  }

  async function handleDelete(id: string) {
    notesStore.softDelete(id);
    if (selectedId === id) setSelectedId(null);
    await handleSync(); // ← trigger sync after delete
  }

  async function handlePatch(patch: Partial<Pick<Note, "title" | "body">>) {
    if (!selectedId) return;
    notesStore.update(selectedId, patch);
    await handleSync(); // ← trigger sync after edit
  }

  useEffect(() => {
    function onlineSync() {
      handleSync().catch(() => {});
    }
    window.addEventListener("online", onlineSync);
    return () => window.removeEventListener("online", onlineSync);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-[#0a0823] text-white">
  <h1 className="absolute left-1/2 -translate-x-1/2 m-0 text-lg font-semibold">
    Offline-First Notes (Web)
  </h1>

  <div className="flex items-center gap-3 ml-auto">
    <div className="shrink-0"><SyncStatus lastSync={lastSync} /></div>
    <button
      onClick={handleSync}
      className="rounded-lg border text-black border-gray-300 bg-blue-200 px-3 py-1.5 text-sm hover:bg-gray-500 active:translate-y-px"
    >
      Sync
    </button>
  </div>
</header>


      <main className="grid flex-1 gap-4 p-4 md:grid-cols-[320px_1fr] bg-slate-400">
        <aside className="flex h-[calc(100vh-160px)] flex-col">
          <SearchBar value={search} onChange={setSearch} />
          <div className="h-3" />
          <NoteList
            notes={notes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        </aside>

        <section className="min-h-[400px]">
          <NoteEditor note={selectedNote} />
        </section>
      </main>

      <footer className="border-t border-red-400 px-4 py-3 text-xs text-gray-500">
        TypeScript + Vite • IndexedDB fallback to localStorage • Debounced
        search • Custom store
      </footer>
    </div>
  );
}
