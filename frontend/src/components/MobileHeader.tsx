import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTheme } from '../context/ThemeContext';

export default function MobileHeader() {
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  if (!isMobile) return null;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.username || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <div style={{
        position:'fixed', top:0, left:0, right:0, height:'52px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', background:'var(--surface)',
        borderBottom:'1px solid var(--border)', zIndex:1000,
      }}>
        <span style={{fontFamily:'Inter', fontWeight:800, fontSize:'18px', color:'var(--ink)'}}>
          AI·HUB
        </span>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <button onClick={toggleTheme} style={{
            border:'none', background:'transparent', cursor:'pointer', fontSize:'18px'
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width:'32px', height:'32px', borderRadius:'50%',
              background:'#c8401a', color:'white', display:'flex',
              alignItems:'center', justifyContent:'center',
              fontWeight:700, cursor:'pointer', fontSize:'14px'
            }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {showMenu && (
        <>
          <div onClick={() => setShowMenu(false)} style={{
            position:'fixed', inset:0, zIndex:999
          }} />
          <div style={{
            position:'fixed', top:'56px', right:'12px',
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:'12px', padding:'8px', zIndex:1000,
            minWidth:'160px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{padding:'8px 12px', fontSize:'13px', color:'var(--ink2)'}}>
              {username}
            </div>
            <hr style={{border:'none', borderTop:'1px solid var(--border)', margin:'4px 0'}} />
            <button onClick={() => { navigate('/profile'); setShowMenu(false); }} style={{
              width:'100%', padding:'8px 12px', border:'none',
              background:'transparent', color:'var(--ink)',
              cursor:'pointer', textAlign:'left', fontSize:'13px',
              borderRadius:'8px', fontWeight:500
            }}>
              Profile
            </button>
            <button onClick={handleLogout} style={{
              width:'100%', padding:'8px 12px', border:'none',
              background:'transparent', color:'#c8401a',
              cursor:'pointer', textAlign:'left', fontSize:'13px',
              borderRadius:'8px', fontWeight:600
            }}>
              Logout
            </button>
          </div>
        </>
      )}
    </>
  );
}
