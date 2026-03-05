#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jianpingpeng/Desktop/app/StudyDone/scripts"

echo "[all] deploy backend first"
bash "${ROOT_DIR}/backend-deploy.sh"

echo "[all] deploy frontend second"
bash "${ROOT_DIR}/frontend-deploy.sh"

echo "[all] done"
pm2 status

