import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Earth from "./Earth";

// Constants for camera movement
const CAMERA_RADIUS_FACTOR = 1.6;
const BASE_CAMERA_RADIUS = 5;

function Scene({ scrollProgress, extraScrollProgress, scrollPhase }) {
  const earthRef = useRef();
  const { camera } = useThree();
  
  // Initialize camera position
  React.useEffect(() => {
    camera.position.set(0, 0, BASE_CAMERA_RADIUS);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(() => {
    if (!scrollProgress) return;

    // Normal scroll (0-100%): Camera orbits Earth
    if (scrollPhase === 'normal') {
      const normalProgress = scrollProgress.current;
      
      // Calculate orbit position (clockwise when viewed from above)
      const angle = normalProgress * Math.PI * 2; // Full rotation
      const radius = BASE_CAMERA_RADIUS * (1 + (CAMERA_RADIUS_FACTOR - 1) * normalProgress);
      
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 0; // Keep height constant
      
      // Always look at Earth
      camera.lookAt(0, 0, 0);
    }
    
    // Extra scroll section: Camera turns away
    else if (scrollPhase === 'extra' && extraScrollProgress) {
      const extraProgress = extraScrollProgress.current;
      
      // Keep camera at its last position from normal scroll
      const finalAngle = Math.PI * 2;
      const finalRadius = BASE_CAMERA_RADIUS * CAMERA_RADIUS_FACTOR;
      camera.position.x = Math.sin(finalAngle) * finalRadius;
      camera.position.z = Math.cos(finalAngle) * finalRadius;
      
      // Turn camera 90 degrees to the right
      const turnAngle = extraProgress * (Math.PI / 2);
      const lookAtX = Math.sin(finalAngle + turnAngle) * finalRadius;
      const lookAtZ = Math.cos(finalAngle + turnAngle) * finalRadius;
      
      camera.lookAt(lookAtX, 0, lookAtZ);
      
      // Add subtle shake during charging (last 20%)
      if (extraProgress > 0.8) {
        const shakeIntensity = (extraProgress - 0.8) / 0.2 * 0.01;
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
      }
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
