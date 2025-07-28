"use client";
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis(callback, scrollContainerRef) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Wait for the scroll container to be available
    if (!scrollContainerRef?.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', callback);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [callback, scrollContainerRef]);

  return lenisRef;
}
