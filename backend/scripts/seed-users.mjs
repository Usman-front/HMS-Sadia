import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

function nameFromEmail(email) {
  const base = String(email).split('@')[0];
  return base.replace(/\./g, ' ').replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());
}

async function upsertUser(users, { name, email, password, role }) {
  const hash = bcrypt.hashSync(password, 10);
  const exists = await users.findOne({ email });
  if (exists) {
    await users.updateOne({ _id: exists._id }, { $set: { name, role, password_hash: hash } });
    console.log(`Updated ${email}`);
  } else {
    await users.insertOne({ name, email, password_hash: hash, role, created_at: new Date() });
    console.log(`Inserted ${email}`);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://usman64446_db_user:1122334455%24%2B@cluster0.gragzo1.mongodb.net/?HMS=Cluster0';
  const dbName = process.env.DB_NAME || 'hms';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const usersColl = db.collection('users');
  const users = [
    { email: 'usman@gmail.com', role: 'admin', password: '12345' },
    { email: 'malaika@gmail.com', role: 'doctor', password: '12345' },
    { email: 'sadia@gmail.com', role: 'doctor', password: '12345' },
    { email: 'moosa@gmail.com', role: 'doctor', password: '12345' },
    { email: 'recep@gmail.com', role: 'receptionist', password: '12345' },
  ];
  for (const u of users) {
    await upsertUser(usersColl, { ...u, name: nameFromEmail(u.email) });
  }
  await client.close();
  console.log('Seeding complete');
}

main().catch((e) => {
  console.error('Failed to seed users:', e);
  process.exit(1);
});
