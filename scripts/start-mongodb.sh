#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but not running. Start Docker Desktop and run this script again."
  exit 1
fi

docker compose up -d mongo-admin mongo-participant

echo "Waiting for MongoDB containers to become healthy..."
for container in mongo-admin mongo-participant; do
  for attempt in {1..30}; do
    status=$(docker inspect --format '{{.State.Health.Status}}' "$container" 2>/dev/null || true)
    if [ "$status" = "healthy" ]; then
      break
    fi
    if [ "$attempt" = 30 ]; then
      echo "$container did not become healthy. Check: docker compose logs $container"
      exit 1
    fi
    sleep 2
  done
done

echo "MongoDB is ready."
echo "Admin: mongodb://localhost:27017/csea_admin"
echo "Participant: mongodb://localhost:27018/csea_participant"
echo "Stop with: docker compose down"
