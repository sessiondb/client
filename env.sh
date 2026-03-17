#!/bin/sh
set -e

CONFIG_FILE="/usr/share/nginx/html/env-config.js"

# Recreate the config file so runtime API_URL is always applied (no caching in nginx)
rm -f "$CONFIG_FILE"
{
  printf 'window._env_ = {\n'
  if [ -n "${API_URL:-}" ]; then
    printf '  API_URL: "%s"\n' "$API_URL"
  fi
  printf '};\n'
} > "$CONFIG_FILE"

# Execute the CMD instructions (start Nginx)
exec nginx -g "daemon off;"
