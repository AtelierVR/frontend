#!/bin/sh
set -e

# NEXT_PUBLIC_* vars are baked in at build time and cannot be overridden at runtime
# via environment variables. This script patches the built JS bundle at container
# startup to replace the default WK_URL with the value from the environment.

DEFAULT_WK_URL="http://localhost:8080/.well-known/nox"

if [ -n "$NEXT_PUBLIC_WK_URL" ] && [ "$NEXT_PUBLIC_WK_URL" != "$DEFAULT_WK_URL" ]; then
    echo "[entrypoint] Patching NEXT_PUBLIC_WK_URL: $DEFAULT_WK_URL -> $NEXT_PUBLIC_WK_URL"
    find /app/.next -type f -name "*.js" \
        -exec grep -l "$DEFAULT_WK_URL" {} \; \
        | xargs sed -i "s|$DEFAULT_WK_URL|$NEXT_PUBLIC_WK_URL|g"
    echo "[entrypoint] Patch done."
fi

exec node server.js
