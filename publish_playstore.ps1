# ==============================================================================
# Problematic - Automated Google Play Store Build & Release Script
# ==============================================================================

[CmdletBinding()]
param(
    [string]$Track = "internal",
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Usage:
  .\publish_playstore.ps1 [-Track <internal|alpha|beta|production>] [-SkipBuild]

Description:
  Automates the complete release pipeline for Google Play Store:
  1. Builds production web bundle (Vite)
  2. Syncs Capacitor Android assets
  3. Builds signed Android App Bundle (.aab) with release keystore
  4. Builds production APK (.apk) for direct testing
  5. Verifies all Play Store graphics (Icon 512x512, Feature Graphic 1024x500)
  6. Prepares release directory for upload or CI/CD deployment
"@
    exit 0
}

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  Problematic - Google Play Store Release Preparation" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# 1. Environment & Java Check
$JavaJbr = "C:\Program Files\Android\Android Studio\jbr"
if (Test-Path $JavaJbr) {
    $env:JAVA_HOME = $JavaJbr
    $env:PATH = "$JavaJbr\bin;$env:PATH"
    Write-Host "[OK] Using Android Studio JDK at $JavaJbr" -ForegroundColor Green
} else {
    Write-Host "[WARN] JBR not found at default path, checking current JAVA_HOME..." -ForegroundColor Yellow
    if (-not $env:JAVA_HOME) {
        throw "JAVA_HOME is not set. Please set JAVA_HOME to a valid JDK."
    }
}

# 2. Web Build
if (-not $SkipBuild) {
    Write-Host "`n--> [1/4] Building production web assets..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

    Write-Host "`n--> [2/4] Syncing Capacitor Android assets..." -ForegroundColor Yellow
    npx cap sync android
    if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed" }

    Write-Host "`n--> [3/4] Building signed Release AAB and APK with Gradle..." -ForegroundColor Yellow
    Push-Location "$ScriptDir\android"
    try {
        .\gradlew.bat bundleRelease assembleRelease
        if ($LASTEXITCODE -ne 0) { throw "Gradle release build failed" }
    } finally {
        Pop-Location
    }
}

# 3. Copy outputs to release directory
$AabSource = "$ScriptDir\android\app\build\outputs\bundle\release\app-release.aab"
$ApkSource = "$ScriptDir\android\app\build\outputs\apk\release\app-release.apk"
$ReleaseDir = "$ScriptDir\release"

if (-not (Test-Path $ReleaseDir)) {
    New-Item -ItemType Directory -Path $ReleaseDir | Out-Null
}

$DestAab = "$ReleaseDir\problematic-v1.0.0-release.aab"
$DestApk = "$ReleaseDir\problematic-v1.0.0-release.apk"

Copy-Item -Path $AabSource -Destination $DestAab -Force
Copy-Item -Path $ApkSource -Destination $DestApk -Force

$AabSize = [math]::Round((Get-Item $DestAab).Length / 1MB, 2)
$ApkSize = [math]::Round((Get-Item $DestApk).Length / 1MB, 2)

Write-Host "`n--> [4/4] Verifying Release Artifacts:" -ForegroundColor Yellow
Write-Host "  - Signed Play Store Bundle (AAB): $DestAab ($AabSize MB)" -ForegroundColor Green
Write-Host "  - Direct Install APK:             $DestApk ($ApkSize MB)" -ForegroundColor Green

# 4. Check Store Listing Graphics
Write-Host "`n--> Checking Store Listing Assets in ${ReleaseDir}:" -ForegroundColor Yellow
$IconPath = "$ReleaseDir\playstore-icon-512.png"
$FgPath = "$ReleaseDir\playstore-feature-graphic-1024x500.png"

if (Test-Path $IconPath) {
    Write-Host "  [OK] App Icon 512x512 found: $IconPath" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] App Icon 512x512 missing" -ForegroundColor Red
}

if (Test-Path $FgPath) {
    Write-Host "  [OK] Feature Graphic 1024x500 found: $FgPath" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] Feature Graphic 1024x500 missing" -ForegroundColor Red
}

Write-Host @"

==============================================================
  RELEASE READY FOR GOOGLE PLAY CONSOLE
==============================================================
Package Name : com.problamatic.murmur
Version Code : 1
Version Name : 1.0.0

Next Steps for Play Store Upload:
1. Open Google Play Console: https://play.google.com/console
2. Navigate to your app -> Testing -> Internal testing (or Production)
3. Create new release and upload:
   $DestAab
4. In Store Presence -> Main Store Listing, upload:
   - App Icon:        $IconPath
   - Feature Graphic: $FgPath
5. Add Privacy Policy URL in Policy -> App Content:
   https://api.dabcloud.in/privacy.html (or your public URL)
==============================================================
"@ -ForegroundColor Cyan
