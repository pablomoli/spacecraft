"use client";
import { useEffect, useRef, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis(callback, scrollContainerRef) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const callbackRef = useRef(callback);
  const isVisibleRef = useRef(true);
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Stable callback that uses the ref
  const stableCallback = useCallback((e) => {
    callbackRef.current(e);
  }, []);

  useEffect(() => {
    // Wait for the scroll container to be available
    if (!scrollContainerRef?.current) return;

    // Clean up any existing instance for this component
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
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

      lenis.on('scroll', stableCallback);

      function raf(time) {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
          rafRef.current = requestAnimationFrame(raf);
        }
      }
      rafRef.current = requestAnimationFrame(raf);

      function handleVisibility() {
        const visible = !document.hidden;
        isVisibleRef.current = visible;
        if (!visible) {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          lenisRef.current?.stop();
        } else {
          lenisRef.current?.start();
          if (!rafRef.current) rafRef.current = requestAnimationFrame(raf);
        }
      }
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (lenisRef.current) {
          lenisRef.current.off('scroll', stableCallback);
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } catch (error) {
      console.error('Failed to initialize Lenis:', error);
      return undefined;
    }
  }, [scrollContainerRef, stableCallback]);

  return lenisRef;
}
