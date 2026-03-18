import { useRef, useEffect } from 'react';

interface Props {
  onResize: (delta: number) => void;
}

export default function ResizableDivider({ onResize }: Props) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isResizing = useRef(false);

  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider) return;

    // Touch events - must be added via addEventListener with passive: false
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // prevents page scroll while dragging
      startX.current = e.touches[0].clientX;
      isResizing.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isResizing.current) return;
      const delta = e.touches[0].clientX - startX.current;
      startX.current = e.touches[0].clientX;
      onResize(delta);
    };

    const handleTouchEnd = () => {
      isResizing.current = false;
    };

    divider.addEventListener('touchstart', handleTouchStart, { passive: false });
    divider.addEventListener('touchmove', handleTouchMove, { passive: false });
    divider.addEventListener('touchend', handleTouchEnd);

    return () => {
      divider.removeEventListener('touchstart', handleTouchStart);
      divider.removeEventListener('touchmove', handleTouchMove);
      divider.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onResize]);

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

  return (
    <div
      ref={dividerRef}
      onMouseDown={handleMouseDown}
      style={{
        width: '8px',
        cursor: 'col-resize',
        flexShrink: 0,
        background: 'var(--border)',
        borderRadius: '4px',
        transition: 'background 0.2s',
        touchAction: 'none', // critical for mobile touch
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#c8401a')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
    />
  );
}
