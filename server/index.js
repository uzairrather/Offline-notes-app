const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ---- Helpers ----
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

async function ensureDbFile() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ notes: [] }, null, 2), 'utf-8');
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function isoNow() {
  return new Date().toISOString();
}

// Simulated latency (200–500ms)
function delay(min = 200, max = 500) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((res) => setTimeout(res, ms));
}

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(async (_req, _res, next) => {
  await delay();
  next();
});

// ---- Routes ----
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: isoNow() });
});

// Get all notes (including soft-deleted; client can filter)
app.get('/notes', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json({ notes: db.notes, serverTime: isoNow() });
  } catch (err) {
    next(err);
  }
});

// Create note
app.post('/notes', async (req, res, next) => {
  try {
    const { id, title, body, updatedAt, deleted } = req.body || {};
    if (!id || typeof title !== 'string' || typeof body !== 'string' || !updatedAt) {
      return res.status(400).json({ error: 'Invalid payload. Required: {id, title, body, updatedAt}' });
    }
    const db = await readDb();
    const exists = db.notes.find((n) => n.id === id);
    if (exists) {
      return res.status(409).json({ error: 'Note with this id already exists' });
    }
    db.notes.push({ id, title, body, updatedAt, deleted: !!deleted });
    await writeDb(db);
    res.status(201).json({ ok: true, note: { id, title, body, updatedAt, deleted: !!deleted } });
  } catch (err) {
    next(err);
  }
});

// Update note
app.put('/notes/:id', async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const { title, body, updatedAt, deleted } = req.body || {};
    if (!updatedAt) {
      return res.status(400).json({ error: 'updatedAt is required' });
    }
    const db = await readDb();
    const idx = db.notes.findIndex((n) => n.id === noteId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const current = db.notes[idx];
    // Only accept if newer
    if (new Date(updatedAt) <= new Date(current.updatedAt)) {
      return res.status(409).json({ error: 'Incoming update is not newer than server version' });
    }
    db.notes[idx] = {
      ...current,
      title: typeof title === 'string' ? title : current.title,
      body: typeof body === 'string' ? body : current.body,
      deleted: typeof deleted === 'boolean' ? deleted : current.deleted,
      updatedAt
    };
    await writeDb(db);
    res.json({ ok: true, note: db.notes[idx] });
  } catch (err) {
    next(err);
  }
});

// Hard delete
app.delete('/notes/:id', async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const db = await readDb();
    const idx = db.notes.findIndex((n) => n.id === noteId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const [removed] = db.notes.splice(idx, 1); // physically remove from array
    await writeDb(db);
    res.json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
});

/**
 * Sync endpoint
 * Body: { since?: string | null, changes?: Note[] }
 * - Apply incoming changes using "last-writer-wins" by updatedAt.
 * - Respect deletes from client (hard delete).
 * - Return notes changed on server since `since`.
 */
app.post('/sync', async (req, res, next) => {
  try {
    const { since = null, changes = [] } = req.body || {};
    const db = await readDb();

    // Apply client changes
    for (const incoming of Array.isArray(changes) ? changes : []) {
      if (!incoming || !incoming.id || !incoming.updatedAt) continue;

      const idx = db.notes.findIndex((n) => n.id === incoming.id);

      // If client marks as deleted, hard-delete on server
      if (incoming.deleted === true) {
        if (idx !== -1) {
          db.notes.splice(idx, 1);
        }
        continue;
      }

      if (idx === -1) {
        // New note from client
        db.notes.push({
          id: incoming.id,
          title: incoming.title || '',
          body: incoming.body || '',
          updatedAt: incoming.updatedAt,
          deleted: !!incoming.deleted
        });
      } else {
        // Merge with LWW
        const current = db.notes[idx];
        if (new Date(incoming.updatedAt) > new Date(current.updatedAt)) {
          db.notes[idx] = {
            ...current,
            title: typeof incoming.title === 'string' ? incoming.title : current.title,
            body: typeof incoming.body === 'string' ? incoming.body : current.body,
            deleted: typeof incoming.deleted === 'boolean' ? incoming.deleted : !!current.deleted,
            updatedAt: incoming.updatedAt
          };
        }
      }
    }

    await writeDb(db);

    // Collect server changes since `since`
    let changed = db.notes;
    if (since) {
      const sinceDate = new Date(since);
      changed = db.notes.filter((n) => new Date(n.updatedAt) > sinceDate);
    }

    res.json({
      serverTime: isoNow(),
      notes: changed
    });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', detail: String(err?.message || err) });
});

app.listen(PORT, async () => {
  await ensureDbFile();
  console.log(`Mock API running on http://localhost:${PORT}`);
});
