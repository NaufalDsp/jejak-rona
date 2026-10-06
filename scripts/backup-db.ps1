# scripts/backup-db.ps1
# Skrip cadangan data Supabase Jejak Rona CMS ke format JSON lokal
param(
  [string]$OutputDir = "./backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFolder = Join-Path $OutputDir "backup_$Timestamp"
New-Item -ItemType Directory -Path $BackupFolder | Out-Null

Write-Host "=== MEMULAI PENCADANGAN DATABASE JEJAK RONA ===" -ForegroundColor Cyan
Write-Host "Tujuan cadangan: $BackupFolder"

# Muat variabel dari .env jika ada
if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([A-Za-z0-9_]+)=(.*)$") {
      [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
  }
}

$SupabaseUrl = $env:PUBLIC_SUPABASE_URL
$ServiceKey = if ($env:SUPABASE_SERVICE_ROLE_KEY) { $env:SUPABASE_SERVICE_ROLE_KEY } else { $env:PUBLIC_SUPABASE_ANON_KEY }

if (-not $SupabaseUrl -or -not $ServiceKey) {
  Write-Error "Variabel PUBLIC_SUPABASE_URL atau kunci Supabase tidak ditemukan di lingkungan."
  exit 1
}

$Headers = @{
  "apikey" = $ServiceKey
  "Authorization" = "Bearer $ServiceKey"
}

$Tables = @("pages", "posts", "media", "revisions", "site_settings", "nav_items", "submissions")

foreach ($Table in $Tables) {
  Write-Host "Mencadangkan tabel: $Table ..." -ForegroundColor Yellow
  $Uri = "$SupabaseUrl/rest/v1/$Table`?select=*"
  
  try {
    $Res = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Get
    $OutFile = Join-Path $BackupFolder "$Table.json"
    $Res | ConvertTo-Json -Depth 20 | Set-Content -Path $OutFile -Encoding UTF8
    Write-Host "  -> Berhasil: $(($Res).Count) baris tersimpan ke $Table.json" -ForegroundColor Green
  } catch {
    Write-Warning "  -> Gagal mengambil $Table : $_"
  }
}

Write-Host "=== PENCADANGAN SELESAI PADA $BackupFolder ===" -ForegroundColor Green
