import { useRef } from 'react';

interface Props {
  onResize: (delta: number) => void;
}

export default function ResizableDivider({ onResize }: Props) {
  const startX = useRef(0);
  const isResizing = useRef(false);

  // Mouse events (desktop)
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

  // Touch events (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isResizing.current = true;
    const onMove = (e: TouchEvent) => {
      if (!isResizing.current) return;
      const delta = e.touches[0].clientX - startX.current;
      startX.current = e.touches[0].clientX;
      onResize(delta);
    };
    const onEnd = () => {
      isResizing.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        width:'6px', cursor:'col-resize', flexShrink:0,
        background:'var(--border)', borderRadius:'3px',
        transition:'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#c8401a')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
    />
  );
}
