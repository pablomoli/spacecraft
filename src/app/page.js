"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "../hooks/useScroll";
import Overlay from "../components/Overlay";
import NavBar from "../components/NavBar";
import SocialLinks from "../components/SocialLinks";
import Scene from "../components/Scene";

export default function Home() {
  const scrollData = useScroll();

  return (
    <div className="app">
      <Canvas className="canvas">
        <Scene scrollProgress={scrollData.scrollProgress} />
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
