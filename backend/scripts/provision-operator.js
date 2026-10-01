import { createPool } from './database.js';
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) throw new Error('Usage: npm run operator:approve -- registered-email');
const pool = createPool();
try {
  const result = await pool.query("UPDATE users SET role='tour_operator' WHERE email=$1 AND role='tourist' RETURNING id",[email]);
  if (result.rowCount !== 1) throw new Error('Exactly one existing tourist account is required');
  console.log('Operator approved. The account can log in again.');
} finally { await pool.end(); }
