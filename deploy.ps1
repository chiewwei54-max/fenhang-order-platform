# GitHub push + Vercel deploy helper
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $src

function Get-AppVersion {
  $versionFile = Join-Path $src "version.js"
  if (-not (Test-Path $versionFile)) { return "0.0.0" }
  $m = Select-String -Path $versionFile -Pattern 'APP_VERSION\s*=\s*"([^"]+)"' | Select-Object -First 1
  if ($m) { return $m.Matches.Groups[1].Value }
  return "0.0.0"
}

function Test-HasNonVersionChanges {
  $porcelain = @(git status --porcelain 2>$null)
  return @($porcelain | Where-Object { $_ -notmatch 'version\.js' }).Count -gt 0
}

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

if (Test-HasNonVersionChanges) {
  & (Join-Path $src "bump-version.ps1")
}

git add .
git status

Write-Host ""
$ver = Get-AppVersion
Write-Host "Current version: v$ver"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. gh auth login          (if not logged in)"
Write-Host "2. gh repo create fenhang-order-platform --public --source=. --push"
Write-Host "3. Import repo at https://vercel.com/new"
Write-Host ""
