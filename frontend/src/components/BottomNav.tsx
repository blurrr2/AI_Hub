import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  const tabs = [
    { path: '/dashboard', label: 'Home', icon: '⊞' },
    { path: '/news', label: 'News', icon: '📰' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/journal', label: 'Journal', icon: '✏️' },
    { path: '/community', label: 'Community', icon: '👥' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex', background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(tab => (
        <button key={tab.path} onClick={() => navigate(tab.path)}
          style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
            background: 'transparent', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
            color: location.pathname === tab.path ? '#c8401a' : 'var(--ink3)',
          }}>
          <span style={{fontSize: '20px'}}>{tab.icon}</span>
          <span style={{fontSize: '10px', fontFamily: 'Inter'}}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
