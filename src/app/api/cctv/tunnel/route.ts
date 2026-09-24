import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'cctv-tunnel.json');

function getSavedTunnelUrl(): string {
  try {
    if (process.env.NEXT_PUBLIC_CCTV_TUNNEL_URL) {
      return process.env.NEXT_PUBLIC_CCTV_TUNNEL_URL.trim();
    }
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data.publicUrl === 'string') {
        return data.publicUrl.trim();
      }
    }
  } catch (err) {
    console.warn('Read tunnel config notice:', err);
  }
  return '';
}

export async function GET() {
  const publicUrl = getSavedTunnelUrl();
  return NextResponse.json({
    success: true,
    publicUrl,
    hasConfig: Boolean(publicUrl)
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const publicUrl = typeof body?.publicUrl === 'string' ? body.publicUrl.trim().replace(/\/+$/, '') : '';

    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ publicUrl, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      publicUrl
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Failed to save tunnel config'
    }, { status: 500 });
  }
}
