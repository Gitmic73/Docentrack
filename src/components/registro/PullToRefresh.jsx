import { useRef, useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, disabled, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshingRef.current = true;
    setPull(THRESHOLD);
    pullRef.current = THRESHOLD;
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      refreshingRef.current = false;
      setPull(0);
      pullRef.current = 0;
    }
  }, [onRefresh]);

  useEffect(() => {
    function onTouchStart(e) {
      if (disabledRef.current || refreshingRef.current) return;
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      } else {
        pulling.current = false;
      }
    }
    function onTouchMove(e) {
      if (!pulling.current || refreshingRef.current || disabledRef.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        const p = Math.min(dy * 0.5, 100);
        pullRef.current = p;
        setPull(p);
      }
    }
    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullRef.current >= THRESHOLD) {
        handleRefresh();
      } else {
        setPull(0);
        pullRef.current = 0;
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleRefresh]);

  const show = pull > 0 || refreshing;

  return (
    <>
      <div
        className={`flex items-center justify-center overflow-hidden md:hidden ${show ? '' : 'pointer-events-none'}`}
        style={{ height: refreshing ? 50 : pull, transition: pulling.current ? 'none' : 'height 0.2s ease' }}
      >
        <RefreshCw
          size={22}
          className={`text-blu ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / THRESHOLD) }}
        />
      </div>
      {children}
    </>
  );
}