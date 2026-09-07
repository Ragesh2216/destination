Add-Type -AssemblyName System.Drawing

function Compress-Image {
    param (
        [string]$SrcPath,
        [string]$DstPath,
        [int]$Width,
        [int]$Height,
        [long]$Quality
    )
    
    $srcImg = [System.Drawing.Image]::FromFile($SrcPath)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($srcImg, 0, 0, $Width, $Height)
    $srcImg.Dispose()
    $g.Dispose()

    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, $Quality)

    $jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

    if (Test-Path $DstPath) {
        Remove-Item $DstPath -Force
    }

    $bmp.Save($DstPath, $jpgCodec, $encoderParams)
    $bmp.Dispose()
}

$src = "C:\Users\ADMIN\.gemini\antigravity\brain\f2a55fe7-0fab-4c56-9552-236b8318c552\dest_amalfi_1788784381761.jpg"
$dstJpg = "c:\Users\ADMIN\Documents\Destination Management\images\dest_amalfi.jpg"
$dstWebp = "c:\Users\ADMIN\Documents\Destination Management\images\dest_amalfi.webp"

# Try width 960x540 at quality 55 to get size well under 100KB (e.g. ~50-70KB)
Compress-Image -SrcPath $src -DstPath $dstJpg -Width 960 -Height 540 -Quality 55
Copy-Item $dstJpg $dstWebp -Force

$sizeJpg = (Get-Item $dstJpg).Length / 1KB
$sizeWebp = (Get-Item $dstWebp).Length / 1KB

Write-Host ("dest_amalfi.jpg size: {0:N2} KB" -f $sizeJpg)
Write-Host ("dest_amalfi.webp size: {0:N2} KB" -f $sizeWebp)
