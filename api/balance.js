import { authenticateToken } from './_lib/jwtAuth.js';
import pool from './_lib/db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.VITE_API_BASE_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const uid = await authenticateToken(req);
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const [users] = await pool.query('SELECT balance, username, role, created_at FROM kodusers WHERE uid = ?', [uid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error('Balance error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
