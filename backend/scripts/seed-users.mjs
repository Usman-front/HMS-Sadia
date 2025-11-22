import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

async function getDB() {
  const candidates = [
    path.join(process.cwd(), 'data', 'hms.sqlite'),
    path.join(process.cwd(), 'backend', 'data', 'hms.sqlite'),
  ];
  const dbPath = candidates.find((p) => fs.existsSync(p));
  if (!dbPath) throw new Error('Could not find hms.sqlite in data/ or backend/data');
  return open({ filename: dbPath, driver: sqlite3.Database });
}

async function upsertUser(db, { name, email, password, role }) {
  const exists = await db.get('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  const hash = bcrypt.hashSync(password, 10);
  if (exists) {
    await db.run('UPDATE users SET name = ?, role = ?, password_hash = ? WHERE id = ?', [name, role, hash, exists.id]);
    console.log(`Updated ${email}`);
  } else {
    await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [name, email, hash, role]);
    console.log(`Inserted ${email}`);
  }
}

function nameFromEmail(email) {
  const base = String(email).split('@')[0];
  return base.replace(/\./g, ' ').replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());
}

async function main() {
  const db = await getDB();
  const users = [
    { email: 'usman@gmail.com', role: 'admin', password: '12345' },
    { email: 'malaika@gmail.com', role: 'doctor', password: '12345' },
    { email: 'sadia@gmail.com', role: 'doctor', password: '12345' },
    { email: 'moosa@gmail.com', role: 'doctor', password: '12345' },
    { email: 'recep@gmail.com', role: 'receptionist', password: '12345' },
  ];
  for (const u of users) {
    await upsertUser(db, { ...u, name: nameFromEmail(u.email) });
  }
  await db.close();
  console.log('Seeding complete');
}

main().catch((e) => {
  console.error('Failed to seed users:', e);
  process.exit(1);
});