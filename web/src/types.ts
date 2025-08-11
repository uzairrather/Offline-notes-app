export interface Note {
  id: string;         // UUID
  title: string;
  body: string;
  updatedAt: string;  // ISO string
  deleted?: boolean;  // soft-delete
}

export interface SyncPayload {
  since: string | null;
  changes: Note[];
}

export interface SyncResponse {
  serverTime: string;
  notes: Note[];
}
