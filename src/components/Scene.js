import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Earth from "./Earth"; // import Earth component

function Scene({ scrollProgress }) {
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current && scrollProgress) {
      earthRef.current.rotation.y = scrollProgress.current * 2;
      earthRef.current.rotation.z = scrollProgress.current * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <group ref={earthRef} position={[0, 0, -1]}>
        <Earth />
      </group>
    </>
  );
}

export default Scene;
