#!/usr/bin/env bash
# scripts/backup-db.sh
# Skrip cadangan data Supabase Jejak Rona CMS ke format JSON lokal
set -e

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FOLDER="$OUTPUT_DIR/backup_$TIMESTAMP"

mkdir -p "$BACKUP_FOLDER"

echo "=== MEMULAI PENCADANGAN DATABASE JEJAK RONA ==="
echo "Tujuan cadangan: $BACKUP_FOLDER"

if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL="${PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$PUBLIC_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "Error: PUBLIC_SUPABASE_URL atau kunci Supabase tidak ditemukan."
  exit 1
fi

TABLES=("pages" "posts" "media" "revisions" "site_settings" "nav_items" "submissions")

for TABLE in "${TABLES[@]}"; do
  echo "Mencadangkan tabel: $TABLE ..."
  curl -s \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    "$SUPABASE_URL/rest/v1/$TABLE?select=*" > "$BACKUP_FOLDER/$TABLE.json"
  echo "  -> Berhasil disimpan ke $TABLE.json"
done

echo "=== PENCADANGAN SELESAI PADA $BACKUP_FOLDER ==="
