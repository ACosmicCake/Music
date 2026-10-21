#!/bin/bash
# Run World Woodshed on Linux: double-click (choose "Run") or run ./start-world-woodshed.sh
cd "$(dirname "$0")/world-woodshed" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "World Woodshed needs Node.js 20 or newer: https://nodejs.org/en/download"
  command -v xdg-open >/dev/null && xdg-open "https://nodejs.org/en/download" >/dev/null 2>&1
  read -r -p "Press Return to close."
  exit 1
fi

# Install on first run, and again whenever the dependency list changes
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "Setting things up. This takes a minute and needs internet once."
  npm install --no-audit --no-fund || { echo "Setup failed. Check your internet connection."; read -r -p "Press Return to close."; exit 1; }
fi

echo "Starting World Woodshed. Your browser will open in a moment. Press Ctrl+C or close this window to stop."
npm run dev -- --open
