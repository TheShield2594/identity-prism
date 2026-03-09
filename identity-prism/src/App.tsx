import { useState, useRef, useCallback } from 'react';
import { PrismCanvas } from './components/PrismCanvas';
import { useFingerprint, getDataDescription, type SeedData, type FingerprintData } from './hooks/useFingerprint';
import { Shield, RefreshCw, Download, Info, X, ChevronRight, Cpu, Monitor, Globe, Battery, Eye } from 'lucide-react';

const scanningMessages = [
  'Analyzing user agent signature...',
  'Mapping screen dimensions...',
  'Detecting GPU renderer...',
  'Probing hardware concurrency...',
  'Reading timezone data...',
  'Scanning canvas fingerprint...',
  'Processing audio context...',
  'Collecting battery status...',
  'Evaluating touch capabilities...',
  'Finalizing unique identifier...',
];

const DataItem = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon: any }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
    <div className="p-2 rounded-lg bg-cyan-500/20">
      <Icon className="w-4 h-4 text-cyan-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

const LoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % scanningMessages.length);
    }, 200);
    return () => clearInterval(interval);
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="loading-text text-lg font-mono">{scanningMessages[messageIndex]}</p>
      </div>
      <div className="mt-2 flex gap-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              animation: 'pulse 1s infinite',
              animationDelay: `${i * 0.1}s`,
              opacity: 0.3 + (i % 3) * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const AboutModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative glass-dark rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-pink-500">
          <Eye className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">About Your Digital Fingerprint</h2>
          <p className="text-slate-400">Why your browser is uniquely identifiable</p>
        </div>
      </div>

      <div className="space-y-4 text-slate-300">
        <p>
          Your browser reveals a surprising amount of information about you and your device,
          even without you logging in or accepting cookies. This is called{" "}
          <span className="text-cyan-400 font-semibold">browser fingerprinting</span>.
        </p>

        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-400 mb-2">What we collected:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Browser type, version, and platform</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Screen resolution and pixel density</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Installed fonts and plugins</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Hardware capabilities (CPU cores, RAM)</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Battery status and charging state</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>Timezone and language preferences</span>
            </li>
          </ul>
        </div>

        <p>
          Advertisers and trackers combine these data points to create a unique "fingerprint"
          that can identify you across different websites, even in incognito mode.
          This is why the art piece you see is unique to your browser!
        </p>

        <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
          <h3 className="font-semibold text-pink-400 mb-2">Protect yourself:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-pink-400" />
              <span>Use privacy-focused browsers (Brave, Firefox)</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-pink-400" />
              <span>Enable "Resist Fingerprinting" in browser settings</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-pink-400" />
              <span>Use browser extensions like Privacy Badger</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-pink-400" />
              <span>Disable JavaScript on untrusted sites</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          <span className="font-semibold">Privacy Note:</span> This app runs entirely in your browser.
          No data is sent to any server. Your fingerprint is generated locally and never stored.
        </p>
      </div>
    </div>
  </div>
);

const DataPanel = ({
  fingerprint,
  seedData,
  onClose,
}: {
  fingerprint: FingerprintData;
  seedData: SeedData;
  onClose: () => void;
}) => {
  const getShapeDescription = (shape: SeedData['shape']) => {
    const descriptions: Record<string, string> = {
      sphere: 'Mac / iOS detected - Smooth curves',
      cube: 'Windows detected - Boxy architecture',
      torus: 'Linux detected - Ring-like structure',
      octahedron: 'Gaming platform detected - Sharp geometry',
      icosahedron: 'Mobile device detected - Complex facets',
    };
    return descriptions[shape] || 'Unique geometry';
  };

  return (
    <div className="fixed right-4 top-20 bottom-24 w-80 glass-dark rounded-2xl p-4 overflow-hidden flex flex-col z-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Fingerprint DNA
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30">
          <p className="text-xs text-slate-400 mb-1">Unique Seed</p>
          <p className="text-lg font-mono font-bold text-gradient">{seedData.seed}</p>
        </div>

        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-slate-400 mb-1">Shape Origin</p>
          <p className="text-sm font-medium">{seedData.shape} - {getShapeDescription(seedData.shape)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400">Hue</p>
            <p className="text-sm font-mono">{seedData.colorHue}°</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400">Saturation</p>
            <p className="text-sm font-mono">{seedData.colorSaturation}%</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400">Complexity</p>
            <p className="text-sm font-mono">{(seedData.complexity * 100).toFixed(0)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400">Glow</p>
            <p className="text-sm font-mono">{seedData.glowIntensity.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-xs text-slate-400 mb-2">Detected Data Points</p>
          <div className="space-y-2">
            <DataItem
              label="Platform"
              value={fingerprint.platform}
              icon={Monitor}
            />
            <DataItem
              label="Screen"
              value={`${fingerprint.screenWidth} x ${fingerprint.screenHeight}`}
              icon={Monitor}
            />
            <DataItem
              label="Language"
              value={fingerprint.language}
              icon={Globe}
            />
            <DataItem
              label="CPU Cores"
              value={fingerprint.hardwareConcurrency}
              icon={Cpu}
            />
            <DataItem
              label="Battery"
              value={fingerprint.batteryLevel !== undefined ? `${Math.round(fingerprint.batteryLevel * 100)}%` : 'N/A'}
              icon={Battery}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { fingerprint, seedData, isLoading, regenerate } = useFingerprint();
  const [showAbout, setShowAbout] = useState(false);
  const [showData, setShowData] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `identity-prism-${seedData?.seed || 'art'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [seedData]);

  if (isLoading || !seedData) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.1),transparent_50%)]"></div>

      {/* 3D Canvas */}
      <div ref={canvasRef} className="absolute inset-0 z-10">
        <PrismCanvas seedData={seedData} isLoading={isLoading} />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl glass glow-cyan">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Identity Prism</h1>
            <p className="text-xs text-slate-400">Browser Fingerprint Art</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-slate-300">Local Only</span>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        <button
          onClick={regenerate}
          className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-5 h-5 text-cyan-400" />
          <span className="font-medium">Regenerate</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-5 h-5 text-pink-400" />
          <span className="font-medium">Download</span>
        </button>

        <button
          onClick={() => setShowData(!showData)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl glass transition-all hover:scale-105 active:scale-95 ${showData ? 'bg-cyan-500/20 border-cyan-500/50' : ''}`}
        >
          <Cpu className={`w-5 h-5 ${showData ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="font-medium">DNA</span>
        </button>

        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <Info className="w-5 h-5 text-slate-400" />
          <span className="font-medium">About</span>
        </button>
      </div>

      {/* Data Panel */}
      {showData && fingerprint && seedData && (
        <DataPanel
          fingerprint={fingerprint}
          seedData={seedData}
          onClose={() => setShowData(false)}
        />
      )}

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Footer */}
      <footer className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-xs text-slate-500 glass px-4 py-2 rounded-full">
          Move your mouse to rotate • Scroll to zoom
        </p>
      </footer>
    </div>
  );
}

export default App;
