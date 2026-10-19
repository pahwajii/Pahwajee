import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const previous = useRef(null);
  useLayoutEffect(() => {
    const last = previous.current;
    previous.current = { pathname, hash };
    if (!hash) {
      if (last?.pathname !== pathname || last?.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    let frame;
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
      return true;
    };
    // Lazy routes mount after the router updates. Observe until their anchor exists.
    if (scrollToTarget()) return () => cancelAnimationFrame(frame);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const observer = new MutationObserver(() => { if (scrollToTarget()) observer.disconnect(); });
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    const timeout = setTimeout(() => observer.disconnect(), 10000);
    return () => { observer.disconnect(); clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [pathname, hash, key]);
  return null;
}
