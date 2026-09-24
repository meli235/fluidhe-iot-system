const { spawn, exec } = require('child_process');
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
      console.log(`[OK] CCTV Public URL berhasil disinkronkan ke Supabase Cloud!`);
    } else {
      console.warn('[WARN] Gagal sinkron ke Supabase:', await res.text());
    }
  } catch (err) {
    console.warn('[WARN] Error sinkron ke Supabase:', err.message || err);
  }
}

// 1. Simpan config lokal
const configPath = path.join(__dirname, '..', 'data', 'cctv-tunnel.json');
function saveLocalConfig(publicUrl) {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ publicUrl, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
  } catch (_) {}
}

// 2. Loop cek ngrok API sampai URL ditemukan
async function pollNgrokApi() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels');
      if (res.ok) {
        const data = await res.json();
        const httpsTunnel = data.tunnels?.find(t => t.proto === 'https' || t.public_url?.startsWith('https:'));
        if (httpsTunnel && httpsTunnel.public_url) {
          return httpsTunnel.public_url;
        }
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  return null;
}

async function main() {
  console.log('======================================================');
  console.log('   FLUIDHE CCTV ONLINE — AUTO NGROK SYNC LAUNCHER');
  console.log('======================================================\n');

  // Pastikan go2rtc berjalan
  const go2rtcPath = path.join(__dirname, 'go2rtc.exe');
  const go2rtcConfig = path.join(__dirname, 'go2rtc.yaml');
  try {
    const checkGo2rtc = await fetch('http://localhost:8889/api/streams');
    if (checkGo2rtc.ok) {
      console.log('[OK] go2rtc service sudah aktif di port 8889.');
    }
  } catch (_) {
    console.log('[INFO] Menjalankan go2rtc service di background...');
    spawn(go2rtcPath, ['-config', go2rtcConfig], { detached: true, stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Cek apakah ngrok sudah berjalan
  let publicUrl = await pollNgrokApi();
  if (!publicUrl) {
    console.log('[INFO] Menjalankan ngrok di port 8889...');
    const ngrokExe = 'C:\\laragon\\bin\\ngrok\\ngrok.exe';
    spawn(ngrokExe, ['http', '8889'], { detached: true, stdio: 'ignore' });
    publicUrl = await pollNgrokApi();
  }

  if (publicUrl) {
    console.log('\n======================================================');
    console.log(`🚀 CCTV ONLINE AKTIF: ${publicUrl}`);
    console.log('======================================================');
    saveLocalConfig(publicUrl);
    await syncToSupabase(publicUrl);
    console.log('\n✅ Klien di Jogja langsung bisa melihat siaran CCTV di Vercel:');
    console.log('👉 Buka https://heat-exchanger-taupe.vercel.app/');
    console.log('(Bisa langsung di HP Android, iPhone, maupun Laptop tanpa warning ngrok!)\n');
  } else {
    console.error('❌ Gagal mendapatkan URL dari ngrok. Pastikan ngrok terinstall di C:\\laragon\\bin\\ngrok\\ngrok.exe');
  }
}

main();
