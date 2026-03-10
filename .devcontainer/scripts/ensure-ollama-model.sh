#!/bin/bash
set -e

echo "Checking Ollama..."
until curl -s http://ollama:11434/api/tags > /dev/null 2>&1; do
  sleep 2
done

if curl -s http://ollama:11434/api/tags | grep -q 'qwen2.5:7b'; then
  echo "qwen2.5:7b already installed"
else
  echo "Installing qwen2.5:7b..."
  COMPOSE_PROJECT_NAME="$(basename "$(pwd)")_devcontainer"
  docker compose -f .devcontainer/docker-compose.yml -p "$COMPOSE_PROJECT_NAME" exec -T ollama ollama pull qwen2.5:7b
  echo "Model installation complete"
fi
