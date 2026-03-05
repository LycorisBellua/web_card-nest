FROM node:24-alpine AS frontend_dev
COPY containers/app/frontend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM node:24-alpine AS backend_dev
COPY containers/app/backend_dev_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM node:24-alpine AS prod
COPY containers/app/prod_entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY frontend/ /app/frontend
COPY backend/ /app/backend
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]