import bcrypt from 'bcrypt';
import pool from './_lib/db.js';
import { runMigrations } from './_lib/migrations.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.VITE_API_BASE_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await runMigrations(); // Ensure tables exist

        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [existing] = await pool.query('SELECT * FROM kodusers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 12);
        const role = 'Customer';
        const balance = 100000.00;

        const [result] = await pool.query(
            'INSERT INTO kodusers (username, email, password_hash, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, phone || null, role, balance]
        );

        return res.status(201).json({ message: 'User registered successfully', uid: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
