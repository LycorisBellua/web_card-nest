FROM node:24-alpine AS dev_base
RUN apk add --no-cache bash
WORKDIR /app

FROM dev_base AS frontend_dev
COPY containers/app/frontend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM dev_base AS backend_dev
COPY containers/app/backend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM node:24-alpine AS prod
WORKDIR /app
COPY containers/app/prod_entrypoint.sh /usr/local/bin/entrypoint.sh
COPY frontend/ ./frontend/
COPY backend/ ./backend/
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    cd frontend && npm install && npm run build && \
    cd /app/backend && npm install && npm run build && \
    cd /app && \
    mv backend/dist ./ && \
    mv backend/client ./ && \
    mv backend/node_modules ./ && \
    mv backend/prisma.config.ts ./ && \
    mv backend/prisma ./ && \
    rm -rf frontend backend
CMD ["/usr/local/bin/entrypoint.sh"]
