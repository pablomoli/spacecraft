import { useRef, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

export default function Earth() {
  const groupRef = useRef();
  const cloudsRef = useRef();
  const geo = new THREE.SphereGeometry(3, 64, 64);
  const [highResLoaded, setHighResLoaded] = useState(false);

  // Load low-res textures immediately
  const [earthMapLow, lightsMapLow, cloudsMapLow] = useLoader(TextureLoader, [
    "/earth-lowres.webp",
    "/earth_lights-lowres.webp",
    "/earth_clouds-lowres.webp",
  ]);

  // Load high-res textures
  const [earthMap, lightsMap, cloudsMap] = useLoader(TextureLoader, [
    "/earth.webp",
    "/earth_lights.webp",
    "/earth_clouds_ultra.webp",
  ]);

  // Optimize texture settings for both low and high res
  const optimizeTextures = (textures) => {
    textures.forEach((texture) => {
      if (texture) {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    });
  };

  optimizeTextures([earthMapLow, lightsMapLow, cloudsMapLow]);
  optimizeTextures([earthMap, lightsMap, cloudsMap]);

  // Switch to high-res after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setHighResLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Use high-res if loaded, otherwise low-res
  const currentEarthMap = highResLoaded && earthMap ? earthMap : earthMapLow;
  const currentLightsMap = highResLoaded && lightsMap ? lightsMap : lightsMapLow;
  const currentCloudsMap = highResLoaded && cloudsMap ? cloudsMap : cloudsMapLow;
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0004;
    }
  });

  const fresnelUniforms = {
    color: { value: new THREE.Color(0x00aaff) },
    intensity: { value: 0.3 },
    power: { value: 1.0 },
  };

  const fresnelMaterial = new THREE.ShaderMaterial({
    uniforms: fresnelUniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      uniform float power;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float fresnel = pow(1.0 - dot(vNormal, vViewDir), power);
        gl_FragColor = vec4(color, fresnel * intensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return (
    <group ref={groupRef}>
      {/* Base Earth */}
      <mesh geometry={geo}>
        <meshStandardMaterial map={currentEarthMap} />
      </mesh>

      {/* Lights Layer */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={currentLightsMap}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh geometry={geo} scale={[1.01, 1.01, 1.01]} ref={cloudsRef}>
        <meshStandardMaterial
          map={currentCloudsMap}
          transparent
          opacity={0.3}
          roughness={10}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Fresnel Glow */}
      <mesh geometry={geo} scale={[1.02, 1.02, 1.02]}>
        <primitive object={fresnelMaterial} attach="material" />
      </mesh>
    </group>
  );
}
