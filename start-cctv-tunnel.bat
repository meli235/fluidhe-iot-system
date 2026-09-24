@echo off
chcp 65001 >nul
title FluidHE - Cloudflare CCTV Tunnel

echo ====================================================
echo   FluidHE Lab CCTV - Cloudflare Tunnel Launcher
echo ====================================================
echo.

:: 1. Pastikan go2rtc aktif di port 8889
powershell -Command "if (-not (Get-Process go2rtc -ErrorAction SilentlyContinue)) { Start-Process -FilePath .\scripts\go2rtc.exe -ArgumentList '-config .\scripts\go2rtc.yaml' -WindowStyle Hidden; Write-Host '[OK] go2rtc service dimulai di port 8889' -ForegroundColor Green } else { Write-Host '[OK] go2rtc service sudah berjalan' -ForegroundColor Cyan }"

echo.
echo Menghubungkan Cloudflare Tunnel ke go2rtc (port 8889)...
echo URL publik HTTPS akan muncul di bawah ini secara otomatis.
echo.
.\scripts\cloudflared.exe tunnel --url http://localhost:8889
pause
