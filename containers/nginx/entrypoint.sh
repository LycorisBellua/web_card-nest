#!/bin/sh

set -e

htpasswd -cb /etc/nginx/db_password $DB_USER $DB_PASS

echo "DONE"
echo $DB_USER $DB_PASS

exec /docker-entrypoint.sh nginx -g 'daemon off;'