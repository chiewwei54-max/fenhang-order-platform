# GitHub push + Vercel deploy helper
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $src

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

git add .
git status

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. gh auth login          (if not logged in)"
Write-Host "2. gh repo create fenhang-order-platform --public --source=. --push"
Write-Host "3. Import repo at https://vercel.com/new"
Write-Host ""
