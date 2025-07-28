"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "../hooks/useScroll";
import { useLenis } from "../hooks/useLenis";
import Overlay from "../components/Overlay";
import NavBar from "../components/NavBar";
import MagneticSocialLinks from "../components/MagneticSocialLinks";
import Scene from "../components/Scene";
import GalaxyWrapper from "../components/GalaxyWrapper";
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
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000,
      display: 'flex',
      gap: '1rem',
      pointerEvents: 'none'
    }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: progress > (index / 3) ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
            boxShadow: progress > (index / 3) ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none'
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
  const [galaxyConfig, setGalaxyConfig] = useState({
    density: 1,
    speed: 1,
    glowIntensity: 0.3,
    rotationSpeed: 0.1,
    autoCenterRepulsion: 0,
  });
  const [wormholeProgress, setWormholeProgress] = useState(0);
  const [showUI, setShowUI] = useState(true);

  // Handle scroll calculations
  const handleScroll = useCallback((e) => {
    const scrollTop = e.scroll;
    const scrollHeight = e.limit;
    
    // Get the overlay element to calculate section heights
    const overlayElement = overlayRef.current;
    if (!overlayElement) return;
    
    // Calculate normal sections height (5 sections * 100vh each)
    const sections = overlayElement.querySelectorAll('.section');
    const normalSections = Array.from(sections).filter(section => !section.classList.contains('extra-section'));
    const normalSectionsHeight = normalSections.length * window.innerHeight;
    
    // Calculate extra section height
    const extraSection = overlayElement.querySelector('.extra-section');
    const extraSectionHeight = extraSection ? extraSection.offsetHeight : 0;
    const extraSectionStart = normalSectionsHeight;
    
    // Debug logging
    console.log('Scroll Debug:', {
      scrollTop: scrollTop.toFixed(0),
      normalSectionsHeight,
      extraSectionHeight,
      totalScrollHeight: scrollHeight
    });
    
    // Calculate progress for normal sections
    if (scrollTop < normalSectionsHeight) {
      const normalProgress = scrollTop / normalSectionsHeight;
      scrollData.scrollProgress.current = normalProgress;
      scrollData.extraScrollProgress.current = 0;
      
      // Update section index
      const sectionIndex = Math.floor(normalProgress * normalSections.length);
      scrollData.handleSectionChange(Math.min(sectionIndex, normalSections.length - 1));
      
      if (scrollData.scrollPhase !== 'normal') {
        scrollData.setScrollPhase('normal');
      }
      
      console.log(`Normal scroll: ${(normalProgress * 100).toFixed(1)}%`);
    } 
    // Calculate progress for extra section
    else if (scrollTop >= extraSectionStart && extraSectionHeight > 0) {
      scrollData.scrollProgress.current = 1; // Normal sections complete
      
      const extraProgress = (scrollTop - extraSectionStart) / extraSectionHeight;
      scrollData.extraScrollProgress.current = Math.min(extraProgress, 1);
      
      if (scrollData.scrollPhase !== 'extra' && !scrollData.wormholeTriggered) {
        scrollData.setScrollPhase('extra');
        console.log('Entered extra section!');
      }
      
      console.log(`Extra section progress: ${(extraProgress * 100).toFixed(1)}%`);
    }
  }, [scrollData]);

  // Initialize Lenis with scroll handler
  const lenisRef = useLenis(handleScroll, scrollContainerRef);


  // Handle charging effect in extra scroll section
  useEffect(() => {
    const checkCharging = () => {
      if (scrollData.scrollPhase === 'extra') {
        const progress = scrollData.extraScrollProgress.current;
        if (progress > 0.8) {
          const chargeAmount = (progress - 0.8) / 0.2;
          console.log('Charging! Progress:', progress.toFixed(2), 'Charge:', chargeAmount.toFixed(2));
          // Update animation values
          setGalaxyConfig({
            density: 1 + (4 * chargeAmount),
            speed: 1 + (9 * chargeAmount),
            glowIntensity: 0.3 + (1.2 * chargeAmount),
            rotationSpeed: 0.1 + (1.9 * chargeAmount),
            autoCenterRepulsion: 0,
          });
        }
      }
    };
    
    // Poll for changes since refs don't trigger effects
    const interval = setInterval(checkCharging, 16); // 60fps
    return () => clearInterval(interval);
  }, [scrollData.scrollPhase]);

  // Handle wormhole animation
  useEffect(() => {
    if (scrollData.scrollPhase === 'wormhole') {
      console.log('Wormhole animation triggered!');
      setShowUI(false);
      
      // Create a proxy object for GSAP to animate
      const animationProxy = { ...galaxyConfig, progress: 0 };
      
      const tl = gsap.timeline({
        onUpdate: () => {
          // Update state with animated values
          setGalaxyConfig({
            density: animationProxy.density,
            speed: animationProxy.speed,
            glowIntensity: animationProxy.glowIntensity,
            rotationSpeed: animationProxy.rotationSpeed,
            autoCenterRepulsion: animationProxy.autoCenterRepulsion,
          });
          setWormholeProgress(animationProxy.progress);
        }
      });
      
      // Animate to wormhole state
      tl.to(animationProxy, {
        duration: 0.5,
        density: 5,
        speed: 10,
        glowIntensity: 1.5,
        rotationSpeed: 2,
        autoCenterRepulsion: 15,
        ease: "power2.inOut"
      })
      .to(animationProxy, {
        duration: 2,
        progress: 1
      })
      .to(animationProxy, {
        duration: 0.1,
        density: 1,
        speed: 1,
        glowIntensity: 0.3,
        rotationSpeed: 0.1,
        autoCenterRepulsion: 0,
        onComplete: () => {
          setShowUI(true);
          setWormholeProgress(0);
          setGalaxyConfig({
            density: 1,
            speed: 1,
            glowIntensity: 0.3,
            rotationSpeed: 0.1,
            autoCenterRepulsion: 0,
          });
          console.log('Wormhole animation complete!');
        }
      });
      
      return () => tl.kill();
    }
  }, [scrollData.scrollPhase, galaxyConfig]);

  return (
    <div className="app">
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: scrollData.scrollPhase === 'wormhole' ? 9999 : 0,
        pointerEvents: 'none'
      }}>
        <GalaxyWrapper config={galaxyConfig} />
      </div>
      
      <Canvas 
        className="canvas" 
        style={{ 
          opacity: showUI ? 1 : 0,
          transition: 'opacity 0.2s ease'
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

      <div style={{ 
        opacity: showUI ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: showUI ? 'auto' : 'none'
      }}>
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
          transition: 'opacity 0.2s ease'
        }}
      />
      
      {scrollData.scrollPhase === 'wormhole' && (
        <WormholeProgress progress={wormholeProgress} />
      )}
    </div>
  );
}
