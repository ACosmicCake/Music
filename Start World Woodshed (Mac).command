#!/bin/bash
# Double-click to run World Woodshed on this Mac. Close this window to stop it.
cd "$(dirname "$0")/world-woodshed" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  World Woodshed needs Node.js (free). Opening the download page..."
  echo "  Install the LTS version, then double-click this file again."
  echo
  open "https://nodejs.org/en/download"
  read -r -p "  Press Return to close."
  exit 1
fi

# Install on first run, and again whenever the dependency list changes
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo
  echo "  Setting things up. This takes a minute and needs internet once."
  echo
  if ! npm install --no-audit --no-fund; then
    echo
    echo "  Setup failed. Check your internet connection and try again."
    read -r -p "  Press Return to close."
    exit 1
  fi
fi

echo
echo "  Starting World Woodshed. Your browser will open in a moment."
echo "  Keep this window open while you practise; close it to stop."
echo
npm run dev -- --open
