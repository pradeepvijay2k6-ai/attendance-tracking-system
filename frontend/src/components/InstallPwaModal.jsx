import React, { useState, useEffect } from 'react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(inStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOSDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Install App Pill */}
      <button
        onClick={handleInstallClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 999,
          background: 'linear-gradient(135deg, #0284c7, #2563eb)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '30px',
          padding: '8px 16px',
          fontWeight: '700',
          fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span style={{ fontSize: '1rem' }}>📱</span> Install App
      </button>

      {/* iOS / Browser Install Instructions Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/icons/icon-192.svg" alt="App Icon" style={{ width: '38px', height: '38px', borderRadius: '8px' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>Install SSN Attendance</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Fast, offline-ready mobile app</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>To install on your <strong>iPhone / iPad</strong>:</p>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                  1. Tap the <strong>Share</strong> icon (⎋ with arrow) in Safari.
                </div>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
                  2. Scroll down and tap <strong>"Add to Home Screen"</strong> (⊞).
                </div>
                <p style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                  ✓ Opens fullscreen with instant launch and no browser bars!
                </p>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>To install on your <strong>Android / Desktop</strong>:</p>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                  1. Tap the <strong>three dots menu</strong> (⋮) in Chrome.
                </div>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
                  2. Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
