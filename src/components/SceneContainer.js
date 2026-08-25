"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
  warpRef,
  wormholeProgress,
}) {
  const searchParams = useSearchParams();
  const isLiteMode = searchParams.get("lite") === "1";
  // Bloom measurably amplifies frame-to-frame shimmer on the rotating
  // surface (frame-diff 8.5 vs 5.2 without); opt-in until that's solved
  const bloomOptIn = searchParams.get("bloom") === "1";
  // Bloom only where it's cheap enough: desktop-class viewport + retina
  const [bloomEnabled, setBloomEnabled] = useState(false);
  useEffect(() => {
    const mem = navigator?.deviceMemory || 8;
    setBloomEnabled(window.innerWidth > 768 && (window.devicePixelRatio || 1) > 1 && mem >= 8);
  }, []);

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
        dpr={[1, 1.5]}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
        }}
        style={{
          // During the wormhole the scene stays up through the charge
          // (camera accelerating, stars streaking) and crossfades into
          // the galaxy warp at peak instead of vanishing at t=0
          opacity:
            scrollPhase === "wormhole"
              ? wormholeProgress < 0.14
                ? 1
                : wormholeProgress < 0.3
                  ? 1 - (wormholeProgress - 0.14) / 0.16
                  : wormholeProgress > 0.96
                    ? (wormholeProgress - 0.96) / 0.04
                    : 0
              : showUI
                ? 1
                : 0,
          transition: "opacity 0.1s linear",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            scrollProgress={scrollData.scrollProgress}
            extraScrollProgress={scrollData.extraScrollProgress}
            scrollPhase={scrollData.scrollPhase}
            warpRef={warpRef}
          />
          {bloomEnabled && bloomOptIn && (
            <EffectComposer>
              <Bloom
                luminanceThreshold={0.82}
                luminanceSmoothing={0.3}
                intensity={0.4}
                mipmapBlur
                radius={0.55}
              />
            </EffectComposer>
          )}
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
