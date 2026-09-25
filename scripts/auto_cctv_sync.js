const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkxfbjpbaxnmgsnxrbpj.supabase.co';
const MASTER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGZianBiYXhubWdzbnhyYnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTIxNDY2MCwiZXhwIjoyMTAwNzkwNjYwfQ.AotyhjikKONI3q1OatoEenQ4wS1rb3WcCoTROCqR7WU';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || MASTER_KEY;

let currentActiveUrl = '';

async function syncToSupabase(publicUrl) {
  if (!publicUrl) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telemetry_data`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        temp_1: 0,
        temp_2: 0,
        temp_3: 0,
        temp_4: 0,
        pressure: 0,
        flow_rate: 0,
        heater_status: 'OFF',
        warning_status: `CCTV_URL:${publicUrl}`
      })
    });
    if (res.ok) {
      console.log(`[OK] CCTV Public URL tersinkronisasi otomatis ke Supabase: ${publicUrl}`);
    } else {
      console.warn('[WARN] Gagal sinkron ke Supabase:', await res.text());
    }
  } catch (err) {
    console.warn('[WARN] Error sinkron ke Supabase:', err.message || err);
  }
}

// 1. Pastikan folder data & file config lokal ada
const configPath = path.join(__dirname, '..', 'data', 'cctv-tunnel.json');
function saveLocalConfig(publicUrl) {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ publicUrl, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
  } catch (_) {}
}

// 2. Jalankan cloudflared tunnel dengan HTTP2 (Rock-Solid pada jaringan seluler/4G)
const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');
let proc = null;
let isStopping = false;

function startTunnel() {
  if (isStopping) return;
  console.log('[INFO] Memulai Cloudflare Tunnel via HTTP2 TCP ke go2rtc (port 8889)...');

  // Menggunakan --protocol http2 dan --edge-ip-version 4 agar tidak terputus timeout UDP QUIC di Wi-Fi 4G
  proc = spawn(cloudflaredPath, [
    'tunnel',
    '--protocol', 'http2',
    '--edge-ip-version', '4',
    '--url', 'http://localhost:8889'
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  function handleOutput(data) {
    const text = data.toString();
    process.stdout.write(text);

    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && match[0]) {
      const publicUrl = match[0];
      if (publicUrl !== currentActiveUrl) {
        currentActiveUrl = publicUrl;
        console.log('\n======================================================');
        console.log(`🚀 URL CCTV BARU AKTIF: ${publicUrl}`);
        console.log('======================================================\n');
        saveLocalConfig(publicUrl);
        syncToSupabase(publicUrl);
      }
    }
  }

  proc.stdout.on('data', handleOutput);
  proc.stderr.on('data', handleOutput);

  proc.on('close', (code) => {
    console.log(`[INFO] Cloudflare process exited with code ${code}.`);
    if (!isStopping) {
      console.log('[INFO] Merestart Cloudflare Tunnel dalam 3 detik...');
      setTimeout(startTunnel, 3000);
    }
  });

  proc.on('error', (err) => {
    console.error('[ERR] Cloudflare spawn error:', err);
  });
}

startTunnel();

// 3. Keep-alive sync ke Supabase setiap 45 detik agar URL selalu segar di baris teratas
setInterval(() => {
  if (currentActiveUrl) {
    syncToSupabase(currentActiveUrl);
  }
}, 45000);

// 4. Listener Perintah PTZ dari Remote / Vercel (Cloud D-Pad Bridge)
let lastProcessedPtzTime = Date.now();
const ptzScriptPath = path.join(__dirname, 'ezviz_ptz_service.py');

setInterval(async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telemetry_data?warning_status=like.PTZ_CMD:*&order=id.desc&limit=1`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && typeof rows[0]?.warning_status === 'string') {
      const parts = rows[0].warning_status.split(':');
      if (parts.length >= 4) {
        const direction = parts[1];
        const duration = parts[2] || '0.55';
        const timestamp = parseInt(parts[3], 10);
        if (timestamp > lastProcessedPtzTime) {
          lastProcessedPtzTime = timestamp;
          console.log(`[PTZ REMOTE] Menjalankan perintah rotasi kamera dari Vercel: ${direction} (${duration}s)...`);
          spawn('python', [ptzScriptPath, 'move', direction, duration], {
            stdio: 'inherit'
          });
        }
      }
    }
  } catch (_) {}
}, 500);

process.on('SIGINT', () => {
  isStopping = true;
  if (proc) proc.kill();
  process.exit(0);
});
