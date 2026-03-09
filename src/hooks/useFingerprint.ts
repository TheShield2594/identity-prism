// @ts-nocheck
import { useState, useEffect } from 'react';

export interface FingerprintData {
  userAgent: string;
  platform: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  deviceMemory: number | undefined;
  hardwareConcurrency: number | undefined;
  timezone: string;
  timezoneOffset: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  pixelRatio: number;
  batteryLevel: number | undefined;
  batteryCharging: boolean | undefined;
  canvasFingerprint: string;
  audioFingerprint: string;
  plugins: string;
  doNotTrack: string | undefined;
  cookiesEnabled: boolean;
  languages: string;
  connectionType: string | undefined;
}

export interface SeedData {
  seed: number;
  shape: 'sphere' | 'cube' | 'torus' | 'octahedron' | 'icosahedron';
  colorHue: number;
  colorSaturation: number;
  complexity: number;
  brightness: number;
  rotationSpeed: number;
  wireframe: boolean;
  glowIntensity: number;
}

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const generateCanvasFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 200;
  canvas.height = 50;

  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Identity Prism', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Identity Prism', 4, 17);

  return canvas.toDataURL();
};

const generateAudioFingerprint = async (): Promise<string> => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    const fingerprint = await new Promise<string>((resolve) => {
      processor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i]);
        }
        resolve(sum.toString());
      };
    });

    oscillator.stop();
    audioContext.close();
    return fingerprint;
  } catch {
    return 'audio-error';
  }
};

const getConnectionType = (): string | undefined => {
  const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection ||
    (navigator as unknown as { mozConnection?: { effectiveType?: string } }).mozConnection ||
    (navigator as unknown as { webkitConnection?: { effectiveType?: string } }).webkitConnection;
  return connection?.effectiveType;
};

interface NavigatorWithBattery {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
  }>;
}

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [seedData, setSeedData] = useState<SeedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collectFingerprint = async () => {
      let batteryLevel: number | undefined;
      let batteryCharging: boolean | undefined;

      try {
        const nav = navigator as NavigatorWithBattery;
        if (nav.getBattery) {
          const battery = await nav.getBattery();
          batteryLevel = battery.level;
          batteryCharging = battery.charging;
        }
      } catch {
        // Battery API not supported
      }

      const audioFingerprint = await generateAudioFingerprint();

      const data: FingerprintData = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: window.screen.colorDepth,
        deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        touchSupport: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints,
        pixelRatio: window.devicePixelRatio,
        batteryLevel,
        batteryCharging,
        canvasFingerprint: generateCanvasFingerprint(),
        audioFingerprint,
        plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
        doNotTrack: navigator.doNotTrack,
        cookiesEnabled: navigator.cookieEnabled,
        languages: navigator.languages?.join(',') || navigator.language,
        connectionType: getConnectionType(),
      };

      setFingerprint(data);
      generateSeedData(data);
      setIsLoading(false);
    };

    const timeout = setTimeout(collectFingerprint, 1500);
    return () => clearTimeout(timeout);
  }, []);

  const generateSeedData = (fp: FingerprintData) => {
    const combinedString = [
      fp.userAgent,
      fp.platform,
      fp.screenWidth.toString(),
      fp.screenHeight.toString(),
      fp.language,
      fp.timezone,
      fp.canvasFingerprint.slice(0, 50),
      Date.now().toString(),
    ].join('|');

    const seed = hashString(combinedString);

    let shape: SeedData['shape'];
    const platformHash = hashString(fp.platform);
    const shapeIndex = platformHash % 5;
    switch (shapeIndex) {
      case 0: shape = 'sphere'; break;
      case 1: shape = 'cube'; break;
      case 2: shape = 'torus'; break;
      case 3: shape = 'octahedron'; break;
      default: shape = 'icosahedron';
    }

    const colorHue = (seed % 360);
    const colorSaturation = 50 + (seed % 40);

    const complexity = fp.hardwareConcurrency
      ? Math.min(Math.max(fp.hardwareConcurrency / 8, 0.2), 1)
      : 0.5;

    const brightness = fp.batteryLevel !== undefined
      ? fp.batteryLevel
      : 0.8;

    const rotationSpeed = 0.002 + (seed % 10) * 0.001;

    const wireframe = seed % 3 === 0;

    const glowIntensity = 0.5 + (seed % 50) / 100;

    setSeedData({
      seed,
      shape,
      colorHue,
      colorSaturation,
      complexity,
      brightness,
      rotationSpeed,
      wireframe,
      glowIntensity,
    });
  };

  const regenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (fingerprint) {
        const timeVaryingFingerprint = {
          ...fingerprint,
          userAgent: fingerprint.userAgent + Date.now().toString(),
        };
        generateSeedData(timeVaryingFingerprint);
      }
      setIsLoading(false);
    }, 100);
  };

  return { fingerprint, seedData, isLoading, regenerate };
};

export const getDataDescription = (key: keyof FingerprintData, value: unknown): string => {
  const descriptions: Record<string, string> = {
    userAgent: 'Your browser\'s unique signature',
    platform: 'Your operating system',
    language: 'Your preferred language',
    screenWidth: 'Display width in pixels',
    screenHeight: 'Display height in pixels',
    colorDepth: 'Color depth for display',
    deviceMemory: 'Amount of RAM detected',
    hardwareConcurrency: 'Number of CPU cores',
    timezone: 'Your timezone location',
    timezoneOffset: 'Timezone offset from UTC',
    touchSupport: 'Touch screen capability',
    maxTouchPoints: 'Number of touch points',
    pixelRatio: 'Display pixel density',
    batteryLevel: 'Current battery percentage',
    batteryCharging: 'Battery charging status',
    canvasFingerprint: 'Unique canvas rendering signature',
    audioFingerprint: 'Unique audio processing signature',
    plugins: 'Installed browser plugins',
    doNotTrack: 'Do Not Track setting',
    cookiesEnabled: 'Cookie support status',
    languages: 'All detected languages',
    connectionType: 'Network connection type',
  };
  return descriptions[key] || key;
};
