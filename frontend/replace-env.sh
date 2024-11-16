#!/bin/sh
# Replace placeholder in index.html with the runtime environment variable
sed -i "s|%REACT_APP_API_URL%|${REACT_APP_API_URL}|g" /app/build/index.html

# Start the server
exec "$@"
