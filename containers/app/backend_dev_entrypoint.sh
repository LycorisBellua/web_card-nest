#!/bin/sh

set -e

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npx prisma migrate deploy
exec npm run start:dev
