import { useRef, useState, useMemo, useEffect } from "react";

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

  const handleSectionChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
  };

  const triggerWormhole = () => {
    setWormholeTriggered(true);
    setScrollPhase('wormhole');
  };

  const resetToHero = () => {
    scrollProgress.current = 0;
    extraScrollProgress.current = 0;
    setCurrentSection(0);
    setScrollPhase('normal');
    setWormholeTriggered(false);
  };

  return {
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
  };
}
