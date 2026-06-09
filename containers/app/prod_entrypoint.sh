#!/bin/sh

set -e

cd /app
npx prisma migrate deploy

exec node /app/dist/main.js
