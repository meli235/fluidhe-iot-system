import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';

const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'cctv_wifi_helper.py');

function runHelper(action: string): Promise<any> {
  return new Promise((resolve) => {
    execFile('python', [SCRIPT_PATH, action], { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`cctv_wifi_helper error (${action}):`, error, stderr);
        resolve({
          success: false,
          message: 'Gagal mengecek status jaringan CCTV',
          error: stderr || error.message
        });
        return;
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        resolve({
          success: false,
          message: 'Format respon script tidak valid',
          raw: stdout
        });
      }
    });
  });
}

export async function GET() {
  const result = await runHelper('status');
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action || 'sync';
    const result = await runHelper(action);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Gagal memproses permintaan jaringan CCTV'
    }, { status: 500 });
  }
}
