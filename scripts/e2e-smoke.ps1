<#
.SYNOPSIS
  Build the app, start the backend, run the Playwright e2e suite, then tear everything down.

  The client dev server is intentionally not managed here: playwright.config.ts already
  declares a webServer that starts `npm run startclient`, waits for localhost:3030, and
  stops it after the run (or reuses one that's already up). Only the backend (port 3000)
  needs to be started/stopped by this script.
#>

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$backendLog = Join-Path $repoRoot 'scripts\.e2e-backend.log'
$backendErrLog = Join-Path $repoRoot 'scripts\.e2e-backend.err.log'
$backendProcess = $null
$testExitCode = 1

function Wait-ForBackend {
    param(
        [string]$Url = 'http://localhost:3000',
        [int]$TimeoutSeconds = 30
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
            return $true
        } catch [System.Net.WebException] {
            # A non-2xx HTTP response still means the server is up and answering.
            if ($_.Exception.Response) { return $true }
        } catch {
            # Connection refused / not listening yet - keep polling.
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

try {
    Write-Host "==> Building server + client (npm run build)..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }

    Write-Host "==> Starting backend on port 3000..." -ForegroundColor Cyan
    $env:SEQUELIZE_CONNECT = 'src/server/sequelize/sequelize-sqlite.yaml'
    $backendProcess = Start-Process -FilePath 'node' `
        -ArgumentList 'dist/server/server.js' `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendErrLog `
        -PassThru `
        -NoNewWindow

    if (-not (Wait-ForBackend)) {
        Write-Host "Backend did not come up within the timeout. Last log lines:" -ForegroundColor Red
        if (Test-Path $backendLog) { Get-Content $backendLog -Tail 40 }
        if (Test-Path $backendErrLog) { Get-Content $backendErrLog -Tail 40 }
        throw "Backend failed to start"
    }
    Write-Host "==> Backend is up." -ForegroundColor Cyan

    Write-Host "==> Running e2e tests (npm run test:e2e)..." -ForegroundColor Cyan
    npm run test:e2e
    $testExitCode = $LASTEXITCODE
}
finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "==> Stopping backend (PID $($backendProcess.Id))..." -ForegroundColor Cyan
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

$reportPath = Join-Path $repoRoot 'playwright-report\index.html'
Write-Host ""
if ($testExitCode -eq 0) {
    Write-Host "==> e2e tests passed." -ForegroundColor Green
} else {
    Write-Host "==> e2e tests failed (exit code $testExitCode)." -ForegroundColor Red
}
Write-Host "==> HTML report: $reportPath"

exit $testExitCode
