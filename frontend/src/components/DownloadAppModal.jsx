import { useState, useEffect } from 'react';

/** Detect if running as an installed PWA/WebAPK/Electron app */
export function isRunningAsApp() {
  if (typeof window === 'undefined') return false;
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.location.protocol === 'file:' ||
    !!window.desktopApi?.isDesktop
  );
}

export function detectUserOS() {
  if (typeof window === 'undefined') return { name: 'Unknown', type: 'desktop', file: null };
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.userAgentData?.platform || window.navigator.platform || '').toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return { name: 'iOS', type: 'mobile', isIOS: true, file: null };
  if (/android/.test(ua))           return { name: 'Android', type: 'mobile', isAndroid: true, file: null };
  if (/mac|macintosh/.test(ua) || /mac/.test(platform)) return { name: 'macOS', type: 'desktop', file: '/downloads/SSN-Attendance-macOS.zip', ext: '.zip' };
  if (/win|windows/.test(ua) || /win/.test(platform))   return { name: 'Windows', type: 'desktop', file: '/downloads/SSN-Attendance-Windows.zip', ext: '.zip' };
  return { name: 'Desktop', type: 'desktop', file: '/downloads/SSN-Attendance-Windows.zip', ext: '.zip' };
}

export default function DownloadAppModal({ isOpen, onClose }) {
  const [os, setOs] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [step, setStep] = useState('main'); // 'main' | 'guide' | 'success'
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);

  useEffect(() => {
    setOs(detectUserOS());
    setAlreadyInstalled(isRunningAsApp());

    const handlePrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setStep('success');
    } else {
      setStep('guide');
    }
  };

  const triggerDownload = (file, name) => {
    const a = document.createElement('a');
    a.href = file; a.download = file.split('/').pop();
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setStep('success');
  };

  if (!isOpen) return null;

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(10,15,28,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 99999, padding: '0',
  };

  const sheet = {
    background: '#0f172a',
    color: '#f1f5f9',
    borderRadius: '24px 24px 0 0',
    padding: '28px 24px 36px',
    width: '100%', maxWidth: '480px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
    position: 'relative',
    maxHeight: '85vh',
    overflowY: 'auto',
  };

  const primaryBtn = (color = '#2563eb') => ({
    width: '100%', padding: '14px',
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    color: '#fff', border: 'none', borderRadius: '14px',
    fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: `0 4px 16px ${color}55`,
  });

  // ── Already installed view ─────────────────────────────────
  if (alreadyInstalled) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={sheet} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px' }}>App Installed!</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              SSN IT Attendance is already installed on your device. You're all set!
            </p>
            <button onClick={onClose} style={primaryBtn('#059669')}>
              <span>🎉</span> Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success view ───────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={sheet} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px' }}>Done!</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              {os?.isAndroid || os?.isIOS
                ? 'SSN IT Attendance has been added to your home screen.'
                : 'Your download has started. Open the file to install.'}
            </p>
            <button onClick={onClose} style={primaryBtn('#059669')}>
              <span>✓</span> Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Android Chrome guide ───────────────────────────────────
  if (step === 'guide') {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={sheet} onClick={e => e.stopPropagation()}>
          <button onClick={() => setStep('main')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
            ← Back
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 16px' }}>Install via Chrome</h2>
          {[
            { n: '1', text: 'Open this site in Chrome' },
            { n: '2', text: 'Tap the ⋮ menu at the top right' },
            { n: '3', text: 'Tap "Install app" or "Add to Home Screen"' },
            { n: '4', text: 'Tap Install — done! ✓' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a5f', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8', flexShrink: 0 }}>{n}</div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '4px 0 0', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
          <button onClick={onClose} style={{ ...primaryBtn('#2563eb'), marginTop: '8px' }}>
            <span>✓</span> Got it
          </button>
        </div>
      </div>
    );
  }

  // ── Main install sheet ─────────────────────────────────────
  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>

        {/* Handle bar */}
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '-8px auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
            📚
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>SSN IT Attendance</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>Install on this device</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', width: '34px', height: '34px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>

        {/* Primary action based on OS */}
        {os?.isIOS && (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              On iPhone/iPad: tap the <strong style={{ color: '#fff' }}>Share</strong> button <strong style={{ color: '#38bdf8' }}>⎋</strong> in Safari, then tap <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong>.
            </p>
          </div>
        )}

        {os?.isAndroid && (
          <button onClick={handleInstall} style={primaryBtn('#059669')}>
            <span>🤖</span> Install on Android
          </button>
        )}

        {!os?.isIOS && !os?.isAndroid && os?.file && (
          <button onClick={() => triggerDownload(os.file, os.name)} style={primaryBtn('#2563eb')}>
            <span>⬇️</span> Download for {os?.name}
          </button>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '0.72rem', color: '#475569', whiteSpace: 'nowrap' }}>OTHER PLATFORMS</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Platform grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: '🍏', label: 'macOS', sub: 'Desktop App', file: '/downloads/SSN-Attendance-macOS.zip' },
            { icon: '🪟', label: 'Windows', sub: 'Desktop App', file: '/downloads/SSN-Attendance-Windows.zip' },
            { icon: '🤖', label: 'Android', sub: 'Home Screen', action: handleInstall },
            { icon: '🍎', label: 'iOS', sub: 'Add to Home Screen', action: () => setStep('guide') },
          ].map(({ icon, label, sub, file, action }) => (
            <button
              key={label}
              onClick={() => action ? action() : triggerDownload(file, label)}
              style={{
                background: '#1e293b', border: '1px solid #1e3a5f',
                borderRadius: '12px', padding: '12px 14px',
                color: '#f1f5f9', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#334155', marginTop: '20px', marginBottom: 0 }}>
          SSN College of Engineering · IT Department
        </p>
      </div>
    </div>
  );
}
