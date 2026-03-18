import { useRef } from 'react';

interface Props {
  onResize: (delta: number) => void;
}

export default function ResizableDivider({ onResize }: Props) {
  const startX = useRef(0);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    isResizing.current = true;

    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(delta);
    };

    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        width: '5px',
        cursor: 'col-resize',
        background: 'var(--border)',
        borderRadius: '3px',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#c8401a')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
    />
  );
}
