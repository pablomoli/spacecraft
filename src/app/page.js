"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "../hooks/useScroll";
import { useLenis } from "../hooks/useLenis";
import Overlay from "../components/Overlay";
import NavBar from "../components/NavBar";
import MagneticSocialLinks from "../components/MagneticSocialLinks";
import Scene from "../components/Scene";
import GalaxyWrapper from "../components/GalaxyWrapper";
import { DEFAULT_GALAXY_SETTINGS, WORMHOLE_ANIMATION_CONFIG } from "../components/galaxyConfig";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Simple loading component for Suspense fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

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

  // Cache height measurements
  const heightMeasurements = useRef({
    normalSectionsHeight: 0,
    extraSectionHeight: 0,
    extraSectionStart: 0,
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

    const extraSectionHeight = extraSection ? extraSection.offsetHeight : 0;
    const extraSectionStart = actualNormalSectionsHeight;

    // Cache measurements
    heightMeasurements.current = {
      normalSectionsHeight: actualNormalSectionsHeight,
      extraSectionHeight,
      extraSectionStart,
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

  // Handle scroll calculations with throttling
  const handleScroll = useCallback(
    (e) => {
      // Throttle to 60fps max
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 16);
      const scrollTop = e.scroll;

      // Ensure heights are measured
      if (!heightMeasurements.current.isInitialized) {
        if (!measureHeights()) return;
      }

      const { normalSectionsHeight, extraSectionHeight, extraSectionStart } =
        heightMeasurements.current;

      // Debug logging (only when entering/exiting sections)
      // Removed frequent logging to reduce console noise

      // Calculate progress for normal sections
      if (scrollTop < extraSectionStart) {
        const normalProgress = Math.min(scrollTop / normalSectionsHeight, 1);
        scrollData.scrollProgress.current = normalProgress;
        scrollData.extraScrollProgress.current = 0;

        // Calculate section index more efficiently
        // Assuming 5 sections before extra section, each 200vh
        const sectionHeight = window.innerHeight * 2; // 200vh per section
        const currentSectionIndex = Math.min(
          Math.floor(scrollTop / sectionHeight),
          4,
        ); // 0-4 for 5 sections
        scrollData.handleSectionChange(currentSectionIndex);

        if (scrollData.scrollPhase !== "normal") {
          scrollData.setScrollPhase("normal");
        }
      }
      // Calculate progress for extra section
      else if (scrollTop >= extraSectionStart && extraSectionHeight > 0) {
        scrollData.scrollProgress.current = 1; // Normal sections complete

        const extraProgress = Math.min(
          (scrollTop - extraSectionStart) / extraSectionHeight,
          1,
        );
        scrollData.extraScrollProgress.current = extraProgress;

        if (
          scrollData.scrollPhase !== "extra" &&
          !scrollData.wormholeTriggered
        ) {
          scrollData.setScrollPhase("extra");
        }
      }
    },
    [scrollData, measureHeights],
  );

  // Initialize Lenis with scroll handler
  const lenisRef = useLenis(handleScroll, scrollContainerRef);

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
          // Update progress for timer display
          const progress = tl.progress();
          const roundedProgress = Math.round(progress * 100) / 100;
          setWormholeProgress(roundedProgress);

          // Drive only the shader progress; shader blends visuals internally
          if (galaxyRef.current) {
            galaxyRef.current.updateUniforms({ warpProgress: progress });
          }
        },
        onComplete: () => {
          // Cleanup on natural completion
          setShowUI(true);
          setWormholeProgress(0);
          // Ensure shader progress is fully reset
          if (galaxyRef.current) {
            galaxyRef.current.updateUniforms({ warpProgress: 0 });
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
            galaxyRef.current.updateUniforms({ warpProgress: 0 });
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
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: scrollData.scrollPhase === "wormhole" ? 9999 : 0,
          pointerEvents: "none",
        }}
      >
        <GalaxyWrapper
          ref={galaxyRef}
          config={scrollPhase === "wormhole" ? initialGalaxyConfig : galaxyConfig}
        />
      </div>

      <Canvas
        className="canvas"
        style={{
          opacity: showUI ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            scrollProgress={scrollData.scrollProgress}
            extraScrollProgress={scrollData.extraScrollProgress}
            scrollPhase={scrollData.scrollPhase}
          />
        </Suspense>
      </Canvas>

      <div
        style={{
          opacity: showUI ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: showUI ? "auto" : "none",
        }}
      >
        <NavBar currentSection={scrollData.currentSection} />
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
        }}
      />

      {(scrollData.scrollPhase === "wormhole" || wormholeProgress > 0) && (
        <WormholeProgress progress={wormholeProgress} />
      )}

    </div>
  );
}
