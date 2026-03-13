#!/bin/sh

set -e

bash /usr/local/bin/start_ssh.sh &

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npx prisma migrate deploy
npm start &
cd /app/frontend
exec npm run dev -- --host 0.0.0.0
