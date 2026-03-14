#!/bin/sh

set -e

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npx prisma migrate deploy
npx prisma studio --port 5555 --browser none &
npm start &
cd /app/frontend
exec npm run dev -- --host 0.0.0.0
