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
& $git push -u origin main

Write-Host ""
Write-Host "Done. Opening Vercel to import the repo..."
Start-Process "https://vercel.com/new/clone?repository-url=https://github.com/chiewwei54-max/fenhang-order-platform"
