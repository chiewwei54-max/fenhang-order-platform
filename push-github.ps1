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

function Get-AppVersion {
  $versionFile = Join-Path $src "version.js"
  if (-not (Test-Path $versionFile)) { return "0.0.0" }
  $m = Select-String -Path $versionFile -Pattern 'APP_VERSION\s*=\s*"([^"]+)"' | Select-Object -First 1
  if ($m) { return $m.Matches.Groups[1].Value }
  return "0.0.0"
}

function Test-HasNonVersionChanges {
  param([string]$GitExe)
  $porcelain = @(& $GitExe status --porcelain 2>$null)
  return @($porcelain | Where-Object { $_ -notmatch 'version\.js' }).Count -gt 0
}

if (-not (Test-Path ".git")) {
  & $git init
  & $git branch -M main
}

if (Test-HasNonVersionChanges -GitExe $git) {
  & (Join-Path $src "bump-version.ps1")
}

& $git add .
$status = & $git status --porcelain
if ($status) {
  $ver = Get-AppVersion
  & $git commit -m "Release v$ver"
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
