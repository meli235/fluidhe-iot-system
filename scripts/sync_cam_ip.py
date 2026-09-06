import json
import os
import re
import subprocess
from pyezviz.client import EzvizClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SESSION_FILE = os.path.join(BASE_DIR, 'scripts', 'ezviz_session.json')
GO2RTC_YAML = os.path.join(BASE_DIR, 'scripts', 'go2rtc.yaml')
PLAYBACK_ROUTE = os.path.join(BASE_DIR, 'src', 'app', 'api', 'cctv', 'playback', 'route.ts')
REGION_URL = "apiisgp.ezvizlife.com"
SERIAL = "BK8777283"

def get_current_camera_ip():
    if not os.path.exists(SESSION_FILE):
        return None
    try:
        with open(SESSION_FILE, 'r') as f:
            token = json.load(f)
        client = EzvizClient(token=token, url=REGION_URL)
        cams = client.load_cameras()
        if SERIAL in cams:
            return cams[SERIAL].get('local_ip')
    except Exception as e:
        print(f"[sync_cam_ip] Error fetching camera info: {e}")
    return None

def update_ip(new_ip):
    if not new_ip:
        return False

    updated = False

    # 1. Update go2rtc.yaml
    if os.path.exists(GO2RTC_YAML):
        with open(GO2RTC_YAML, 'r') as f:
            content = f.read()
        
        # Replace RTSP IPs: rtsp://admin:Eva1Yosep2@<ip>:554
        new_content = re.sub(r'(@)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:554)', rf'\g<1>{new_ip}\g<3>', content)
        if new_content != content:
            with open(GO2RTC_YAML, 'w') as f:
                f.write(new_content)
            print(f"[sync_cam_ip] Updated {GO2RTC_YAML} to IP {new_ip}")
            updated = True

    # 2. Update playback route.ts
    if os.path.exists(PLAYBACK_ROUTE):
        with open(PLAYBACK_ROUTE, 'r') as f:
            content = f.read()
        new_content = re.sub(r"(const camIp = ')[^']+(';)", rf"\g<1>{new_ip}\g<2>", content)
        if new_content != content:
            with open(PLAYBACK_ROUTE, 'w') as f:
                f.write(new_content)
            print(f"[sync_cam_ip] Updated {PLAYBACK_ROUTE} to IP {new_ip}")
            updated = True

    # If updated, restart go2rtc
    if updated:
        try:
            subprocess.run(["powershell", "-Command", "Stop-Process -Name 'go2rtc' -Force -ErrorAction SilentlyContinue"], timeout=5)
            go2rtc_exe = os.path.join(BASE_DIR, 'scripts', 'go2rtc.exe')
            subprocess.Popen([go2rtc_exe, '-config', GO2RTC_YAML], cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0)
            print(f"[sync_cam_ip] Restarted go2rtc with new IP {new_ip}")
        except Exception as e:
            print(f"[sync_cam_ip] Error restarting go2rtc: {e}")

    return updated

if __name__ == '__main__':
    ip = get_current_camera_ip()
    print(f"Current EZVIZ local IP: {ip}")
    if ip:
        update_ip(ip)
