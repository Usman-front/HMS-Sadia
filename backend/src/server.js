import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, getDB } from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'https://hms-frontend-ekhe.onrender.com', credentials: true }));
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
  const db = getDB();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  // Only admins can create accounts
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  try {
    const exists = await db.get('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [name, email, hash, role]);
    const user = { id: result.lastID, name, email, role };
    // Return created user (do not auto-issue token for created account)
    res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const db = getDB();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const row = await db.get('SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1', [email]);
    if (!row) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = sign(user);
    res.json({ user: { ...user, token } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const db = getDB();
  const row = await db.get('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ user: row });
});

// Generic CRUD helpers
function crud(table, fields) {
  const router = express.Router();
  router.get('/', authMiddleware, async (req, res) => {
    const rows = await getDB().all(`SELECT * FROM ${table} ORDER BY id DESC`);
    res.json(rows);
  });
  router.post('/', authMiddleware, async (req, res) => {
    const data = fields.reduce((acc, f) => ({ ...acc, [f]: req.body[f] }), {});
    const placeholders = fields.map(() => '?').join(',');
    const result = await getDB().run(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${placeholders})`, fields.map(f => data[f]));
    const row = await getDB().get(`SELECT * FROM ${table} WHERE id = ?`, [result.lastID]);
    res.status(201).json(row);
  });
  router.put('/:id', authMiddleware, async (req, res) => {
    const sets = fields.map(f => `${f} = ?`).join(',');
    const values = fields.map(f => req.body[f]);
    await getDB().run(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...values, req.params.id]);
    const row = await getDB().get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    res.json(row);
  });
  router.delete('/:id', authMiddleware, async (req, res) => {
    await getDB().run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
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
  const rows = await getDB().all(`
    SELECT a.*, p.name as patient_name, d.name as doctor_name
    FROM appointments a
    LEFT JOIN patients p ON p.id = a.patient_id
    LEFT JOIN doctors d ON d.id = a.doctor_id
    ORDER BY a.id DESC
  `);
  res.json(rows);
});
apptRouter.post('/', authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, date, time, status, notes } = req.body;
  const result = await getDB().run(
    'INSERT INTO appointments (patient_id, doctor_id, date, time, status, notes) VALUES (?,?,?,?,?,?)',
    [patient_id, doctor_id, date, time || '', status || 'scheduled', notes || '']
  );
  const row = await getDB().get('SELECT * FROM appointments WHERE id = ?', [result.lastID]);
  res.status(201).json(row);
});
apptRouter.put('/:id', authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, date, time, status, notes } = req.body;
  await getDB().run(
    'UPDATE appointments SET patient_id=?, doctor_id=?, date=?, time=?, status=?, notes=? WHERE id = ?',
    [patient_id, doctor_id, date, time || '', status, notes, req.params.id]
  );
  const row = await getDB().get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
  res.json(row);
});
apptRouter.delete('/:id', authMiddleware, async (req, res) => {
  await getDB().run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
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
