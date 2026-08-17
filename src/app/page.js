"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from "react";
import { useScroll } from "../hooks/useScroll";
import { useLenis } from "../hooks/useLenis";
import Overlay from "../components/Overlay";
import NavBar from "../components/NavBar";
import MagneticSocialLinks from "../components/MagneticSocialLinks";
import SceneContainer from "../components/SceneContainer";
import { DEFAULT_GALAXY_SETTINGS, WORMHOLE_ANIMATION_CONFIG } from "../components/galaxyConfig";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Wormhole progress indicator component
function WormholeProgress({ progress }) {
  // Calculate which phase we're in based on the animation timeline
  // Total duration: 0.5 + 2 + 0.1 = 2.6s
  const totalDuration = 2.6;
  const currentTime = progress * totalDuration;

  // Calculate countdown timer
  const timeRemaining = Math.max(0, totalDuration - currentTime);
  const seconds = Math.floor(timeRemaining);
  const milliseconds = Math.floor((timeRemaining % 1) * 100);

  // Determine phase for visual feedback
  const getPhase = () => {
    if (progress < 0.192) return 'charging';
    if (progress < 0.962) return 'warping';
    return 'returning';
  };

  const phase = getPhase();

  return (
    <>
      {/* Top-right corner timer */}
      <div
        style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          zIndex: 999999,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.5rem",
        }}
      >
        {/* Timer display */}
        <div
          style={{
            fontSize: "2.5rem",
            fontFamily: "monospace",
            fontWeight: "bold",
            color: phase === 'charging' ? "#00aaff" :
                   phase === 'warping' ? "#ff00ff" : "#00ff00",
            textShadow: "0 0 30px currentColor, 0 0 10px currentColor",
            transition: "color 0.3s ease",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
          }}
        >
          {seconds}.{milliseconds.toString().padStart(2, '0')}
        </div>

        {/* Phase indicator text */}
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: 300,
          }}
        >
          {phase === 'charging' ? 'Charging Wormhole' :
           phase === 'warping' ? 'Warping Through Space' :
           'Returning Home'}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "6px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          zIndex: 999999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: phase === 'charging' ? "#00aaff" :
                           phase === 'warping' ? "#ff00ff" : "#00ff00",
            boxShadow: "0 0 10px currentColor",
            transition: "width 0.1s linear, background-color 0.3s ease",
          }}
        />
      </div>

      {/* Optional: Circular progress indicator (bottom-right) */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "60px",
          height: "60px",
          zIndex: 999999,
          pointerEvents: "none",
        }}
      >
        <svg
          width="60"
          height="60"
          style={{
            transform: "rotate(-90deg)",
          }}
        >
          {/* Background circle */}
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="none"
            stroke={phase === 'charging' ? "#00aaff" :
                   phase === 'warping' ? "#ff00ff" : "#00ff00"}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
            style={{
              transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
              filter: "drop-shadow(0 0 5px currentColor)",
            }}
          />
        </svg>
      </div>
    </>
  );
}

// Galaxy config reducer for batched updates
const galaxyConfigReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_ALL':
      return { ...state, ...action.payload };
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
};

// Snap thresholds (hoisted outside component to avoid re-creation per render)
const SNAP_VELOCITY_THRESHOLD = 0.5;
const SNAP_DEBOUNCE_MS = 100;

