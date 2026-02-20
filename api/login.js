import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './_lib/db.js';
import { runMigrations } from './_lib/migrations.js';
import * as cookie from 'cookie';

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

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const [users] = await pool.query('SELECT * FROM kodusers WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Cleanup expired tokens on each login
        await pool.query('DELETE FROM CJWT WHERE expiry < NOW()');

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // expiry is 24 hours from now
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);

        await pool.query(
            'INSERT INTO CJWT (token, uid, expiry) VALUES (?, ?, ?)',
            [token, user.uid, expiryDate]
        );

        const serializedCookie = cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 86400,
            path: '/'
        });

        res.setHeader('Set-Cookie', serializedCookie);
        return res.status(200).json({ message: 'Logged in successfully', user: { uid: user.uid, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
