# KodBank Setup Guide

## First Time Setup
Run these commands in order:

npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npx vercel dev

## Environment Variables to add on Vercel Dashboard
DB_HOST=n5u7op.h.filess.io
DB_PORT=61001
DB_USER=kodbank_helpbreeze
DB_PASSWORD=your_password_here
DB_NAME=kodbank_helpbreeze
JWT_SECRET=any_random_long_string_min_32_chars
VITE_API_BASE_URL=https://your-vercel-app.vercel.app

## Local Development
npm run dev

## Deploy to Production
npm run deploy

## Project Structure
- /api → Vercel serverless functions (backend)
- /src → Vite frontend
- /api/_lib → shared db, auth, migrations
