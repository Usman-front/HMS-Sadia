import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, getDB, getCollection } from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.includes(origin);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));
app.use(express.json());

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
// Registration restricted to admin users only
app.post('/api/auth/register', authMiddleware, async (req, res) => {
  const users = getCollection('users');
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  // Only admins can create accounts
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  try {
    const exists = await users.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    const result = await users.insertOne({ name, email, password_hash: hash, role, created_at: new Date() });
    const user = { id: String(result.insertedId), name, email, role };
    // Return created user (do not auto-issue token for created account)
    res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const users = getCollection('users');
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const row = await users.findOne({ email });
    if (!row) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const user = { id: String(row._id), name: row.name, email: row.email, role: row.role };
    const token = sign(user);
    res.json({ user: { ...user, token } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const users = getCollection('users');
  const row = await users.findOne({ _id: new ObjectId(String(req.user.id)) }, { projection: { name: 1, email: 1, role: 1 } });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { id: String(row._id), name: row.name, email: row.email, role: row.role } });
});

// Generic CRUD helpers
function toClient(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function crud(collectionName, fields) {
  const router = express.Router();
  const coll = () => getCollection(collectionName);
  router.get('/', authMiddleware, async (req, res) => {
    const rows = await coll().find({}).sort({ _id: -1 }).toArray();
    res.json(rows.map(toClient));
  });
  router.post('/', authMiddleware, async (req, res) => {
    const data = fields.reduce((acc, f) => ({ ...acc, [f]: req.body[f] }), {});
    const result = await coll().insertOne({ ...data, created_at: new Date() });
    const row = await coll().findOne({ _id: result.insertedId });
    res.status(201).json(toClient(row));
  });
  router.put('/:id', authMiddleware, async (req, res) => {
    const updates = fields.reduce((acc, f) => ({ ...acc, [f]: req.body[f] }), {});
    await coll().updateOne({ _id: new ObjectId(String(req.params.id)) }, { $set: updates });
    const row = await coll().findOne({ _id: new ObjectId(String(req.params.id)) });
    res.json(toClient(row));
  });
  router.delete('/:id', authMiddleware, async (req, res) => {
    await coll().deleteOne({ _id: new ObjectId(String(req.params.id)) });
    res.json({ success: true });
  });
  return router;
}

// Entity routes
app.use('/api/patients', crud('patients', ['name', 'age', 'gender', 'contact']));
app.use('/api/doctors', crud('doctors', ['name', 'specialty', 'availability']));
app.use('/api/medicines', crud('medicines', ['name', 'stock', 'price']));
app.use('/api/staff', crud('staff', ['name', 'role', 'shift']));

// Appointments: custom fields with foreign keys
const apptRouter = express.Router();
apptRouter.get('/', authMiddleware, async (req, res) => {
  const rows = await getCollection('appointments').find({}).sort({ _id: -1 }).toArray();
  res.json(rows.map(toClient));
});
apptRouter.post('/', authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, date, time, status, notes } = req.body;
  const result = await getCollection('appointments').insertOne({
    patient_id,
    doctor_id,
    date,
    time: time || '',
    status: status || 'scheduled',
    notes: notes || '',
    created_at: new Date(),
  });
  const row = await getCollection('appointments').findOne({ _id: result.insertedId });
  res.status(201).json(toClient(row));
});
apptRouter.put('/:id', authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, date, time, status, notes } = req.body;
  await getCollection('appointments').updateOne(
    { _id: new ObjectId(String(req.params.id)) },
    { $set: { patient_id, doctor_id, date, time: time || '', status, notes } }
  );
  const row = await getCollection('appointments').findOne({ _id: new ObjectId(String(req.params.id)) });
  res.json(toClient(row));
});
apptRouter.delete('/:id', authMiddleware, async (req, res) => {
  await getCollection('appointments').deleteOne({ _id: new ObjectId(String(req.params.id)) });
  res.json({ success: true });
});
app.use('/api/appointments', apptRouter);

// Lab tests
app.use('/api/lab-tests', crud('lab_tests', ['name', 'status', 'patient_id', 'doctor_id', 'report_url']));

// Billing/invoices
app.use('/api/invoices', crud('invoices', ['patient_id', 'total', 'status']));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Bootstrap
initDB().then(() => {
  app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init DB', e);
  process.exit(1);
});
