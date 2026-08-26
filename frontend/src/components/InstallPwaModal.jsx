import { useState, useEffect } from 'react';
import DownloadAppModal, { isRunningAsApp } from './DownloadAppModal';

export default function InstallPwaModal() {
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as installed app (PWA/WebAPK/Electron)
    setIsInstalled(isRunningAsApp());
  }, []);

  // Already installed — show nothing
  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'linear-gradient(135deg, #0284c7, #2563eb)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '30px',
          padding: '10px 20px',
          fontWeight: '700',
          fontSize: '0.82rem',
          boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span>📲</span>
        <span>Install App</span>
      </button>

      <DownloadAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
