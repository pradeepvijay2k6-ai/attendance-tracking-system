import { useState, useEffect } from 'react';

export function detectUserOS() {
  if (typeof window === 'undefined') return { name: 'Unknown', type: 'desktop', file: '/downloads/SSN-Attendance-Offline.html' };

  const ua = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.userAgentData?.platform || window.navigator.platform || '').toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return { name: 'iOS', type: 'mobile', isIOS: true, file: null, label: 'iOS Web App' };
  }
  if (/android/.test(ua)) {
    return { name: 'Android', type: 'mobile', file: '/downloads/SSN-Attendance.apk', ext: '.apk', label: 'Android APK' };
  }
  if (/mac|macintosh|macintel/.test(ua) || /mac/.test(platform)) {
    return { name: 'macOS', type: 'desktop', file: '/downloads/SSN-Attendance-macOS.zip', ext: '.dmg / .zip', label: 'macOS Desktop' };
  }
  if (/win|windows/.test(ua) || /win/.test(platform)) {
    return { name: 'Windows', type: 'desktop', file: '/downloads/SSN-Attendance-Windows.zip', ext: '.exe / .zip', label: 'Windows App' };
  }
  if (/linux/.test(ua) || /linux/.test(platform)) {
    return { name: 'Linux', type: 'desktop', file: '/downloads/SSN-Attendance-Offline.html', ext: '.AppImage', label: 'Linux Package' };
  }

  return { name: 'Desktop / Mobile', type: 'desktop', file: '/downloads/SSN-Attendance-Offline.html', ext: '.html', label: 'Portable App' };
}

export default function DownloadAppModal({ isOpen, onClose }) {
  const [detectedOS, setDetectedOS] = useState({ name: 'Detecting...', file: '#' });
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    setDetectedOS(detectUserOS());

    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDownloadSuccess('✓ SSN Attendance installed successfully on your Android device!');
        setTimeout(() => setDownloadSuccess(''), 6000);
      }
      setDeferredPrompt(null);
    } else {
      setShowAndroidGuide(true);
    }
  };

  const triggerDownload = (filePath, osName) => {
    if (!filePath) return;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`✓ Downloading ${osName} package! Check your browser downloads.`);
    setTimeout(() => setDownloadSuccess(''), 6000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          color: '#f8fafc',
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '560px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              📥
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Download SSN Attendance</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Install on your phone or desktop computer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {downloadSuccess && (
          <div style={{
            background: '#064e3b',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '16px',
            border: '1px solid #059669'
          }}>
            {downloadSuccess}
          </div>
        )}

        {/* Primary Auto-Detected OS Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(2,132,199,0.2), rgba(37,99,235,0.25))',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', background: '#38bdf8', color: '#0f172a', fontWeight: '800', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Detected System
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '6px', margin: 0 }}>
                {detectedOS.name} {detectedOS.ext ? `(${detectedOS.ext})` : ''}
              </h3>
            </div>
            <span style={{ fontSize: '2rem' }}>
              {detectedOS.name === 'macOS' ? '🍏' : detectedOS.name === 'Windows' ? '🪟' : detectedOS.name === 'Android' ? '🤖' : detectedOS.name === 'iOS' ? '🍎' : '💻'}
            </span>
          </div>

          {detectedOS.isIOS ? (
            <div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '10px', lineHeight: '1.5' }}>
                On iPhone & iPad, tap the Safari <strong>Share</strong> button (⎋) and select <strong>"Add to Home Screen"</strong> (⊞) for instant installation.
              </p>
            </div>
          ) : detectedOS.name === 'Android' ? (
            <div>
              <button
                onClick={handleAndroidInstall}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                <span>🤖</span> 1-Tap Install App on Android
              </button>

              {showAndroidGuide && (
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>Direct Installation via Chrome:</div>
                  <div>1. Tap the <strong>three dots</strong> menu (⋮) at top right in Chrome.</div>
                  <div>2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
                  <div style={{ color: '#34d399', marginTop: '6px' }}>✓ Installs instantly with official app icon and offline support!</div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => triggerDownload(detectedOS.file, detectedOS.name)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2,132,199,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>⚡</span> Download for {detectedOS.name}
            </button>
          )}
        </div>

        {/* All Available Platforms Grid */}
        <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>
          All Supported Platforms
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* macOS */}
          <button
            onClick={() => triggerDownload('/downloads/SSN-Attendance-macOS.zip', 'macOS App')}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'left',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🍏</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>macOS App</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>SSN Attendance.app</div>
            </div>
          </button>

          {/* Windows */}
          <button
            onClick={() => triggerDownload('/downloads/SSN-Attendance-Windows.zip', 'Windows App')}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'left',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🪟</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Windows App</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>.exe / .vbs Launcher</div>
            </div>
          </button>

          {/* Android Direct Install */}
          <button
            onClick={handleAndroidInstall}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'left',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🤖</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Android App</div>
              <div style={{ fontSize: '0.72rem', color: '#34d399' }}>1-Tap WebAPK</div>
            </div>
          </button>

          {/* Mobile Offline Package */}
          <button
            onClick={() => triggerDownload('/downloads/SSN-Attendance-Mobile.html', 'Mobile Offline App')}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'left',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>📱</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Mobile Offline</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Standalone App</div>
            </div>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.75rem', color: '#64748b' }}>
          SSN College of Engineering • Department of Information Technology
        </div>
      </div>
    </div>
  );
}
