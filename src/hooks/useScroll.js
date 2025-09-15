import { useRef, useState, useMemo, useEffect, useCallback } from "react";

export function useScroll() {
  const scrollProgress = useRef(0);
  const extraScrollProgress = useRef(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollPhase, setScrollPhase] = useState('normal'); // 'normal' | 'extra' | 'wormhole'
  const [wormholeTriggered, setWormholeTriggered] = useState(false);

  const sections = useMemo(() => ["hero", "about", "technologies", "projects", "contact"], []);

  // Handle page refresh - reset if in wormhole state
  useEffect(() => {
    const savedState = sessionStorage.getItem('scrollState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.wormholeTriggered || state.extraScrollProgress > 0) {
        // Reset to hero section
        scrollProgress.current = 0;
        extraScrollProgress.current = 0;
        setScrollPhase('normal');
        setWormholeTriggered(false);
        sessionStorage.removeItem('scrollState');
      }
    }
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    const state = {
      scrollProgress: scrollProgress.current,
      extraScrollProgress: extraScrollProgress.current,
      scrollPhase,
      wormholeTriggered,
    };
    sessionStorage.setItem('scrollState', JSON.stringify(state));
  }, [scrollPhase, wormholeTriggered]);

  const handleSectionChange = useCallback((sectionIndex) => {
    setCurrentSection(sectionIndex);
  }, []);

  const triggerWormhole = useCallback(() => {
    setWormholeTriggered(true);
    setScrollPhase('wormhole');
  }, []);

  const resetToHero = useCallback(() => {
    scrollProgress.current = 0;
    extraScrollProgress.current = 0;
    setCurrentSection(0);
    setScrollPhase('normal');
    setWormholeTriggered(false);
  }, []);

  // Expose a stable object so effects depending on it don't cascade re-run
  const api = useMemo(() => ({
    scrollProgress,
    extraScrollProgress,
    currentSection,
    sections,
    scrollPhase,
    wormholeTriggered,
    handleSectionChange,
    setScrollPhase,
    triggerWormhole,
    resetToHero,
  }), [currentSection, sections, scrollPhase, wormholeTriggered, handleSectionChange, triggerWormhole, resetToHero]);

  return api;
}
