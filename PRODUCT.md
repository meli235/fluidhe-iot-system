# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React, Supabase Real-time IoT, ESP32 Microcontroller

## Users

1. **Admin (Dosen / Kepala Laboratorium)**: Mengelola akun operator/mahasiswa, mengatur batas durasi praktikum, menetapkan jadwal izin akses lab, kalibrasi sistem, dan kendali penuh keamanan serta verifikasi alarm.
2. **Operator (Mahasiswa Praktikum)**: Memantau data sensor secara real-time, mengontrol sistem pemanas ganda dan valve solenoid, menguji konfigurasi aliran (Counter-Current / Co-Current), serta mengunduh log data praktikum ke Excel/CSV.

## Product Purpose

FluidHE Dashboard adalah sistem SCADA & dashboard kendali IoT industri berbasis web untuk alat praktikum Heat Exchanger (Penukar Panas) di Laboratorium Teknik Kimia Universitas Ahmad Dahlan (UAD Kampus IV). Sistem ini memungkinkan visualisasi diagram P&ID real-time, pengendalian pemanas ganda (2x 500W), solenoid valve (SV1–SV4), serta pemantauan telemetri suhu (TI1–TI6), tekanan (PI1–PI4), dan laju alir (FC1–FC2).

## Positioning

Antarmuka kontrol laboratorium teknik kimia terintegrasi yang menghubungkan perangkat fisik ESP32 secara real-time melalui protokol Supabase IoT, dilengkapi skema P&ID interaktif, sistem alarm keselamatan industri (Emergency Trip), serta manajemen hak akses mahasiswa.

## Operating Context

- Digunakan di lingkungan Laboratorium Teknik Kimia UAD Kampus IV dan akses jarak jauh intranet kampus.
- Beroperasi pada browser desktop dan tablet operator lab.
- Membaca telemetri perangkat secara kontinu dengan latensi rendah (~40ms).

## Capabilities and Constraints

- **Sensor Suhu (6 titik)**: TI1 (Hot Inlet), TI2 (Hot Outlet), TI3 (Cold Inlet), TI4 (Cold Outlet), TI5 (Shell Mid 1), TI6 (Shell Mid 2).
- **Sensor Tekanan (4 titik)**: PI1 (Hot Inlet), PI2 (Hot Outlet), PI3 (Cold Inlet), PI4 (Cold Outlet).
- **Sensor Laju Alir (2 titik)**: FC1 (Hot Flow Rate), FC2 (Cold Flow Rate).
- **Aktuator**: Dual Heater (2x 500W) dengan kontrol duty cycle/daya, 4 Solenoid Valves (SV1-SV4) untuk switching aliran Counter-Current & Co-Current.
- **Fitur Keamanan**: Manual Emergency Stop Button, deteksi suhu berlebih (High Temp Trip), deteksi dry-run pemanas, pembatasan durasi sesi praktikum otomatis.
- **Autentikasi & Akses**: Sistem 2-tier role (Admin & Operator), pembatasan jadwal tanggal dan jam akses, reset password via OTP email.
- **Monitoring Tambahan**: Live CCTV camera stream (RTSP/WebRTC).

## Brand Commitments

- **Identitas**: FluidHE Dashboard - Universitas Ahmad Dahlan (UAD Kampus IV).
- **Aset**: Logo resmi Universitas Ahmad Dahlan (`public/uad-logo.png`).
- **Tema Visual**: Industrial clean tech, palet warna biru akademik (Sky/Indigo) dan status indikator standar instrumentasi industri (Emerald/Amber/Rose).

## Evidence on Hand

- Diagram P&ID fungsional dan model simulasi heat transfer di [`src/components/diagram/PidDiagram.tsx`](src/components/diagram/PidDiagram.tsx).
- Firmware ESP32 di [`esp32_heat_exchanger/esp32_heat_exchanger.ino`](esp32_heat_exchanger/esp32_heat_exchanger.ino).
- Integrasi Supabase IoT di [`src/lib/supabase.ts`](src/lib/supabase.ts) dan [`src/hooks/useSupabaseIntegration.ts`](src/hooks/useSupabaseIntegration.ts).

## Product Principles

1. **Safety First**: Setiap anomali parameter kritis (suhu/tekanan/dry-run) harus memicu trip darurat otomatis untuk melindungi alat laboratorium.
2. **Precision & Clarity**: Nilai telemetri sensor dan status aktuator disajikan dengan presisi tinggi dan indikator visual yang jelas tanpa ambigu.
3. **Seamless Experimentation**: Mahasiswa dapat menjalankan variasi pengujian (Co-Current vs Counter-Current) dan mengunduh rekaman data dengan mudah.
