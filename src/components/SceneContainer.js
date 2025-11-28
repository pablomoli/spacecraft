"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useSearchParams } from "next/navigation";
import WebGLErrorBoundary from "./WebGLErrorBoundary";
import GalaxyWrapper from "./GalaxyWrapper";
import Scene from "./Scene";

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

function StaticFallback() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        zIndex: 0,
      }}
    />
  );
}

function SceneContent({
  galaxyEnabled,
  galaxyRef,
  scrollData,
  initialGalaxyConfig,
  galaxyConfig,
  scrollPhase,
  showUI,
}) {
  const searchParams = useSearchParams();
  const isLiteMode = searchParams.get("lite") === "1";

  if (isLiteMode) {
    return <StaticFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<StaticFallback />}>
      {galaxyEnabled && (
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
      )}

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
    </WebGLErrorBoundary>
  );
}

export default function SceneContainer(props) {
  return (
    <Suspense fallback={<StaticFallback />}>
      <SceneContent {...props} />
    </Suspense>
  );
}
