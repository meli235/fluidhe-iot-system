@echo off
title FluidHE - YouTube Live CCTV Streamer
color 0C
cls
echo =====================================================================
echo       FLUIDHE IOT SYSTEM - YOUTUBE LIVE CCTV STREAMER
echo =====================================================================
echo.
echo Menyiarkan kamera CCTV Lab ke YouTube Live (Unlisted)...
echo Video ID: YdcPP8Mby6k
echo.

set FFMPEG="C:\Users\mrwin\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-essentials_build\bin\ffmpeg.exe"
set RTSP_URL="rtsp://admin:TJPCYS@192.168.101.36:554/Streaming/Channels/101"
set STREAM_KEY=k4ab-rreu-3tjh-3dm0-ds1v

%FFMPEG% -rtsp_transport tcp -i %RTSP_URL% -c:v copy -c:a aac -b:a 128k -ar 44100 -f flv "rtmp://a.rtmp.youtube.com/live2/%STREAM_KEY%"

pause
