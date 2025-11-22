import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://usman64446_db_user:1122334455%24%2B@cluster0.gragzo1.mongodb.net/?HMS=Cluster0';
  const dbName = process.env.DB_NAME || 'hms';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const rows = await db.collection('users').find({}).sort({ name: 1 }).project({ name: 1, email: 1, role: 1 }).toArray();
  console.log('Users (id, name, email, role):');
  for (const r of rows) {
    console.log(`${String(r._id)}\t${r.name}\t${r.email}\t${r.role}`);
  }
  await client.close();
}

main().catch((e) => {
  console.error('Failed to list users:', e);
  process.exit(1);
});
