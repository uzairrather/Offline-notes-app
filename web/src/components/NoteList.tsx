import React from 'react';
import type { Note } from '../types';

export default function NoteList({
  notes,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex gap-2">
        <button
          onClick={onNew}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 active:translate-y-px"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-gray-500">No notes yet.</div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              onClick={() => onSelect(n.id)}
              className={`mb-2 cursor-pointer rounded-lg border p-3 ${
                selectedId === n.id ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-200'
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <strong className="block max-w-[70%] truncate">{n.title || 'Untitled'}</strong>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(n.id);
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
              <div className="text-xs text-gray-500">{new Date(n.updatedAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
