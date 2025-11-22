import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

let client;
let db;

export async function initDB() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://usman64446_db_user:1122334455%24%2B@cluster0.gragzo1.mongodb.net/?HMS=Cluster0';
  const dbName = process.env.DB_NAME || 'hms';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  const admin = await db.collection('users').findOne({ role: 'admin' });
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.collection('users').insertOne({
      name: 'Admin',
      email: 'admin@hms.local',
      password_hash: hash,
      role: 'admin',
      created_at: new Date(),
    });
    console.log('Seeded default admin: admin@hms.local / admin123');
  }

  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}

export function getCollection(name) {
  if (!db) throw new Error('DB not initialized');
  return db.collection(name);
}
