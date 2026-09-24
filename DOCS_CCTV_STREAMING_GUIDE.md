# 📘 DOKUMEN STANDAR OPERASIONAL & PANDUAN RECOVERY CCTV STREAMING (FLUIDHE IOT SYSTEM)

> **Catatan Dokumen:**  
> Simpan dokumen ini baik-baik. Jika sistem CCTV terhapus, ter-reset, atau berganti jaringan Wi-Fi, Anda cukup menyalin **Prompt Generator Otomatis** di bagian paling bawah dokumen ini ke AI Assistant (Antigravity/Gemini) untuk memulihkan seluruh sistem secara otomatis tanpa error.

---

## 🏗️ 1. Arsitektur Sistem CCTV (Zero-Warning & Ultra-Low Latency)

Sistem streaming CCTV FluidHE menggunakan 3 pilar utama:
1. **`go2rtc` (Local Streaming Gateway di Port 8889):**
   * Mengambil video RTSP langsung dari kamera EZVIZ C6N (`rtsp://admin:TJPCYS@<IP_KAMERA>:554/Streaming/Channels/101`).
   * Mengubahnya menjadi format **Media Source Extensions (MSE / WebSocket)** dengan latency hanya ~0.1 - 0.3 detik.
2. **`Cloudflare Quick Tunnel` (`cloudflared.exe`):**
   * Menembus firewall, NAT, dan jaringan internet tanpa perlu port forwarding.
   * **Bebas Halaman Peringatan / Interstitial:** Berbeda dengan ngrok gratis yang memunculkan peringatan *"Visit Site"*, Cloudflare Tunnel bersih 100% (*white-label*) dan langsung mengalirkan video ke Vercel.
3. **`PTZ Cloud Bridge` (Supabase Real-Time Bridge):**
   * Tombol D-Pad kontrol rotasi kamera di Vercel mengirimkan sinyal ke Supabase.
   * Script lokal (`auto_cctv_sync.js`) di Bandung mendengarkan sinyal tersebut dan langsung memutar motor fisik kamera EZVIZ via `ezviz_ptz_service.py` dalam hitungan milidetik.

---

## 🛠️ 2. Langkah-Langkah Menjalankan Sistem CCTV Saat Demo / Uji Coba

Setiap kali Anda ingin melakukan demo rig bersama klien (misal klien di Jogja dan alat di Bandung):

### Langkah 1: Pastikan Kamera & Laptop Terhubung ke Wi-Fi yang Sama
* Cek IP kamera EZVIZ di router atau gunakan tool scanner IP (misal `192.168.101.36`).
* Pastikan port RTSP kamera terbuka dan password verifikasi kamera (*device verification code*) sesuai (default: `TJPCYS`).

### Langkah 2: Jalankan Streaming Gateway & Cloud Tunnel
Buka Command Prompt / PowerShell di folder proyek dan jalankan:
```powershell
# 1. Jalankan go2rtc (jika belum berjalan di background)
.\scripts\go2rtc.exe -config .\scripts\go2rtc.yaml

# 2. Jalankan Auto Tunnel & PTZ Bridge (di tab terminal terpisah)
node .\scripts\auto_cctv_sync.js
```
* Script ini akan secara otomatis:
  1. Membuka Cloudflare Tunnel ke `http://localhost:8889`.
  2. Mengunggah URL publik terbaru ke Supabase Cloud (`telemetry_data`).
  3. Mengaktifkan listener motor kamera PTZ (D-Pad).

### Langkah 3: Buka Web Vercel
* Buka **`https://heat-exchanger-taupe.vercel.app`**.
* Buka menu **CCTV Feed**.
* Video live stream akan otomatis tampil dan tombol kontrol rotasi kamera langsung dapat digerakkan secara responsif!

---

## 🔄 3. Prosedur Jika Berganti Jaringan Wi-Fi / IP Kamera Berubah

Jika Anda memindahkan alat ke tempat lain atau berganti Wi-Fi:

