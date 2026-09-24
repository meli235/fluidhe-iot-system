@echo off
chcp 65001 >nul
title FluidHE - Cloudflare CCTV Tunnel

echo ====================================================
echo   FluidHE Lab CCTV - Cloudflare Tunnel Launcher
echo ====================================================
echo.

:: 1. Restart go2rtc agar konfigurasi STUN remote aktif
powershell -Command "Stop-Process -Name go2rtc -ErrorAction SilentlyContinue; Start-Sleep -Seconds 1; Start-Process -FilePath .\scripts\go2rtc.exe -ArgumentList '-config .\scripts\go2rtc.yaml' -WindowStyle Hidden; Write-Host '[OK] go2rtc service aktif di port 8889 (WebRTC STUN Ready)' -ForegroundColor Green"

echo.
echo ====================================================
echo   Menghubungkan Cloudflare Tunnel ke port 8889...
echo   Mohon tunggu hingga URL *.trycloudflare.com muncul.
echo.
echo   SALIN URL TERSEBUT lalu buka di Vercel atau masukkan
echo   ke menu CCTV tab di dashboard Vercel kamu!
echo ====================================================
echo.

.\scripts\cloudflared.exe tunnel --url http://localhost:8889
pause
