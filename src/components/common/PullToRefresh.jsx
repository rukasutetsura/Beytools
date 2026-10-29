import { useRef, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const getScrollTop = () => {
    const main = document.querySelector('main');
    return main ? main.scrollTop : window.scrollY;
  };

  const handleTouchStart = useCallback((e) => {
    if (getScrollTop() <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && getScrollTop() <= 0) {
      const distance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(distance);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try { await onRefresh(); } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh, refreshing]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: refreshing ? 'none' : 'auto' }}
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance > 0 || refreshing ? pullDistance : 0,
          transition: pulling.current ? 'none' : 'height 0.2s ease',
        }}
      >
        {refreshing ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <RefreshCw
            className="w-5 h-5 text-muted-foreground"
            style={{ transform: `rotate(${progress * 360}deg)` }}
          />
        )}
      </div>
      {children}
    </div>
  );
}