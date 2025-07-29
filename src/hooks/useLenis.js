"use client";
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

// Global instance tracker to prevent duplicates
let globalLenisInstance = null;

export function useLenis(callback, scrollContainerRef) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // Wait for the scroll container to be available
    if (!scrollContainerRef?.current) return;

    // Clean up any existing global instance
    if (globalLenisInstance) {
      globalLenisInstance.destroy();
      globalLenisInstance = null;
    }

    try {
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
      globalLenisInstance = lenis;

      lenis.on('scroll', callback);

      function raf(time) {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        lenis.off('scroll', callback);
        lenis.destroy();
        lenisRef.current = null;
        if (globalLenisInstance === lenis) {
          globalLenisInstance = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize Lenis:', error);
      return undefined;
    }
  }, [callback, scrollContainerRef]);

  return lenisRef;
}
