#!/bin/sh

set -e

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npx prisma migrate deploy
npx prisma studio --port 5555 --browser none &
exec npm run start:dev
