import { authenticateToken } from './_lib/jwtAuth.js';
import pool from './_lib/db.js';
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
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.auth_token;

        if (token) {
            await pool.query('DELETE FROM CJWT WHERE token = ?', [token]);
        }

        const serializedCookie = cookie.serialize('auth_token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: -1,
            path: '/'
        });

        res.setHeader('Set-Cookie', serializedCookie);
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
