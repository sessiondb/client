#!/bin/sh

# Recreate the config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add the assignment wrapper
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# If API_URL is provided at runtime, inject it
if [ -n "$API_URL" ]; then
  echo "  API_URL: \"$API_URL\"," >> /usr/share/nginx/html/env-config.js
fi

echo "}" >> /usr/share/nginx/html/env-config.js

# Execute the CMD instructions (start Nginx)
exec nginx -g "daemon off;"
