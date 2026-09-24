@echo off
title FluidHE - CCTV Online Streaming Service
color 0A
cls
echo =====================================================================
echo           FLUIDHE IOT SYSTEM - CCTV ONLINE STREAMING SERVICE
echo =====================================================================
echo.
echo Menghubungkan kamera CCTV ke Internet dan menyinkronkan ke Cloud...
echo.

node .\scripts\auto_ngrok_sync.js

echo.
echo Biarkan jendela ini tetap terbuka selama sesi monitoring berlangsung.
echo Tekan Ctrl+C untuk berhenti.
echo =====================================================================
pause >nul
