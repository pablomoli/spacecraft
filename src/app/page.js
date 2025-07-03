"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "../hooks/useScroll";
import Overlay from "../components/Overlay";
import NavBar from "../components/NavBar";
import SocialLinks from "../components/SocialLinks";
import Scene from "../components/Scene";

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
      <Canvas className="canvas">
        <Suspense fallback={<LoadingFallback />}>
          <Scene scrollProgress={scrollData.scrollProgress} />
        </Suspense>
      </Canvas>

      <NavBar currentSection={scrollData.currentSection} />
      <SocialLinks />

      <Overlay
        scroll={scrollData.scrollProgress}
        onSectionChange={scrollData.handleSectionChange}
      />
    </div>
  );
}
