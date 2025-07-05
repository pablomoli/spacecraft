"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "../hooks/useScroll";
import Overlay from "../components/Overlay";
import MagneticNavBar from "../components/MagneticNavBar";
import MagneticSocialLinks from "../components/MagneticSocialLinks";
import Scene from "../components/Scene";
import StarField from "../components/StarField";

// Simple loading component for Suspense fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

export default function Home() {
  const scrollData = useScroll();

  return (
    <div className="app">
      <StarField count={200} />
      <Canvas className="canvas">
        <Suspense fallback={<LoadingFallback />}>
          <Scene scrollProgress={scrollData.scrollProgress} />
        </Suspense>
      </Canvas>

      <MagneticNavBar currentSection={scrollData.currentSection} />
      <MagneticSocialLinks />

      <Overlay
        scroll={scrollData.scrollProgress}
        onSectionChange={scrollData.handleSectionChange}
      />
    </div>
  );
}
