import sys
import os
import json
import re
import subprocess
from pyezviz.client import EzvizClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SESSION_FILE = os.path.join(BASE_DIR, 'scripts', 'ezviz_session.json')
GO2RTC_YAML = os.path.join(BASE_DIR, 'scripts', 'go2rtc.yaml')
PLAYBACK_ROUTE = os.path.join(BASE_DIR, 'src', 'app', 'api', 'cctv', 'playback', 'route.ts')
REGION_URL = "apiisgp.ezvizlife.com"
SERIAL = "BK8777283"

def get_laptop_wifi():
    current_ssid = ""
    available_ssids = []
    
    # Get current connected Wi-Fi
    try:
        out = subprocess.check_output("netsh wlan show interfaces", shell=True, text=True, errors="ignore")
        for line in out.splitlines():
            line_str = line.strip()
            if line_str.startswith("SSID") and ":" in line_str:
                current_ssid = line_str.split(":", 1)[1].strip()
                break
    except Exception:
        pass

    # Get available Wi-Fi networks
    try:
        out = subprocess.check_output("netsh wlan show networks", shell=True, text=True, errors="ignore")
        for line in out.splitlines():
            line_str = line.strip()
            if line_str.startswith("SSID") and ":" in line_str:
                name = line_str.split(":", 1)[1].strip()
                if name and name not in available_ssids:
                    available_ssids.append(name)
    except Exception:
        pass

    if current_ssid and current_ssid not in available_ssids:
        available_ssids.insert(0, current_ssid)

    return current_ssid, available_ssids

def get_camera_info():
    if not os.path.exists(SESSION_FILE):
        return {"online": False, "status_text": "Sesi belum terhubung", "last_ssid": "", "local_ip": ""}

    try:
        with open(SESSION_FILE, 'r') as f:
            token = json.load(f)
        client = EzvizClient(token=token, url=REGION_URL)
        info = client.get_device_infos(SERIAL)
        wifi = info.get('WIFI', {})
        dev = info.get('deviceInfos', {})
        is_online = (dev.get('status') == 1)
        
        return {
            "online": is_online,
            "status_text": "Online" if is_online else "Terputus / Offline",
            "last_ssid": wifi.get('ssid', ''),
            "local_ip": wifi.get('address', '')
        }
    except Exception as e:
        return {"online": False, "status_text": f"Error: {str(e)}", "last_ssid": "", "local_ip": ""}

def sync_camera_network():
    cam_info = get_camera_info()
    new_ip = cam_info.get("local_ip")
    is_online = cam_info.get("online", False)

    if not is_online or not new_ip:
        return {
            "success": False,
            "message": f"Kamera masih belum terhubung ke Wi-Fi. (Wi-Fi terakhir: {cam_info.get('last_ssid') or 'Tidak diketahui'}). Pastikan kamera sudah terhubung ke router.",
            "camera_info": cam_info
        }

    # Update go2rtc.yaml
    updated = False
    if os.path.exists(GO2RTC_YAML):
        with open(GO2RTC_YAML, 'r') as f:
            content = f.read()
        new_content = re.sub(r'(@)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:554)', rf'\g<1>{new_ip}\g<3>', content)
        if new_content != content:
            with open(GO2RTC_YAML, 'w') as f:
                f.write(new_content)
            updated = True

    # Update playback route.ts
    if os.path.exists(PLAYBACK_ROUTE):
        with open(PLAYBACK_ROUTE, 'r') as f:
            content = f.read()
        new_content = re.sub(r"(const camIp = ')[^']+(';)", rf"\g<1>{new_ip}\g<2>", content)
        if new_content != content:
            with open(PLAYBACK_ROUTE, 'w') as f:
                f.write(new_content)
            updated = True

    # Restart go2rtc service
    try:
        subprocess.run(["powershell", "-Command", "Stop-Process -Name 'go2rtc' -Force -ErrorAction SilentlyContinue"], timeout=5)
        go2rtc_exe = os.path.join(BASE_DIR, 'scripts', 'go2rtc.exe')
        scripts_dir = os.path.join(BASE_DIR, 'scripts')
        subprocess.run([
            "powershell", "-Command",
            f"Start-Process -FilePath '{go2rtc_exe}' -ArgumentList '-config \"{GO2RTC_YAML}\"' -WorkingDirectory '{scripts_dir}' -WindowStyle Hidden"
        ], timeout=5)
    except Exception as e:
        print(f"Error restart go2rtc: {e}", file=sys.stderr)

    return {
        "success": True,
        "message": f"Kamera berhasil tersambung dan video telah aktif kembali di jaringan baru ({cam_info.get('last_ssid')}).",
        "camera_info": cam_info
    }

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "status"

    if action == "status":
        current_wifi, networks = get_laptop_wifi()
        cam = get_camera_info()
        print(json.dumps({
            "success": True,
            "laptop_wifi": current_wifi,
            "available_networks": networks,
            "camera": cam
        }))
    elif action == "sync":
        res = sync_camera_network()
        print(json.dumps(res))
    else:
        print(json.dumps({"success": False, "message": "Unknown action"}))
