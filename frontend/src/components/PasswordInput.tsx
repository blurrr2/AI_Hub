import { useState } from 'react';

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function PasswordInput({ value, onChange, placeholder = 'Password', style }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:'relative', ...style}}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width:'100%', padding:'10px 40px 10px 12px',
          borderRadius:'8px', border:'1px solid var(--border)',
          background:'var(--surface)', color:'var(--ink)',
          fontSize:'14px', boxSizing:'border-box'
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position:'absolute', right:'10px', top:'50%',
          transform:'translateY(-50%)', border:'none',
          background:'transparent', cursor:'pointer',
          color:'var(--ink3)', fontSize:'16px', padding:'0'
        }}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
