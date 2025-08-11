const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(dbPath, JSON.stringify({ notes: [] }, null, 2), 'utf-8');
console.log('Database reset: data/db.json -> { "notes": [] }');
