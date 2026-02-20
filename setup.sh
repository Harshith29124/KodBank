#!/bin/bash
echo "🚀 Setting up KodBank..."
echo "📦 Installing dependencies..."
npm install
echo "🔗 Logging into Vercel..."
npx vercel login
echo "🔗 Linking project to Vercel..."
npx vercel link
echo "⬇️ Pulling environment variables..."
npx vercel env pull .env.local
echo "✅ Setup complete! Starting dev server..."
npx vercel dev
