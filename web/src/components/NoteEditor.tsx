import React from 'react';
import type { Note } from '../types';
import { notesStore } from '../store/notesStore';
import { syncWithServer } from '../api/sync';

export default function NoteEditor({
  note,
}: {
  note: Note | null;
}) {
  if (!note) {
    return <div className="text-gray-500">Select a note to edit.</div>;
  }

  const handleChange = async (patch: Partial<Pick<Note, 'title' | 'body'>>) => {
    // Update in local store (marks dirty + saves locally)
    notesStore.update(note.id, patch);

    // Immediately sync dirty notes to server
    await syncWithServer(() => notesStore.getDirty());
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <input
        value={note.title}
        onChange={(e) => handleChange({ title: e.target.value })}
        placeholder="Title"
        aria-label="Note title"
        className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <textarea
        value={note.body}
        onChange={(e) => handleChange({ body: e.target.value })}
        placeholder="Start typing..."
        aria-label="Note body"
        className="min-h-[300px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
