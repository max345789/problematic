$env:JAVA_HOME = "C:\Users\Unified\.jdk\jdk17.0.21_1"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$adb = "C:\Users\Unified\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$projDir = "C:\Users\Unified\.gemini\antigravity\scratch\problematic"
$androidDir = Join-Path $projDir "android"
$relDir = Join-Path $projDir "release"

# Dynamic ADB device detection
$rawDevices = & $adb devices
$device = $null
foreach ($line in ($rawDevices -split "`r?`n")) {
    if ($line -match "^(\S+)\s+device$") {
        $device = $matches[1]
        break
    }
}
if (!$device) {
    $device = "13717013690002D"
}
Write-Host "Target ADB Device: $device"

# Frontend build & sync
Set-Location $projDir
Write-Host "Running Vite build and Capacitor sync..."
npm run build
npx cap sync android

Set-Location $androidDir
Write-Host "Building signed release APK & AAB with Gradle (JDK 17)..."
.\gradlew assembleRelease bundleRelease -x lintVitalAnalyzeRelease -x lint

$apkSrc = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
$aabSrc = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"

if (!(Test-Path $apkSrc)) {
    Write-Error "APK not found at $apkSrc"
    exit 1
}

Write-Host "Copying release artifacts to release folder..."
Copy-Item $apkSrc -Destination (Join-Path $relDir "problematic-v1.0.0.apk") -Force
Copy-Item $aabSrc -Destination (Join-Path $relDir "problematic-v1.0.0.aab") -Force

Get-Item (Join-Path $relDir "problematic-v1.0.0.apk"), (Join-Path $relDir "problematic-v1.0.0.aab") | Select-Object Name, Length, LastWriteTime

Write-Host "Setting up ADB reverse port forward for 5173..."
& $adb -s $device reverse tcp:5173 tcp:5173

Write-Host "Installing APK on phone $device..."
$installResult = & $adb -s $device install -r (Join-Path $relDir "problematic-v1.0.0.apk")
Write-Host $installResult

if ($installResult -match "INSTALL_FAILED") {
    Write-Host "Incompatible signature detected. Uninstalling previous version..."
    & $adb -s $device uninstall com.problematic.app
    Write-Host "Retrying install..."
    & $adb -s $device install (Join-Path $relDir "problematic-v1.0.0.apk")
}

Write-Host "Launching Problematic on phone..."
& $adb -s $device shell am start -n com.problematic.app/.MainActivity

Start-Sleep -Seconds 2

Write-Host "Waking screen..."
& $adb -s $device shell input keyevent 224

Write-Host "Focused window status:"
& $adb -s $device shell "dumpsys window | grep -E 'mCurrentFocus|mFocusedApp'"

Write-Host "DONE!"
