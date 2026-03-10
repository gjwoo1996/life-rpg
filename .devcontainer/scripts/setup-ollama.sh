#!/bin/bash
set -e

echo "Waiting for Ollama..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
  sleep 2
done

echo "Ollama is ready"
COMPOSE_PROJECT_NAME="$(basename "$(pwd)")_devcontainer"
docker compose -f .devcontainer/docker-compose.yml -p "$COMPOSE_PROJECT_NAME" exec ollama ollama pull qwen2.5:7b
echo "Model installation complete"
