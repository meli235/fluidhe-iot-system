import { useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase,
  setSupabaseAnonKey,
  getStoredAnonKey
} from '@/lib/supabase';
import {
  TelemetryRow,
  DeviceControlsRow,
  SupabaseConnectionStatus
} from '@/types';
import {
  fetchLatestTelemetry,
  fetchDeviceControls,
  supabaseControlService
} from '@/lib/supabaseService';

/**
 * Custom Hook untuk Integrasi Real-Time Telemetri & Kontrol Dua Arah ESP32 (Supabase)
 */
export function useSupabaseIntegration() {
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus>('CONNECTING');
  const [isHardwareOnline, setIsHardwareOnline] = useState<boolean>(false);
  const [lastHardwareHeartbeat, setLastHardwareHeartbeat] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAnonKey, setCurrentAnonKey] = useState<string>('');
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryRow | null>(null);
  const [telemetryStream, setTelemetryStream] = useState<TelemetryRow[]>([]);
  const [deviceControls, setDeviceControls] = useState<DeviceControlsRow>({
    id: 1,
    flow_mode: 'COUNTER',
    control_mode: 'MANUAL',
    heater_status: false,
    servo_angle: 52,
    target_temp: 62.5,
    uap_status: true,
    air_dingin: false,
    target_flow: 2.0,
    btn_up: false,
    btn_onoff: false,
    btn_down: false
  });
  const [activeMomentaryButtons, setActiveMomentaryButtons] = useState<{ btn_up: boolean; btn_onoff: boolean; btn_down: boolean }>({
    btn_up: false,
    btn_onoff: false,
    btn_down: false
  });
  const [isUpdatingControl, setIsUpdatingControl] = useState<boolean>(false);
  const lastUserActionTimeRef = useRef<number>(0);

  useEffect(() => {
    setCurrentAnonKey(getStoredAnonKey());
  }, []);

  // Initial Fetch Data (Telemetry & Controls)
  const initializeData = useCallback(async () => {
    setConnectionStatus('CONNECTING');
    setErrorMessage(null);

    const activeKey = getStoredAnonKey();
    if (!activeKey || activeKey.includes('YOUR_SUPABASE') || activeKey.includes('INVALID_KEY') || activeKey.trim().length < 10) {
      setErrorMessage('Supabase Anon Key belum diisi atau tidak valid. Silakan masukkan Public Anon Key Anda di bawah ini.');
      setConnectionStatus('ERROR');
      return;
    }

    try {
      // 1. Fetch initial telemetry
      const { data: initialTelemetry, error: telemetryErr } = await fetchLatestTelemetry(20);
      if (telemetryErr) {
        if (telemetryErr.message.includes('Invalid API key') || telemetryErr.message.includes('apiKey') || telemetryErr.message.includes('Unregistered API key')) {
          setErrorMessage('Supabase Anon Key belum terdaftar di project Supabase ini. Silakan masukkan Public Anon Key (JWT starting with eyJhb...) dari Supabase Dashboard ➔ Project Settings ➔ API.');
        } else {
          setErrorMessage(`Gagal membaca telemetry_data: ${telemetryErr.message}`);
        }
        setConnectionStatus('ERROR');
      } else if (initialTelemetry && initialTelemetry.length > 0) {
        setTelemetryStream(initialTelemetry);
        setLatestTelemetry(initialTelemetry[initialTelemetry.length - 1]);
        setConnectionStatus('ONLINE');
      }

      // 2. Fetch initial device controls
      const { data: controlsData, error: controlsErr } = await fetchDeviceControls();
      if (controlsErr) {
        if (!telemetryErr) {
          setErrorMessage(`Gagal membaca device_controls (Row ID=1): ${controlsErr.message}`);
        }
      } else if (controlsData) {
        let storedAuto = false;
        let storedInterval = 10;
        try {
          storedAuto = localStorage.getItem('he_uap_auto_status') === 'true';
          const savedInt = Number(localStorage.getItem('he_uap_interval_min'));
          if (savedInt > 0) storedInterval = savedInt;
        } catch (e) {}

        setDeviceControls((prev) => ({
          ...prev,
          ...controlsData,
          uap_auto_status: controlsData.uap_auto_status ?? (prev.uap_auto_status ?? storedAuto),
          uap_interval_min: controlsData.uap_interval_min ?? (prev.uap_interval_min ?? storedInterval),
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan ke Supabase';
      setErrorMessage(msg);
      setConnectionStatus('ERROR');
    }
  }, []);

  // Function to save new Anon Key dynamically from UI
  const saveAnonKey = (newKey: string) => {
    setSupabaseAnonKey(newKey);
    setCurrentAnonKey(newKey.trim());
    initializeData();
  };

  // Realtime & Hybrid Polling Setup for telemetry_data & device_controls
  useEffect(() => {
    initializeData();

    // Polling Interval Fallback (Setiap 2 Detik) untuk Menjamin Update Real-Time Selalu Tampak
    const pollInterval = setInterval(() => {
      fetchLatestTelemetry(20).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setTelemetryStream(data);
          const latest = data[data.length - 1];
          setLatestTelemetry(latest);
          setConnectionStatus('ONLINE');
          setErrorMessage(null);

          // Check if latest telemetry row was produced recently (< 15 seconds)
          if (latest.created_at) {
            const rowTime = new Date(latest.created_at).getTime();
            if (!isNaN(rowTime) && (Date.now() - rowTime < 15000)) {
              setLastHardwareHeartbeat(Date.now());
              setIsHardwareOnline(true);
            }
          }
        }
      });

      fetchDeviceControls().then(({ data, error }) => {
        if (!error && data) {
          const isRecentlyUpdatedByUser = (Date.now() - lastUserActionTimeRef.current < 10000);
          setDeviceControls((prev) => {
            const controlModeToKeep = isRecentlyUpdatedByUser ? prev.control_mode : (data.control_mode || prev.control_mode);
            const flowModeToKeep = isRecentlyUpdatedByUser ? prev.flow_mode : (data.flow_mode || prev.flow_mode);

            return {
              ...prev,
              ...data,
              control_mode: controlModeToKeep,
              flow_mode: flowModeToKeep,
              heater_1_status: isRecentlyUpdatedByUser ? prev.heater_1_status : (data.heater_1_status !== undefined ? data.heater_1_status : Boolean(data.heater_status)),
              heater_2_status: isRecentlyUpdatedByUser ? prev.heater_2_status : (data.heater_2_status !== undefined ? data.heater_2_status : false),
              uap_auto_status: prev.uap_auto_status ?? false,
              uap_interval_min: prev.uap_interval_min ?? 10,
            };
          });

          // Check if updated_at is within last 15 seconds
          if ((data as any).updated_at) {
            const updateTime = new Date((data as any).updated_at).getTime();
            if (!isNaN(updateTime) && (Date.now() - updateTime < 15000)) {
              setLastHardwareHeartbeat(Date.now());
              setIsHardwareOnline(true);
            }
          }
        }
      });
    }, 2000);

    // 1. Telemetry Data Subscription (INSERT event)
    const telemetryChannel = supabase
      .channel('telemetry_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry_data' },
        (payload) => {
          const newRow = payload.new as TelemetryRow;
          setLatestTelemetry(newRow);
          setTelemetryStream((prev) => {
            const updated = [...prev, newRow];
            return updated.slice(-30);
          });
          setConnectionStatus('ONLINE');
          setLastHardwareHeartbeat(Date.now());
          setIsHardwareOnline(true);
          setErrorMessage(null);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('ONLINE');
        }
      });

    // 2. Device Controls Realtime Sync Subscription (UPDATE event on row id = 1)
    const controlsChannel = supabase
      .channel('device_controls_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'device_controls' },
        (payload) => {
          const updatedControls = payload.new as DeviceControlsRow;
          const isRecentlyUpdatedByUser = (Date.now() - lastUserActionTimeRef.current < 10000);
          if (updatedControls && updatedControls.id === 1) {
            setDeviceControls((prev) => {
              const controlModeToKeep = isRecentlyUpdatedByUser ? prev.control_mode : (updatedControls.control_mode || prev.control_mode);
              const flowModeToKeep = isRecentlyUpdatedByUser ? prev.flow_mode : (updatedControls.flow_mode || prev.flow_mode);

              return {
                ...prev,
                ...updatedControls,
                control_mode: controlModeToKeep,
                flow_mode: flowModeToKeep,
                heater_1_status: isRecentlyUpdatedByUser ? prev.heater_1_status : (updatedControls.heater_1_status !== undefined ? updatedControls.heater_1_status : Boolean(updatedControls.heater_status)),
                heater_2_status: isRecentlyUpdatedByUser ? prev.heater_2_status : (updatedControls.heater_2_status !== undefined ? updatedControls.heater_2_status : false),
                uap_auto_status: prev.uap_auto_status ?? false,
                uap_interval_min: prev.uap_interval_min ?? 10,
              };
            });
            setConnectionStatus('ONLINE');
            setLastHardwareHeartbeat(Date.now());
            setIsHardwareOnline(true);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(telemetryChannel);
      supabase.removeChannel(controlsChannel);
    };
  }, [initializeData]);

  // Periodic heartbeat watchdog to mark hardware offline if no packet for > 12s
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (lastHardwareHeartbeat && (Date.now() - lastHardwareHeartbeat < 12000)) {
        setIsHardwareOnline(true);
      } else {
        setIsHardwareOnline(false);
      }
    }, 2000);
    return () => clearInterval(watchdog);
  }, [lastHardwareHeartbeat]);

  // Handlers untuk Dispatch Command Write dengan Try-Catch & Feedback State
  const handleFlowModeChange = async (flowMode: 'COUNTER' | 'CO-CURRENT') => {
    lastUserActionTimeRef.current = Date.now();
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, flow_mode: flowMode }));
    const result = await supabaseControlService.setFlowMode(flowMode);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update flow_mode: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleControlModeChange = async (controlMode: 'AUTO' | 'MANUAL') => {
    lastUserActionTimeRef.current = Date.now();
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({
      ...prev,
      control_mode: controlMode,
      ...(controlMode === 'AUTO' ? { flow_mode: 'COUNTER', air_dingin: true, uap_auto_status: true } : {})
    }));
    const result = await supabaseControlService.setControlMode(controlMode);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update control_mode: ${result.error}`);
    } else {
      setErrorMessage(null);
      lastUserActionTimeRef.current = Date.now();
      if (result.data) {
        setDeviceControls((prev) => ({
          ...prev,
          ...result.data,
          control_mode: result.data!.control_mode || controlMode,
          flow_mode: controlMode === 'AUTO' ? 'COUNTER' : (result.data!.flow_mode || prev.flow_mode),
        }));
      }
    }
    return result;
  };

  const handleHeater1PowerToggle = async (status: boolean) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => {
      const h2 = prev.heater_2_status ?? false;
      const masterOn = status || h2;
      return {
        ...prev,
        heater_status: masterOn,
        heater_1_status: status,
        btn_onoff: masterOn,
      };
    });
    const result = await supabaseControlService.setHeater1Power(status);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update heater_1_status: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleHeater2PowerToggle = async (status: boolean) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => {
      const h1 = prev.heater_1_status ?? false;
      const masterOn = h1 || status;
      return {
        ...prev,
        heater_status: masterOn,
        heater_2_status: status,
        btn_onoff: masterOn,
      };
    });
    const result = await supabaseControlService.setHeater2Power(status);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update heater_2_status: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleHeaterPowerToggle = async (heaterStatus: boolean) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({
      ...prev,
      heater_status: heaterStatus,
      heater_1_status: heaterStatus,
      heater_2_status: heaterStatus,
      btn_onoff: heaterStatus,
    }));
    const result = await supabaseControlService.setHeaterPower(heaterStatus);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update heater_status: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleTargetTempChange = async (targetTemp: number) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, target_temp: targetTemp }));
    const result = await supabaseControlService.setTargetTemp(targetTemp);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update target_temp: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleServoAngleChange = async (servoAngle: number) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, servo_angle: servoAngle }));
    const result = await supabaseControlService.setServoAngle(servoAngle);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update servo_angle: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleValve1Change = async (percent: number) => {
    setIsUpdatingControl(true);
    const clamped = Math.min(100, Math.max(0, Math.round(percent / 20) * 20));
    setDeviceControls((prev) => ({ ...prev, servo_angle: clamped }));
    const result = await supabaseControlService.setValve1Percent(clamped);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update Katup Panas: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleValve2Change = async (percent: number) => {
    setIsUpdatingControl(true);
    const clamped = Math.min(100, Math.max(0, Math.round(percent / 20) * 20));
    setDeviceControls((prev) => ({ ...prev, servo_angle_2: clamped }));
    const result = await supabaseControlService.setValve2Percent(clamped);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update Katup Dingin: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleTargetFlowChange = async (targetFlow: number) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, target_flow: targetFlow }));
    const result = await supabaseControlService.setTargetFlow(targetFlow);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update target_flow: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleUapStatusToggle = async (uapStatus: boolean) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, uap_status: uapStatus }));
    const result = await supabaseControlService.setUapStatus(uapStatus);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update uap_status: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleUapAutoToggle = async (uapAutoStatus: boolean) => {
    setIsUpdatingControl(true);
    try {
      localStorage.setItem('he_uap_auto_status', String(uapAutoStatus));
    } catch (e) {}
    setDeviceControls((prev) => ({ ...prev, uap_auto_status: uapAutoStatus }));
    const result = await supabaseControlService.setUapAutoStatus(uapAutoStatus);
    setIsUpdatingControl(false);
    return { success: true };
  };

  const handleUapIntervalChange = async (intervalMin: number) => {
    setIsUpdatingControl(true);
    try {
      localStorage.setItem('he_uap_interval_min', String(intervalMin));
    } catch (e) {}
    setDeviceControls((prev) => ({ ...prev, uap_interval_min: intervalMin }));
    const result = await supabaseControlService.setUapIntervalMin(intervalMin);
    setIsUpdatingControl(false);
    return { success: true };
  };

  const handleAirDinginToggle = async (airDinginStatus: boolean) => {
    setIsUpdatingControl(true);
    setDeviceControls((prev) => ({ ...prev, air_dingin: airDinginStatus }));
    const result = await supabaseControlService.setAirDinginStatus(airDinginStatus);
    setIsUpdatingControl(false);
    if (!result.success) {
      setErrorMessage(`Gagal update air_dingin: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleStepButtonPress = async (btnName: 'btn_up' | 'btn_down') => {
    setIsUpdatingControl(true);
    const countKey = btnName === 'btn_up' ? 'step_up_count' : 'step_down_count';
    const currentCount = deviceControls[countKey] ?? 0;
    const nextCount = currentCount + 1;

    setActiveMomentaryButtons((prev) => ({ ...prev, [btnName]: true }));
    setDeviceControls((prev) => ({
      ...prev,
      [btnName]: true,
      [countKey]: nextCount
    }));

    const result = await supabaseControlService.triggerStepButton(btnName, currentCount);
    
    setActiveMomentaryButtons((prev) => ({ ...prev, [btnName]: false }));
    setDeviceControls((prev) => ({ ...prev, [btnName]: false }));
    setIsUpdatingControl(false);

    if (!result.success) {
      setErrorMessage(`Gagal memicu tombol ${btnName}: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  const handleMomentaryButtonPress = async (btnName: 'btn_up' | 'btn_onoff' | 'btn_down') => {
    setIsUpdatingControl(true);
    setActiveMomentaryButtons((prev) => ({ ...prev, [btnName]: true }));
    setDeviceControls((prev) => ({ ...prev, [btnName]: true }));

    const result = await supabaseControlService.triggerMomentaryButton(btnName);
    
    setActiveMomentaryButtons((prev) => ({ ...prev, [btnName]: false }));
    setDeviceControls((prev) => ({ ...prev, [btnName]: false }));
    setIsUpdatingControl(false);

    if (!result.success) {
      setErrorMessage(`Gagal memicu tombol servo ${btnName}: ${result.error}`);
    } else {
      setErrorMessage(null);
    }
    return result;
  };

  return {
    connectionStatus,
    isHardwareOnline,
    lastHardwareHeartbeat,
    errorMessage,
    currentAnonKey,
    saveAnonKey,
    latestTelemetry,
    telemetryStream,
    deviceControls,
    activeMomentaryButtons,
    isUpdatingControl,
    initializeData,
    handleFlowModeChange,
    handleControlModeChange,
    handleHeaterPowerToggle,
    handleHeater1PowerToggle,
    handleHeater2PowerToggle,
    handleTargetTempChange,
    handleServoAngleChange,
    handleValve1Change,
    handleValve2Change,
    handleTargetFlowChange,
    handleUapStatusToggle,
    handleUapAutoToggle,
    handleUapIntervalChange,
    handleAirDinginToggle,
    handleStepButtonPress,
    handleMomentaryButtonPress
  };
}
