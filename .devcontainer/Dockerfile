FROM mcr.microsoft.com/devcontainers/rust:1-bookworm

# Tauri Linux dependencies (Tauri v2) + SQLite (rusqlite 빌드용)
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsqlite3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
