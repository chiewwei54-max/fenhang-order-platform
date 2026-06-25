# Push to GitHub (fenhang-order-platform) then open Vercel import
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$remote = "https://github.com/chiewwei54-max/fenhang-order-platform.git"

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
  [System.Environment]::GetEnvironmentVariable("Path", "User")

$git = $null
foreach ($candidate in @(
  "git",
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files\Git\bin\git.exe"
)) {
  if ($candidate -eq "git") {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) { $git = $cmd.Source; break }
  } elseif (Test-Path $candidate) {
    $git = $candidate
    break
  }
}

if (-not $git) {
  Write-Host "Git not found. Install from https://git-scm.com/download/win then run this script again."
  exit 1
}

Set-Location $src
Write-Host "Using Git:" $git

if (-not (Test-Path ".git")) {
  & $git init
  & $git branch -M main
}

& $git add .
$status = & $git status --porcelain
if ($status) {
  & $git commit -m "Initial commit: branch ordering platform"
} else {
  Write-Host "No new changes to commit."
}

$remotes = & $git remote 2>$null
if ($remotes -notcontains "origin") {
  & $git remote add origin $remote
} else {
  & $git remote set-url origin $remote
}

Write-Host ""
Write-Host "Pushing to GitHub..."
$env:GIT_SSL_NO_REVOKE = "1"
& $git -c http.schannelCheckRevoke=false -c http.sslVerify=true push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Push failed (often GitHub login or Windows SSL). Options:"
  Write-Host "  1) Open GitHub Desktop -> Repository -> Push origin"
  Write-Host "  2) Or run: git -c http.schannelCheckRevoke=false push -u origin main"
  Write-Host "     after signing in with: git credential-manager github login"
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Done. Opening Vercel to import the repo..."
Start-Process "https://vercel.com/new/clone?repository-url=https://github.com/chiewwei54-max/fenhang-order-platform"
