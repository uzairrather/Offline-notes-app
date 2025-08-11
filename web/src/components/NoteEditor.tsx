import React from 'react';
import type { Note } from '../types';

type NoteEditorProps = {
  note: Note | null;
  onChange: (patch: Partial<Pick<Note, 'title' | 'body'>>) => void | Promise<void>;
};

export default function NoteEditor({ note, onChange }: NoteEditorProps) {
  if (!note) {
    return <div className="text-gray-500">Select a note to edit.</div>;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <input
        value={note.title ?? ''}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        aria-label="Note title"
        className="rounded-lg border bg-blue-100 border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <textarea
        value={note.body ?? ''}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Start typing..."
        aria-label="Note body"
        className="min-h-[300px] flex-1 bg-slate-300 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="mt-2 text-xs text-gray-500 text-right">
        Changes are saved & synced automatically.
      </div>
    </div>
  );
}
