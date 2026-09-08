#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT_DIR/frontend" && npm install)
else
  echo "Frontend dependencies already installed."
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Installing backend dependencies..."
  (cd "$ROOT_DIR" && npm install)
else
  echo "Backend dependencies already installed."
fi

[ -d "$ROOT_DIR/frontend/node_modules" ] && echo "✅ Frontend dependencies installed"
[ -d "$ROOT_DIR/node_modules" ] && echo "✅ Backend dependencies installed"
