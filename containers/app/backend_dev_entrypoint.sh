#!/bin/sh

set -e

cd /app/frontend
npm install
npm run build
cd /app/backend
npm install
npm install i --save @nestjs/websockets @nestjs/platform-socket.io socket.io
# npx prisma migrate dev 
npx prisma migrate deploy
npx prisma studio --port 5555 --browser none &
exec npm run start:debug
