import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeRadialTexture, latLonToVec3 } from "./glow";

const EARTH_RADIUS = 3;
// Sprite sits just off the surface: at 1.0 the sphere clips half of it
const PIN_ALTITUDE = 1.008;

const STYLES = {
  home: { color: "#f2b950", scale: 0.2, pulse: true },
  hackathon: { color: "#7fd4ff", scale: 0.13, pulse: false },
};

function pinTexture(color) {
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`;
  return makeRadialTexture([
    [0.0, "rgba(255, 255, 255, 1)"],
    [0.18, `rgba(${rgb}, 0.95)`],
    [0.3, `rgba(${rgb}, 0.25)`],
    [1.0, `rgba(${rgb}, 0)`],
  ], 64);
}

function Pin({ pin, texture }) {
  const ref = useRef(null);
  const style = STYLES[pin.kind];
  const position = useMemo(
    () => latLonToVec3(pin.lat, pin.lon, EARTH_RADIUS * PIN_ALTITUDE),
    [pin.lat, pin.lon],
  );

  useFrame(({ clock }) => {
    if (!style.pulse || !ref.current) return;
    ref.current.scale.setScalar(style.scale * (1 + 0.18 * Math.sin(clock.elapsedTime * 2.2)));
  });

  return (
    <sprite ref={ref} position={position} scale={style.scale}>
      <spriteMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

// Renders inside Earth's rotating group so pins stay glued to the map
export default function Pins({ pins }) {
  const textures = useMemo(
    () => Object.fromEntries(Object.entries(STYLES).map(([k, s]) => [k, pinTexture(s.color)])),
    [],
  );
  if (!textures.home) return null;
  return pins.map((pin) => <Pin key={pin.id} pin={pin} texture={textures[pin.kind]} />);
}
