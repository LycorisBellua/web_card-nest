FROM nginx:1.29.5-alpine
COPY containers/nginx/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    apk update && \
    apk add --no-cache apache2-utils
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
