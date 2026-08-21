#!/usr/bin/env sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"

if [ ! -f .env.production ]; then
  echo "Missing .env.production. Create it with the production Supabase and application secrets." >&2
  exit 1
fi

compose="docker compose --env-file .env.production -f docker-compose.prod.yml"
$compose build
$compose run --rm --no-deps api ./node_modules/.bin/prisma migrate deploy --schema packages/database/prisma/schema.prisma
$compose up -d --remove-orphans
$compose ps
