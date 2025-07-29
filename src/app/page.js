"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
        display: "flex",
        gap: "1rem",
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            opacity: progress > index / 3 ? 1 : 0.3,
            transition: "opacity 0.3s ease",
            boxShadow:
              progress > index / 3
                ? "0 0 10px rgba(255, 255, 255, 0.8)"
                : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const scrollData = useScroll();
  const overlayRef = useRef(null);
  const scrollContainerRef = useRef(null);
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

  const [galaxyConfig, setGalaxyConfig] = useState(initialGalaxyConfig);
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
      const scrollHeight = e.limit;

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
  useEffect(() => {
    if (scrollData.scrollPhase === "wormhole") {
      setShowUI(false);

      // Create a proxy object for GSAP to animate with all parameters
      const animationProxy = { 
        ...galaxyConfig, 
        progress: 0,
        mouseInteraction: false,
        mouseRepulsion: false,
        twinkleIntensity: 0.3,
        hueShift: 0,
        saturation: 0,
        repulsionStrength: 2,
        starSpeed: 0.5,  // Add initial starSpeed
      };

      const tl = gsap.timeline({
        onUpdate: () => {
          // Update state with all animated values
          setGalaxyConfig({
            density: animationProxy.density,
            speed: animationProxy.speed,
            glowIntensity: animationProxy.glowIntensity,
            rotationSpeed: animationProxy.rotationSpeed,
            autoCenterRepulsion: animationProxy.autoCenterRepulsion,
            mouseInteraction: animationProxy.mouseInteraction,
            mouseRepulsion: animationProxy.mouseRepulsion,
            twinkleIntensity: animationProxy.twinkleIntensity,
            hueShift: animationProxy.hueShift,
            saturation: animationProxy.saturation,
            repulsionStrength: animationProxy.repulsionStrength,
            starSpeed: animationProxy.starSpeed,  // Add starSpeed to config update
          });
          setWormholeProgress(animationProxy.progress);
        },
      });

      // Animate to wormhole state
      tl.to(animationProxy, {
        duration: WORMHOLE_ANIMATION_CONFIG.chargeUp.duration,
        ...WORMHOLE_ANIMATION_CONFIG.chargeUp.settings,
        ease: WORMHOLE_ANIMATION_CONFIG.chargeUp.ease,
      })
        .to(animationProxy, {
          duration: WORMHOLE_ANIMATION_CONFIG.hold.duration,
          progress: WORMHOLE_ANIMATION_CONFIG.hold.progress,
        })
        .to(animationProxy, {
          duration: WORMHOLE_ANIMATION_CONFIG.return.duration,
          ...WORMHOLE_ANIMATION_CONFIG.return.settings,
          onComplete: () => {
            setShowUI(true);
            setWormholeProgress(0);
            setGalaxyConfig(initialGalaxyConfig);
          },
        });

      return () => tl.kill();
    }
  }, [scrollData.scrollPhase, initialGalaxyConfig]);

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
        <GalaxyWrapper config={galaxyConfig} />
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

      {scrollData.scrollPhase === "wormhole" && (
        <WormholeProgress progress={wormholeProgress} />
      )}
    </div>
  );
}
