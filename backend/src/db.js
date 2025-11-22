import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db;

export async function initDB() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  db = await open({ filename: path.join(dataDir, 'hms.sqlite'), driver: sqlite3.Database });

  await db.exec('PRAGMA foreign_keys = ON;');

  // Initialize schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      availability TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      patient_id INTEGER,
      doctor_id INTEGER,
      report_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL,
      FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      total REAL DEFAULT 0,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      shift TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure 'time' column exists for appointments (migration for older DBs)
  try {
    const cols = await db.all("PRAGMA table_info(appointments)");
    if (!cols.find(c => c.name === 'time')) {
      await db.exec('ALTER TABLE appointments ADD COLUMN time TEXT');
      console.log('Migrated appointments table: added time column');
    }
  } catch (e) {
    console.warn('Could not verify/migrate appointments.time column:', e.message);
  }

  // Seed an admin if none exists
  const admin = await db.get('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
  if (!admin) {
    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
      ['Admin', 'admin@hms.local', hash, 'admin']
    );
    console.log('Seeded default admin: admin@hms.local / admin123');
  }

  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}