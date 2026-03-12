import { useRef } from 'react';

interface Props {
  onResize: (delta: number) => void;
}

export default function ResizableDivider({ onResize }: Props) {
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;

    const onMove = (e: MouseEvent) => {
      if (isDragging.current) {
        onResize(e.clientX - startX.current);
      }
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches || !e.touches[0]) return;

    isDragging.current = true;
    startX.current = e.touches[0].clientX;

    const onMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches && e.touches[0]) {
        onResize(e.touches[0].clientX - startX.current);
      }
    };

    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        width: '6px',
        cursor: 'col-resize',
        background: 'var(--border)',
        borderRadius: '3px',
        flexShrink: 0,
        transition: 'background 0.2s',
        touchAction: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#c8401a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--border)')}
    />
  );
}
