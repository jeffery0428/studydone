#!/usr/bin/env bash
set -euo pipefail

# ====== Config ======
APP_DIR="/Users/jianpingpeng/Desktop/app/StudyDone"
APP_NAME="studydone-frontend"
PORT="${PORT:-3000}"
# ====================

echo "[frontend] cd ${APP_DIR}"
cd "${APP_DIR}"

echo "[frontend] install dependencies"
npm ci

echo "[frontend] build"
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[frontend] pm2 not found, installing..."
  npm i -g pm2
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  echo "[frontend] replace existing pm2 process: ${APP_NAME}"
  pm2 delete "${APP_NAME}"
fi
echo "[frontend] start new pm2 process: ${APP_NAME}"
pm2 start "bash -lc 'PORT=${PORT} npm run start'" --name "${APP_NAME}" --cwd "${APP_DIR}" --env production --time

pm2 save
echo "[frontend] done. status:"
pm2 status "${APP_NAME}"

