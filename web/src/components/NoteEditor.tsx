import React from 'react';
import type { Note } from '../types';
import { notesStore } from '../store/notesStore';
import { syncWithServer } from '../api/sync';

export default function NoteEditor({ note }: { note: Note | null }) {
  if (!note) {
    return <div className="text-gray-500">Select a note to edit.</div>;
  }

  // Local input state so we can clear after saving
  const [title, setTitle] = React.useState(note.title || '');
  const [body, setBody] = React.useState(note.body || '');
  const [saving, setSaving] = React.useState(false);

  // When switching notes, load its content into local state
  React.useEffect(() => {
    setTitle(note.title || '');
    setBody(note.body || '');
  }, [note.id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update in local store
      notesStore.update(note.id, { title, body });

      // Sync dirty notes to server
      await syncWithServer(() => notesStore.getDirty());

      // Clear inputs after successful save
      setTitle('');
      setBody('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Note title"
        className="rounded-lg border bg-blue-100 border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start typing..."
        aria-label="Note body"
        className="min-h-[300px] flex-1 bg-slate-300 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {/* Save button pinned at the bottom of the editor */}
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !body.trim())}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:translate-y-px disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
