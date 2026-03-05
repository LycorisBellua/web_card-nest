#!/bin/sh

set -e

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npm run build
cd /app
mv backend/dist ./
mv backend/client ./
mv backend/node_modules ./
rm -rf frontend
rm -rf backend
export NODE_ENV=production
exec node ./dist/main.js