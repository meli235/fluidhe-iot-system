const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkxfbjpbaxnmgsnxrbpj.supabase.co';
const MASTER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGZianBiYXhubWdzbnhyYnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTIxNDY2MCwiZXhwIjoyMTAwNzkwNjYwfQ.AotyhjikKONI3q1OatoEenQ4wS1rb3WcCoTROCqR7WU';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || MASTER_KEY;

async function syncToSupabase(publicUrl) {
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

// 2. Jalankan cloudflared tunnel
const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');
console.log('[INFO] Memulai Cloudflare Tunnel ke go2rtc (port 8889)...');

const proc = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:8889'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;

function handleOutput(data) {
  const text = data.toString();
  process.stdout.write(text);

  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && match[0]) {
    const publicUrl = match[0];
    if (!urlFound) {
      urlFound = true;
      console.log('\n======================================================');
      console.log(`🚀 URL CCTV AKTIF: ${publicUrl}`);
      console.log('======================================================\n');
      saveLocalConfig(publicUrl);
      syncToSupabase(publicUrl);
    }
  }
}

proc.stdout.on('data', handleOutput);
proc.stderr.on('data', handleOutput);

proc.on('close', (code) => {
  console.log(`[INFO] Cloudflare process exited with code ${code}`);
});

process.on('SIGINT', () => {
  proc.kill();
  process.exit(0);
});
