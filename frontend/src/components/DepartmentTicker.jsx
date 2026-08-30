import { useState, useEffect } from 'react';
import { getAnnouncementsApi } from '../services/api';

export default function DepartmentTicker({ refreshKey = 0 }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await getAnnouncementsApi();
        if (isMounted) {
          setAnnouncements(res.announcements || []);
        }
      } catch (err) {
        console.warn('Could not load announcements ticker:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [refreshKey]);

  if (loading && announcements.length === 0) {
    return null;
  }

  const items = announcements.length > 0 ? announcements : [
    {
      id: 'default-1',
      title: 'IT Department',
      message: 'Welcome to the SSN IT Attendance & Academic Management Portal.'
    }
  ];

  return (
    <div className="dept-ticker-container">
      <div className="dept-ticker-badge">
        <span className="ticker-icon">📢</span>
        <span className="ticker-label">IT Updates</span>
      </div>
      <div className="dept-ticker-track-wrapper">
        <div className="dept-ticker-track">
          {items.map((item, idx) => (
            <span key={item.id || idx} className="dept-ticker-item">
              <strong>{item.title}:</strong> {item.message}
              {idx < items.length - 1 && <span className="ticker-separator">•</span>}
            </span>
          ))}
          {/* Repeat once for smooth continuous loop */}
          <span className="ticker-separator">•</span>
          {items.map((item, idx) => (
            <span key={`dup-${item.id || idx}`} className="dept-ticker-item">
              <strong>{item.title}:</strong> {item.message}
              {idx < items.length - 1 && <span className="ticker-separator">•</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
