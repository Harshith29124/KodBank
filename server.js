import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { runMigrations } from './api/_lib/migrations.js';

// Import Vercel handlers
import registerHandler from './api/register.js';
import loginHandler from './api/login.js';
import balanceHandler from './api/balance.js';
import logoutHandler from './api/logout.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// CORS configuration for local dev
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Mock Vercel req/res for the handlers
const wrapHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('Handler Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Routes
app.post('/api/register', wrapHandler(registerHandler));
app.post('/api/login', wrapHandler(loginHandler));
app.get('/api/balance', wrapHandler(balanceHandler));
app.post('/api/logout', wrapHandler(logoutHandler));

// Initialize and start
console.log('🚀 Starting KodBank Local Server...');

runMigrations()
    .then(() => {
        console.log('✅ Migrations completed successfully.');
        app.listen(PORT, () => {
            console.log(`📡 Backend ready at http://localhost:${PORT}`);
            console.log(`🔗 Frontend should proxy to this via http://localhost:5173`);
        });
    })
    .catch(err => {
        console.error('❌ Failed to run migrations/start server:', err);
        // Still start the server so we can debug DB issues via API calls
        app.listen(PORT, () => {
            console.log(`📡 Backend started (but DB failed) at http://localhost:${PORT}`);
        });
    });
