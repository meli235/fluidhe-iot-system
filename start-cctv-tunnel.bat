@echo off
chcp 65001 >nul
title FluidHE - Auto CCTV Cloud Sync

echo ====================================================
echo   FluidHE Lab CCTV - Auto Cloud Sync Launcher
echo ====================================================
echo.

:: 1. Jalankan go2rtc service di background
powershell -Command "if (-not (Get-Process go2rtc -ErrorAction SilentlyContinue)) { Start-Process -FilePath .\scripts\go2rtc.exe -ArgumentList '-config .\scripts\go2rtc.yaml' -WindowStyle Hidden; Write-Host '[OK] go2rtc service aktif di port 8889' -ForegroundColor Green } else { Write-Host '[OK] go2rtc service sudah aktif' -ForegroundColor Cyan }"

echo.
echo [1/2] Menghubungkan tunnel dan menyinkronkan ke Supabase Database...
echo [2/2] Admin di Vercel (HP / Laptop luar) akan langsung bisa nonton tanpa ribet!
echo.

node .\scripts\auto_cctv_sync.js
pause
