import { useIsMobile } from '../hooks/useIsMobile';
import { useTheme } from '../context/ThemeContext';

export default function MobileHeader() {
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '52px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)', zIndex: 1000,
    }}>
      <span style={{fontFamily:'Inter', fontWeight:800, fontSize:'18px', color:'var(--ink)'}}>
        AI·HUB
      </span>
      <button onClick={toggleTheme} style={{
        border: 'none', background: 'transparent', cursor: 'pointer',
        fontSize: '20px', color: 'var(--ink)'
      }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
