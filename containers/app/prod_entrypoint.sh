#!/bin/sh

set -e

cd /app
npx prisma studio --port 5555 --browser none &
npx prisma migrate deploy

exec node /app/dist/main.js
