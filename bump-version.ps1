# 每次发布前自动递增版本号末位：1.1.0 -> 1.1.1
$ErrorActionPreference = "Stop"
$versionFile = Join-Path $PSScriptRoot "version.js"

if (-not (Test-Path $versionFile)) {
  Write-Error "version.js not found"
}

$content = Get-Content $versionFile -Raw -Encoding UTF8
if ($content -notmatch 'APP_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"') {
  Write-Error "Could not parse APP_VERSION in version.js"
}

$major = [int]$Matches[1]
$minor = [int]$Matches[2]
$patch = [int]$Matches[3] + 1
$newVersion = "$major.$minor.$patch"

$updated = $content -replace 'APP_VERSION\s*=\s*"\d+\.\d+\.\d+"', "APP_VERSION = `"$newVersion`""
[System.IO.File]::WriteAllText($versionFile, $updated, [System.Text.UTF8Encoding]::new($false))

Write-Host "Version bumped to v$newVersion"
