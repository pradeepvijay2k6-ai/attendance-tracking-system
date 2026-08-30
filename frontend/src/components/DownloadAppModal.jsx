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
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', marginBottom: '16px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px' }}>App Installed</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              SSN IT Attendance is already installed on your device.
            </p>
            <button onClick={onClose} style={primaryBtn('#059669')}>
              Continue to Dashboard
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
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', marginBottom: '16px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px' }}>Setup Complete</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              {os?.isAndroid || os?.isIOS
                ? 'SSN IT Attendance has been added to your home screen.'
                : 'Your download has started. Open the file to install.'}
            </p>
            <button onClick={onClose} style={primaryBtn('#059669')}>
              Done
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
            { n: '2', text: 'Tap the menu icon (three dots) at top right' },
            { n: '3', text: 'Tap "Install app" or "Add to Home Screen"' },
            { n: '4', text: 'Tap Install to complete setup' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a5f', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8', flexShrink: 0 }}>{n}</div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '4px 0 0', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
          <button onClick={onClose} style={{ ...primaryBtn('#2563eb'), marginTop: '8px' }}>
            Got it
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
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>SSN IT Attendance</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>Institutional Mobile & Desktop App</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', width: '34px', height: '34px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>

        {/* Primary action based on OS */}
        {os?.isIOS && (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              On iPhone/iPad: tap the <strong style={{ color: '#fff' }}>Share</strong> button in Safari, then select <strong style={{ color: '#38bdf8' }}>"Add to Home Screen"</strong>.
            </p>
          </div>
        )}

        {os?.isAndroid && (
          <button onClick={handleInstall} style={primaryBtn('#059669')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Install on Android</span>
          </button>
        )}

        {!os?.isIOS && !os?.isAndroid && os?.file && (
          <button onClick={() => triggerDownload(os.file, os.name)} style={primaryBtn('#2563eb')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download for {os?.name}</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>AVAILABLE PLATFORMS</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Platform grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'macOS', sub: 'Desktop App', file: '/downloads/SSN-Attendance-macOS.zip' },
            { label: 'Windows', sub: 'Desktop App', file: '/downloads/SSN-Attendance-Windows.zip' },
            { label: 'Android', sub: 'PWA Mobile App', action: handleInstall },
            { label: 'iOS', sub: 'Safari Web App', action: () => setStep('guide') },
          ].map(({ label, sub, file, action }) => (
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
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', marginTop: '20px', marginBottom: 0 }}>
          SSN College of Engineering · Department of Information Technology
        </p>
      </div>
    </div>
  );
}
