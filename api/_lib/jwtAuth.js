import jwt from 'jsonwebtoken';
import pool from './db.js';
import * as cookie from 'cookie';

export async function authenticateToken(req) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is in CJWT table
        const [rows] = await pool.query('SELECT * FROM CJWT WHERE token = ? AND uid = ?', [token, decoded.uid]);

        if (rows.length === 0) {
            return null;
        }

        return decoded.uid;
    } catch (err) {
        return null;
    }
}
