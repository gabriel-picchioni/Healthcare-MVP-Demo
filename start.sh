#!/bin/bash
set -e

echo "🔄 Running database migrations..."
npm run migrate

echo "🌱 Seeding database..."
npm run seed

echo "🚀 Starting server..."
exec node server/server.js
