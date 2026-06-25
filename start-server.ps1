$port = 8080
$root = $PSScriptRoot
$storageDir = Join-Path $root "storage"
$storageFile = Join-Path $storageDir "local-data.json"
$emptyStorage = '{"localStorage":{},"sessionStorage":{}}'

if (-not (Test-Path $storageDir)) {
  New-Item -ItemType Directory -Path $storageDir | Out-Null
}

function Get-StorageJson {
  if (-not (Test-Path $storageFile)) {
    return $emptyStorage
  }
  $content = Get-Content $storageFile -Raw -Encoding UTF8
  if ([string]::IsNullOrWhiteSpace($content)) {
    return $emptyStorage
  }
  return $content
}

function Save-StorageJson($json) {
  if ([string]::IsNullOrWhiteSpace($json)) {
    $json = $emptyStorage
  }
  [IO.File]::WriteAllText($storageFile, $json, [Text.UTF8Encoding]::new($false))
}

function Send-Bytes($ctx, $bytes, $statusCode, $contentType) {
  $ctx.Response.StatusCode = $statusCode
  $ctx.Response.ContentType = $contentType
  $ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*")
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

$mimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff2" = "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving at http://localhost:$port/index.html"
Write-Host "Data file: $storageFile"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $path = $req.Url.LocalPath

  $ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*")
  $ctx.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  $ctx.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

  if ($req.HttpMethod -eq "OPTIONS") {
    $ctx.Response.StatusCode = 204
    $ctx.Response.Close()
    continue
  }

  if ($path -eq "/api/storage" -and $req.HttpMethod -eq "GET") {
    $bytes = [Text.Encoding]::UTF8.GetBytes((Get-StorageJson))
    Send-Bytes $ctx $bytes 200 "application/json; charset=utf-8"
    $ctx.Response.Close()
    continue
  }

  if (($path -eq "/api/storage" -or $path -eq "/api/storage/migrate") -and $req.HttpMethod -eq "POST") {
    $reader = New-Object IO.StreamReader($req.InputStream, [Text.UTF8Encoding]::new($false))
    $body = $reader.ReadToEnd()
    $reader.Close()
    try {
      $null = $body | ConvertFrom-Json
      Save-StorageJson $body
      $bytes = [Text.Encoding]::UTF8.GetBytes('{"ok":true}')
      Send-Bytes $ctx $bytes 200 "application/json; charset=utf-8"
    } catch {
      $bytes = [Text.Encoding]::UTF8.GetBytes("Invalid JSON")
      Send-Bytes $ctx $bytes 400 "text/plain; charset=utf-8"
    }
    $ctx.Response.Close()
    continue
  }

  if ($path -eq "/") { $path = "/index.html" }

  $relative = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
  $file = Join-Path $root $relative

  if ((Test-Path $file -PathType Leaf)) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $mime = $mimeMap[$ext]
    if (-not $mime) { $mime = "application/octet-stream" }
    Send-Bytes $ctx $bytes 200 $mime
  } else {
    $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
    Send-Bytes $ctx $bytes 404 "text/plain; charset=utf-8"
  }

  $ctx.Response.Close()
}
