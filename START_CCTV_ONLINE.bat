@echo off
title FluidHE - CCTV Online Streaming Service
color 0B
cls
echo =====================================================================
echo           FLUIDHE IOT SYSTEM - CCTV ONLINE STREAMING SERVICE
echo =====================================================================
echo.
echo [1/2] Memeriksa status go2rtc (RTSP Camera Bridge)...
powershell -Command "if (-not (Get-Process go2rtc -ErrorAction SilentlyContinue)) { Start-Process -FilePath '.\scripts\go2rtc.exe' -ArgumentList '-config .\scripts\go2rtc.yaml' -WindowStyle Hidden; Write-Host 'go2rtc berhasil dijalankan di background!' -ForegroundColor Green } else { Write-Host 'go2rtc sudah aktif di background!' -ForegroundColor Green }"
echo.
echo [2/2] Membuka Cloud Tunnel HTTPS dengan Ngrok (Port 8889)...
echo.
echo =====================================================================
echo PETUNJUK UNTUK OPERATOR ^& KLIEN JARAK JAUH:
echo 1. Salin URL HTTPS yang muncul di baris 'Forwarding' di bawah
echo    (Contoh: https://xxxx.ngrok-free.app)
echo 2. Buka https://heat-exchanger-taupe.vercel.app/
echo 3. Buka tab CCTV -^> Klik tombol 'Akses Klien / HP'
echo 4. Tempelkan URL tersebut dan klik 'Simpan'
echo 5. Klik 'Salin Link Siaran untuk WhatsApp Klien' dan kirim ke Klien!
echo =====================================================================
echo.
"C:\laragon\bin\ngrok\ngrok.exe" http 8889
pause
