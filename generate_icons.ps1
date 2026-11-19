Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Unified\.gemini\antigravity\brain\743a91ab-5c94-446d-a8f6-15ef6bc273fd\.user_uploaded\media_1795072832808_0a8e2dab.png"
if (!(Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcImg.Width)x$($srcImg.Height)"

function Resize-Image($src, $w, $h, $outPath) {
    $parent = Split-Path -Path $outPath -Parent
    if (!(Test-Path $parent)) { 
        New-Item -ItemType Directory -Path $parent -Force | Out-Null 
    }
    
    $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Black)
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    
    if (Test-Path $outPath) { 
        Remove-Item $outPath -Force 
    }
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Generated: $outPath ($($w)x$($h))"
}

function Create-Centered-Splash($src, $w, $h, $logoSize, $outPath) {
    $parent = Split-Path -Path $outPath -Parent
    if (!(Test-Path $parent)) { 
        New-Item -ItemType Directory -Path $parent -Force | Out-Null 
    }
    
    $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Black)
    
    $x = [int](($w - $logoSize) / 2)
    $y = [int](($h - $logoSize) / 2)
    $g.DrawImage($src, $x, $y, $logoSize, $logoSize)
    $g.Dispose()
    
    if (Test-Path $outPath) { 
        Remove-Item $outPath -Force 
    }
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Generated Splash: $outPath ($($w)x$($h))"
}

# 1. Play Store & Web Icons
Resize-Image $srcImg 512 512 "C:\Users\Unified\.gemini\antigravity\scratch\problematic\release\playstore-icon-512.png"
Resize-Image $srcImg 512 512 "C:\Users\Unified\.gemini\antigravity\scratch\problematic\public\icon-512.png"
Resize-Image $srcImg 512 512 "C:\Users\Unified\.gemini\antigravity\brain\743a91ab-5c94-446d-a8f6-15ef6bc273fd\playstore-icon-512.png"
Resize-Image $srcImg 192 192 "C:\Users\Unified\.gemini\antigravity\scratch\problematic\public\icon-192.png"
Resize-Image $srcImg 64 64 "C:\Users\Unified\.gemini\antigravity\scratch\problematic\public\favicon.png"

# Copy source to scratch assets
Copy-Item $srcPath -Destination "C:\Users\Unified\.gemini\antigravity\scratch\problematic\assets\logo-source.png" -Force

# 2. Android Mipmap densities
$resDir = "C:\Users\Unified\.gemini\antigravity\scratch\problematic\android\app\src\main\res"

$densities = @(
    @{ name="mipmap-mdpi"; size=48; fgSize=108 },
    @{ name="mipmap-hdpi"; size=72; fgSize=162 },
    @{ name="mipmap-xhdpi"; size=96; fgSize=216 },
    @{ name="mipmap-xxhdpi"; size=144; fgSize=324 },
    @{ name="mipmap-xxxhdpi"; size=192; fgSize=432 }
)

foreach ($d in $densities) {
    $dir = Join-Path $resDir $d.name
    Resize-Image $srcImg $d.size $d.size (Join-Path $dir "ic_launcher.png")
    Resize-Image $srcImg $d.size $d.size (Join-Path $dir "ic_launcher_round.png")
    Resize-Image $srcImg $d.fgSize $d.fgSize (Join-Path $dir "ic_launcher_foreground.png")
}

# 3. Android Native Splash Drawables (Centered on OLED Black)
Create-Centered-Splash $srcImg 480 800 200 (Join-Path $resDir "drawable\splash.png")
Create-Centered-Splash $srcImg 320 480 140 (Join-Path $resDir "drawable-port-mdpi\splash.png")
Create-Centered-Splash $srcImg 480 800 200 (Join-Path $resDir "drawable-port-hdpi\splash.png")
Create-Centered-Splash $srcImg 720 1280 300 (Join-Path $resDir "drawable-port-xhdpi\splash.png")
Create-Centered-Splash $srcImg 960 1600 400 (Join-Path $resDir "drawable-port-xxhdpi\splash.png")
Create-Centered-Splash $srcImg 1280 1920 500 (Join-Path $resDir "drawable-port-xxxhdpi\splash.png")

Create-Centered-Splash $srcImg 480 320 140 (Join-Path $resDir "drawable-land-mdpi\splash.png")
Create-Centered-Splash $srcImg 800 480 200 (Join-Path $resDir "drawable-land-hdpi\splash.png")
Create-Centered-Splash $srcImg 1280 720 300 (Join-Path $resDir "drawable-land-xhdpi\splash.png")
Create-Centered-Splash $srcImg 1600 960 400 (Join-Path $resDir "drawable-land-xxhdpi\splash.png")
Create-Centered-Splash $srcImg 1920 1280 500 (Join-Path $resDir "drawable-land-xxxhdpi\splash.png")

$srcImg.Dispose()
Write-Host "All icons and native splash screens generated successfully!"
