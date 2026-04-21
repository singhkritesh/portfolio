#!/bin/bash
set -e
cd "$(dirname "$0")"
docker compose up --build -d
echo "Running at http://localhost:4321"
