import { useRef, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

export default function Earth() {
  const groupRef = useRef();
  const cloudsRef = useRef();
  const geo = new THREE.SphereGeometry(3, 64, 64);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [earthMapHigh, setEarthMapHigh] = useState(null);
  const [lightsMapHigh, setLightsMapHigh] = useState(null);
  const [cloudsMapHigh, setCloudsMapHigh] = useState(null);

  // Load low-res textures immediately
  const [earthMapLow, lightsMapLow, cloudsMapLow] = useLoader(TextureLoader, [
    "/earth-lowres.webp",
    "/earth_lights-lowres.webp",
    "/earth_clouds-lowres.webp",
  ]);

  // High-res textures are loaded lazily via TextureLoader after mount

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

  // Defer high-res loading to idle and based on device/network
  useEffect(() => {
    let cancelled = false;

    const shouldLoadHighRes = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const conn = typeof navigator !== 'undefined' && navigator.connection ? navigator.connection.effectiveType : undefined;
      const saveData = typeof navigator !== 'undefined' && navigator.connection ? navigator.connection.saveData : false;
      const mem = navigator?.deviceMemory || 4; // heuristic
      const okNet = !conn || conn === '4g';
      return dpr > 1 && okNet && !saveData && mem >= 4;
    };

    const loadHighRes = () => {
      if (cancelled || !shouldLoadHighRes()) return;
      const loader = new TextureLoader();
      const loaded = [];
      const onLoad = () => {
        if (cancelled) return;
        // optimize and set
        optimizeTextures(loaded);
        setEarthMapHigh(loaded[0]);
        setLightsMapHigh(loaded[1]);
        setCloudsMapHigh(loaded[2]);
        setHighResLoaded(true);
      };
      let pending = 3;
      const done = () => { if (--pending === 0) onLoad(); };
      loaded[0] = loader.load('/earth.webp', done);
      loaded[1] = loader.load('/earth_lights.webp', done);
      loaded[2] = loader.load('/earth_clouds_ultra.webp', done);
    };

    const idle = (cb) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(cb, { timeout: 1500 });
      } else {
        setTimeout(cb, 600);
      }
    };

    idle(loadHighRes);
    return () => { cancelled = true; };
  }, []);

  // Use high-res if loaded, otherwise low-res
  const currentEarthMap = highResLoaded && earthMapHigh ? earthMapHigh : earthMapLow;
  const currentLightsMap = highResLoaded && lightsMapHigh ? lightsMapHigh : lightsMapLow;
  const currentCloudsMap = highResLoaded && cloudsMapHigh ? cloudsMapHigh : cloudsMapLow;

  useFrame(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
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
