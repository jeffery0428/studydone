#!/usr/bin/env bash
set -euo pipefail

# ====== Config ======
API_DIR="/Users/jianpingpeng/Desktop/app/StudyDone/backend-api"
APP_NAME="studydone-api"
# ====================

echo "[backend] cd ${API_DIR}"
cd "${API_DIR}"

echo "[backend] install dependencies"
npm ci

echo "[backend] prisma generate"
npm run prisma:generate

echo "[backend] prisma push"
npm run prisma:push

echo "[backend] build"
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[backend] pm2 not found, installing..."
  npm i -g pm2
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  echo "[backend] restart existing pm2 process: ${APP_NAME}"
  pm2 restart "${APP_NAME}" --update-env
else
  echo "[backend] start new pm2 process: ${APP_NAME}"
  pm2 start "node dist/main.js" --name "${APP_NAME}" --cwd "${API_DIR}" --env production --time
fi

pm2 save
echo "[backend] done. status:"
pm2 status "${APP_NAME}"

