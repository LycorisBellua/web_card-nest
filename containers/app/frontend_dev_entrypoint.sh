#!/bin/sh

set -e

cd /app/backend
npm install
npx prisma migrate deploy
npm start &
cd /app/frontend
npm install
exec npm run dev -- --host 0.0.0.0
