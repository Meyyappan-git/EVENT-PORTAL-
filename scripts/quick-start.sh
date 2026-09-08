#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then echo 'Node.js 20+ is required.'; exit 1; fi
node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt 20 ]; then echo 'Node.js 20+ is required.'; exit 1; fi

"$(dirname "$0")/setup.sh"
"$(dirname "$0")/start-mongodb.sh"
npm run seed -- --yes
npm run start:both