export default function Home() {
  const scrollData = useScroll();
  const overlayRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const wormholeTimelineRef = useRef(null);
  const animationProxyRef = useRef(null);
  const galaxyRef = useRef(null);
  
  const initialGalaxyConfig = useMemo(
    () => ({
      density: DEFAULT_GALAXY_SETTINGS.density,
      speed: DEFAULT_GALAXY_SETTINGS.speed,
      starSpeed: DEFAULT_GALAXY_SETTINGS.starSpeed,
      glowIntensity: DEFAULT_GALAXY_SETTINGS.glowIntensity,
      rotationSpeed: DEFAULT_GALAXY_SETTINGS.rotationSpeed,
      autoCenterRepulsion: DEFAULT_GALAXY_SETTINGS.autoCenterRepulsion,
      mouseInteraction: DEFAULT_GALAXY_SETTINGS.mouseInteraction,
      mouseRepulsion: DEFAULT_GALAXY_SETTINGS.mouseRepulsion,
      twinkleIntensity: DEFAULT_GALAXY_SETTINGS.twinkleIntensity,
      hueShift: DEFAULT_GALAXY_SETTINGS.hueShift,
      saturation: DEFAULT_GALAXY_SETTINGS.saturation,
      repulsionStrength: DEFAULT_GALAXY_SETTINGS.repulsionStrength,
    }),
    [],
  );

  const [galaxyConfig, dispatchGalaxyConfig] = useReducer(
    galaxyConfigReducer,
    initialGalaxyConfig
  );
  const [wormholeProgress, setWormholeProgress] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [galaxyEnabled, setGalaxyEnabled] = useState(true);

  // Allow disabling galaxy via env or query param (?nogalaxy=1) for perf testing
  useEffect(() => {
    const envDisabled = process.env.NEXT_PUBLIC_DISABLE_GALAXY === "true";
    const paramDisabled =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("nogalaxy");
    setGalaxyEnabled(!(envDisabled || paramDisabled));
  }, []);

  // Cache height measurements
  const heightMeasurements = useRef({
    normalSectionsHeight: 0,
    extraSectionHeight: 0,
    extraSectionStart: 0,
    sectionOffsets: [],
    isInitialized: false,
  });

  // Function to measure and cache heights
  const measureHeights = useCallback(() => {
    const overlayElement = overlayRef.current;
    if (!overlayElement) return false;

    // Get all sections excluding extra section
    const allSections = overlayElement.querySelectorAll(".section");
    const normalSections = Array.from(allSections).filter(
      (section) => !section.classList.contains("extra-section"),
    );
    const extraSection = overlayElement.querySelector(".extra-section");

    // Calculate actual height of normal sections by measuring DOM
    let actualNormalSectionsHeight = 0;
    const sectionHeights = [];

    normalSections.forEach((section, index) => {
      const height = section.offsetHeight;
      sectionHeights.push({ index, id: section.id, height });
      actualNormalSectionsHeight += height;
    });

    // Build cumulative section offsets for snap targets
    const offsets = [];
    let cumulativeOffset = 0;
    sectionHeights.forEach(({ height }) => {
      offsets.push(cumulativeOffset);
      cumulativeOffset += height;
    });

    const extraSectionHeight = extraSection ? extraSection.offsetHeight : 0;
    const extraSectionStart = actualNormalSectionsHeight;

    // Experiments rail interior: section snap must not fight the
    // horizontal scrub, so record its span for suppression
    const expIndex = sectionHeights.findIndex((s) => s.id === "experiments");
    const expStart = expIndex >= 0 ? offsets[expIndex] : -1;
    const expEnd = expIndex >= 0 ? expStart + sectionHeights[expIndex].height : -1;

    // Cache measurements
    heightMeasurements.current = {
      normalSectionsHeight: actualNormalSectionsHeight,
      extraSectionHeight,
      extraSectionStart,
      sectionOffsets: offsets,
      expStart,
      expEnd,
      isInitialized: true,
    };

    console.log("Height measurements updated:", {
      normalSections: normalSections.length,
      sectionHeights,
      actualNormalSectionsHeight,
      expectedHeight: normalSections.length * window.innerHeight * 2, // Sections are 200vh each
      extraSectionHeight,
      extraSectionStart,
      totalHeight: actualNormalSectionsHeight + extraSectionHeight,
      windowHeight: window.innerHeight,
    });

    return true;
  }, []);

  // Measure heights when overlay is ready
  useEffect(() => {
    if (overlayRef.current && !heightMeasurements.current.isInitialized) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        measureHeights();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [measureHeights]);

  // Recalculate heights on window resize
  useEffect(() => {
    const handleResize = () => {
      if (heightMeasurements.current.isInitialized) {
        measureHeights();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureHeights]);

  // Throttle helper
  const throttleRef = useRef(null);

  // Snap state refs
  const snapTimeoutRef = useRef(null);
  const isSnappingRef = useRef(false);

  // Snap to nearest section when scroll velocity drops
  const snapToSection = useCallback((scrollTop) => {
    if (isSnappingRef.current) return;
    if (!heightMeasurements.current.isInitialized) return;

    const { sectionOffsets, extraSectionStart, expStart, expEnd } =
      heightMeasurements.current;
    if (sectionOffsets.length === 0) return;

    // Skip snap if in extra section territory (wormhole zone)
    if (scrollTop >= extraSectionStart - 100) return;

    // Skip snap inside the experiments rail interior: the vertical
    // position IS the horizontal scrub position; snapping would yank
    // the user across cards
    if (
      expStart >= 0 &&
      scrollTop > expStart + window.innerHeight * 0.5 &&
      scrollTop < expEnd - window.innerHeight * 1.5
    ) {
      return;
    }

    // Find nearest section offset
    let nearestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < sectionOffsets.length; i++) {
      const distance = Math.abs(scrollTop - sectionOffsets[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    const targetOffset = sectionOffsets[nearestIndex];

    // Only snap if we are not already very close to the target
    if (Math.abs(scrollTop - targetOffset) < 5) return;

    isSnappingRef.current = true;

    lenisRef.current?.scrollTo(targetOffset, {
      duration: 2.0,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => {
        isSnappingRef.current = false;
      },
    });
  }, []);

  // Handle scroll calculations with throttling
  const handleScroll = useCallback(
    (e) => {
      // Throttle to 60fps max
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 16);
      const scrollTop = e.scroll;

      // Skip snap detection while a snap animation is in progress
      // (Lenis emits scroll events during scrollTo, which would cascade)
      if (!isSnappingRef.current) {
        const velocity = e.velocity || 0;

        // Snap detection: when velocity drops below threshold, trigger snap
        if (Math.abs(velocity) < SNAP_VELOCITY_THRESHOLD && Math.abs(velocity) > 0.01) {
          if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
          snapTimeoutRef.current = setTimeout(() => {
            const currentScroll = lenisRef.current?.scroll ?? scrollTop;
            snapToSection(currentScroll);
          }, SNAP_DEBOUNCE_MS);
        } else if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
          // User is actively scrolling, cancel any pending snap
          if (snapTimeoutRef.current) {
            clearTimeout(snapTimeoutRef.current);
            snapTimeoutRef.current = null;
          }
        }
      }

      // Ensure heights are measured
      if (!heightMeasurements.current.isInitialized) {
        if (!measureHeights()) return;
      }

      const { normalSectionsHeight, extraSectionHeight, extraSectionStart } =
        heightMeasurements.current;

      // Debug logging
      // if (isDev && scrollTop >= extraSectionStart - 100) {
      //   console.log('[Page.js] Scroll near extra section - scrollTop:', scrollTop, 'extraSectionStart:', extraSectionStart, 'extraSectionHeight:', extraSectionHeight);
      // }

      // Calculate progress for normal sections
      // Use a small threshold to account for smooth scrolling rounding
      const scrollThreshold = 50;
      if (scrollTop < extraSectionStart - scrollThreshold) {
        const normalProgress = Math.min(scrollTop / normalSectionsHeight, 1);
        scrollData.scrollProgress.current = normalProgress;
        scrollData.extraScrollProgress.current = 0;

        // Section index from measured offsets (sections are no longer
        // uniform height: the experiments rail is 500vh)
        const { sectionOffsets } = heightMeasurements.current;
        let currentSectionIndex = 0;
        for (let i = 0; i < sectionOffsets.length; i++) {
          if (scrollTop >= sectionOffsets[i] - window.innerHeight * 0.5) {
            currentSectionIndex = i;
          }
        }
        scrollData.handleSectionChange(currentSectionIndex);

        if (scrollData.scrollPhase !== "normal") {
          scrollData.setScrollPhase("normal");
        }
      }
      // Calculate progress for extra section
      else if (scrollTop >= extraSectionStart - scrollThreshold && extraSectionHeight > 0) {
        scrollData.scrollProgress.current = 1; // Normal sections complete

        // Calculate progress accounting for the threshold
        const adjustedScrollInExtra = scrollTop - (extraSectionStart - scrollThreshold);
        const adjustedExtraHeight = extraSectionHeight + scrollThreshold;
        const extraProgress = Math.min(
          adjustedScrollInExtra / adjustedExtraHeight,
          1,
        );
        scrollData.extraScrollProgress.current = extraProgress;

        // Debug logging
        // if (isDev) {
        //   console.log('[Page.js] Extra section - scrollTop:', scrollTop, 'extraSectionStart:', extraSectionStart, 'extraProgress:', extraProgress);
        // }

        if (
          scrollData.scrollPhase !== "extra" &&
          !scrollData.wormholeTriggered
        ) {
          scrollData.setScrollPhase("extra");
        }
      }
    },
    [scrollData, measureHeights, snapToSection],
  );

  // Initialize Lenis with scroll handler
  const lenisRef = useLenis(handleScroll, scrollContainerRef);

  // Clean up snap timeout on unmount
  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, []);

  // Handle charging effect in extra scroll section - removed for performance
  // This was causing lag by updating state 60 times per second

  // Handle wormhole animation
  const scrollPhase = scrollData.scrollPhase;
  const resetToHero = scrollData.resetToHero;

  useGSAP(() => {
    if (scrollPhase === "wormhole") {
      // Kill any existing timeline
      if (wormholeTimelineRef.current) {
        wormholeTimelineRef.current.kill();
        wormholeTimelineRef.current = null;
      }

      setShowUI(false);

      // Capture refs for cleanup
      const lenis = lenisRef.current;
      const scrollContainer = scrollContainerRef.current;

      // Create animation proxy with initial values
      animationProxyRef.current = { 
        ...initialGalaxyConfig, 
        progress: 0,
        mouseInteraction: false,
        mouseRepulsion: false,
        twinkleIntensity: 0.3,
        hueShift: 0,
        saturation: 0,
        repulsionStrength: 2,
        starSpeed: 0.5,
      };

      const tl = gsap.timeline({
        onUpdate: () => {
          // Timeline progress drives UI; shader uses logical warp progress (0->1->0)
          const timelineProgress = tl.progress();
          setWormholeProgress(Math.round(timelineProgress * 100) / 100);
          const warp = animationProxyRef.current?.progress ?? 0;

          // Compute exit progress during the return segment only
          const charge = WORMHOLE_ANIMATION_CONFIG.chargeUp.duration;
          const hold = WORMHOLE_ANIMATION_CONFIG.hold.duration;
          const ret = WORMHOLE_ANIMATION_CONFIG.return.duration;
          const tNow = tl.time();
          let exitP = 0;
          if (tNow > charge + hold) {
            exitP = Math.min(1, (tNow - (charge + hold)) / ret);
          }

          if (galaxyRef.current) {
            galaxyRef.current.updateUniforms({ warpProgress: warp, exitProgress: exitP });
          }
        },
        onComplete: () => {
          // Cleanup on natural completion
          setShowUI(true);
          setWormholeProgress(0);
          // Ensure shader progress is fully reset
          if (galaxyRef.current) {
            galaxyRef.current.updateUniforms({ warpProgress: 0, exitProgress: 0 });
          }
          // Reset animation proxy
          animationProxyRef.current = { ...initialGalaxyConfig };

          // Reset scroll data + force scroll to very top
          resetToHero();

          // Force immediate scroll reset before starting Lenis
          if (scrollContainer) {
            scrollContainer.scrollTop = 0;
            scrollContainer.scrollLeft = 0;
          }
          window.scrollTo(0, 0);

          // Now restart Lenis at the top
          if (lenis) {
            lenis.stop();
            lenis.scrollTo(0, { immediate: true, force: true });
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              lenis.start();
              lenis.scrollTo(0, { immediate: true, force: true });
            }, 50);
          }

          wormholeTimelineRef.current = null;
        },
        onInterrupt: () => {
          // Handle interrupted animation
          setShowUI(true);
          setWormholeProgress(0);
          // Ensure shader progress is fully reset
          if (galaxyRef.current) {
            galaxyRef.current.updateUniforms({ warpProgress: 0, exitProgress: 0 });
          }
          // Reset animation proxy
          animationProxyRef.current = { ...initialGalaxyConfig };

          // Reset scroll data + force scroll to very top
          resetToHero();

          // Force immediate scroll reset before starting Lenis
          if (scrollContainer) {
            scrollContainer.scrollTop = 0;
            scrollContainer.scrollLeft = 0;
          }
          window.scrollTo(0, 0);

          // Now restart Lenis at the top
          if (lenis) {
            lenis.stop();
            lenis.scrollTo(0, { immediate: true, force: true });
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              lenis.start();
              lenis.scrollTo(0, { immediate: true, force: true });
            }, 50);
          }

          wormholeTimelineRef.current = null;
        }
      });

      wormholeTimelineRef.current = tl;

      // Animate progress only; visuals derive in shader via uWarpProgress
      tl.to(animationProxyRef.current, {
        duration: WORMHOLE_ANIMATION_CONFIG.chargeUp.duration,
        progress: 1,
        ease: WORMHOLE_ANIMATION_CONFIG.chargeUp.ease,
      })
      .to(animationProxyRef.current, {
        duration: WORMHOLE_ANIMATION_CONFIG.hold.duration,
        progress: WORMHOLE_ANIMATION_CONFIG.hold.progress,
      })
      .to(animationProxyRef.current, {
        duration: WORMHOLE_ANIMATION_CONFIG.return.duration,
        progress: 0,
      });

      return () => {
        // Only kill timeline if scrollPhase is changing away from wormhole
        // This prevents killing the animation on unrelated re-renders
        if (wormholeTimelineRef.current && scrollPhase !== "wormhole") {
          wormholeTimelineRef.current.kill();
          // Ensure UI is restored if animation was interrupted
          setShowUI(true);
          setWormholeProgress(0);
          // Reset animation proxy
          animationProxyRef.current = { ...initialGalaxyConfig };
          
          // Reset scroll data + force scroll to very top
          resetToHero();

          // Force immediate scroll reset before starting Lenis
          if (scrollContainer) {
            scrollContainer.scrollTop = 0;
            scrollContainer.scrollLeft = 0;
          }
          window.scrollTo(0, 0);

          // Now restart Lenis at the top
          if (lenis) {
            lenis.stop();
            lenis.scrollTo(0, { immediate: true, force: true });
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              lenis.start();
              lenis.scrollTo(0, { immediate: true, force: true });
            }, 50);
          }
          
          wormholeTimelineRef.current = null;
        }
      };
    }
  }, { dependencies: [scrollPhase] });

  return (
    <div className="app">
      <SceneContainer
        galaxyEnabled={galaxyEnabled}
        galaxyRef={galaxyRef}
        scrollData={scrollData}
        initialGalaxyConfig={initialGalaxyConfig}
        galaxyConfig={galaxyConfig}
        scrollPhase={scrollPhase}
        showUI={showUI}
        warpRef={animationProxyRef}
        wormholeProgress={wormholeProgress}
      />

      <div
        style={{
          opacity: showUI ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: showUI ? "auto" : "none",
          position: "relative",
          zIndex: 100,
        }}
      >
        <NavBar
          currentSection={scrollData.currentSection}
          onNavigate={(sectionId) => {
            const el = document.getElementById(sectionId);
            if (!el) return;
            lenisRef.current?.scrollTo(el.offsetTop, {
              duration: 1.4,
              easing: (t) => 1 - Math.pow(1 - t, 4),
            });
          }}
        />
        <MagneticSocialLinks />
      </div>

      <Overlay
        ref={overlayRef}
        scrollContainerRef={scrollContainerRef}
        scrollData={scrollData}
        lenisRef={lenisRef}
        style={{
          opacity: showUI ? 1 : 0,
          transition: "opacity 0.2s ease",
          position: "relative",
          zIndex: 10,
        }}
      />

      {(scrollData.scrollPhase === "wormhole" || wormholeProgress > 0) && (
        <WormholeProgress progress={wormholeProgress} />
      )}

    </div>
  );
}
