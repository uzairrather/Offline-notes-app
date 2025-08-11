export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  deleted?: boolean;
}


export interface SyncPayload {
  since: string | null;
  changes: Note[];
}

export interface SyncResponse {
  serverTime: string;
  notes: Note[];
}
