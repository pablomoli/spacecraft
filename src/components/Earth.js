import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

export default function Earth() {
  const groupRef = useRef();
  const cloudsRef = useRef();
  const geo = new THREE.SphereGeometry(3, 64, 64);

  const [earthMap, lightsMap, cloudsMap] = useLoader(TextureLoader, [
    "/earth.jpg",
    "/earth_lights.jpg",
    "/earth_clouds.jpg",
  ]);
  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0002;
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
        <meshStandardMaterial map={earthMap} />
      </mesh>

      {/* Lights Layer */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={lightsMap}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh geometry={geo} scale={[1.01, 1.01, 1.01]} ref={cloudsRef}>
        <meshStandardMaterial
          map={cloudsMap}
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
