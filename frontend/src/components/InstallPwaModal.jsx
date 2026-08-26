import { useState } from 'react';
import DownloadAppModal, { detectUserOS } from './DownloadAppModal';

export default function InstallPwaModal() {
  const [showModal, setShowModal] = useState(false);
  const userOS = detectUserOS();

  return (
    <>
      {/* Floating Download & Install App Pill */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 999,
          background: 'linear-gradient(135deg, #0284c7, #2563eb)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '30px',
          padding: '8px 16px',
          fontWeight: '800',
          fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span style={{ fontSize: '1rem' }}>📥</span>
        <span>Download App {userOS.ext ? `(${userOS.name})` : ''}</span>
      </button>

      <DownloadAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
