#!/bin/sh

set -e

export DOCKER_IP=$(ip route | awk '/default/ { print $3 }')

envsubst '${DOCKER_IP}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

htpasswd -cb /etc/nginx/db_password $DB_USER $DB_PASS

exec /docker-entrypoint.sh nginx -g 'daemon off;'
