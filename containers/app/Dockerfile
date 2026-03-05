FROM node:24-alpine AS frontend_dev
COPY containers/app/frontend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM node:24-alpine AS backend_dev
COPY containers/app/backend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM node:24-alpine AS prod
WORKDIR /app
COPY frontend/ ./frontend/
COPY backend/ ./backend/
RUN cd frontend && npm install && npm run build
RUN cd backend && npm install && npm run build
RUN mv backend/dist ./ && \
    mv backend/client ./ && \
    mv backend/node_modules ./ && \
    rm -rf frontend backend
ENV NODE_ENV=production
CMD ["node", "./dist/main.js"]