1. **Cari IP Baru Kamera CCTV:**
   * Sambungkan laptop dan kamera ke Wi-Fi baru.
   * Cari IP kamera baru (misal berubah dari `192.168.101.36` menjadi `192.168.1.50`).
2. **Update Konfigurasi `go2rtc.yaml`:**
   Buka file `scripts/go2rtc.yaml`, perbarui bagian IP:
   ```yaml
   streams:
     he_cctv:
       - rtsp://admin:TJPCYS@<IP_BARU_KAMERA>:554/Streaming/Channels/101
   ```
3. **Restart Service:**
   Matikan `go2rtc.exe` dan `auto_cctv_sync.js`, lalu jalankan kembali seperti pada **Bagian 2**. URL baru akan otomatis disinkronkan ke Supabase dan Vercel tanpa perlu deploy ulang!

---

## 📋 4. File-File Kunci Sistem CCTV

| Nama File | Lokasi | Fungsi |
|---|---|---|
| `go2rtc.exe` & `go2rtc.yaml` | `scripts/` | Gateway lokal pengonversi RTSP ke WebSocket MSE (Port 8889) |
| `cloudflared.exe` | `scripts/` | Binary tunnel resmi Cloudflare untuk bypass NAT tanpa peringatan |
| `auto_cctv_sync.js` | `scripts/` | Background runner tunnel Cloudflare + listener eksekusi PTZ lokal |
| `ezviz_ptz_service.py` | `scripts/` | Driver Python pyezviz untuk menggerakkan motor kamera fisik |
| `CctvTab.tsx` | `src/components/cctv/` | Tampilan frontend player iframe + kontrol D-Pad |
| `route.ts` | `src/app/api/cctv/ptz/` | Endpoint API Next.js pengirim perintah D-Pad ke Supabase |

---

## 🤖 5. PROMPT GENERATOR OTOMATIS (Salin Ini ke AI Assistant Jika Terjadi Error / Terhapus)

Salin teks di dalam kotak berikut dan kirimkan ke AI assistant Anda jika sewaktu-waktu sistem terhapus, ter-reset, atau Anda butuh perbaikan otomatis:

```text
Tolong pulihkan dan verifikasi sistem CCTV Live Streaming FluidHE IoT System dengan konfigurasi arsitektur resmi berikut:

1. Streaming Engine: Gunakan go2rtc (port 8889) dengan stream "he_cctv" yang mengambil RTSP dari kamera EZVIZ (rtsp://admin:TJPCYS@<IP_KAMERA>:554/Streaming/Channels/101).
2. Remote Access: Gunakan scripts/cloudflared.exe dengan script auto_cctv_sync.js untuk membuat Cloudflare Quick Tunnel ke http://localhost:8889. Jangan gunakan ngrok free karena memiliki banner interstitial warning, dan jangan gunakan YouTube Live karena memiliki delay siaran 10 detik serta video ID yang selalu kedaluwarsa.
3. Sinkronisasi Cloud: Pastikan auto_cctv_sync.js mengunggah URL trycloudflare.com terbaru ke Supabase table telemetry_data kolom warning_status dengan prefix CCTV_URL:<URL>.
4. Frontend Player: Di CctvTab.tsx, gunakan <iframe> yang memuat <PUBLIC_URL>/stream.html?src=he_cctv&mode=mse agar video mengalir via WebSocket MSE dengan delay ultra-rendah (0.1 detik) dan bebas peringatan browser di HP/laptop klien Vercel.
5. PTZ Cloud Bridge:
   - Di src/app/api/cctv/ptz/route.ts, kirimkan perintah arah D-Pad ke Supabase (warning_status: PTZ_CMD:<DIRECTION>:<DURATION>:<TIMESTAMP>).
   - Di scripts/auto_cctv_sync.js, jalankan listener yang mendeteksi PTZ_CMD tersebut dan mengeksekusi python scripts/ezviz_ptz_service.py move <DIRECTION> <DURATION> secara lokal di Bandung.
6. Cek dan pastikan seluruh service lokal aktif dan deploy update terbaru ke Vercel.
```
