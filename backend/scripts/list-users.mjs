import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

async function main() {
  // Try common locations depending on where the server is started from
  const candidates = [
    path.join(process.cwd(), 'data', 'hms.sqlite'),
    path.join(process.cwd(), 'backend', 'data', 'hms.sqlite'),
  ];
  const dbPath = candidates.find((p) => fs.existsSync(p));
  if (!dbPath) throw new Error('Could not find hms.sqlite in data/ or backend/data');

  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const rows = await db.all('SELECT id, name, email, role FROM users ORDER BY id');
  console.log('Users (id, name, email, role):');
  for (const r of rows) {
    console.log(`${r.id}\t${r.name}\t${r.email}\t${r.role}`);
  }
  await db.close();
}

main().catch((e) => {
  console.error('Failed to list users:', e);
  process.exit(1);
});