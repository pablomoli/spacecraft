import { useRef, useEffect, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader, ImageBitmapLoader } from "three";

// Fixed sun in world space: the camera's orbit travels through day,
// terminator, night and back. Chosen so About faces day, Projects rides
// the terminator, the receded rail view faces the city-lit night side.
export const SUN_DIRECTION = new THREE.Vector3(0.64, 0.22, 0.74).normalize();

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Day/night surface in one pass: sunlit albedo, warm terminator band,
// clouds drifting on their own UV offset, city lights emissive only on
// the dark side and dimmed under cloud, atmosphere rim by fresnel.
const surfaceFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(vViewDir);
    float ndl = dot(n, normalize(sunDir));
    float dayF = smoothstep(-0.12, 0.28, ndl);

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;
    float cloud = texture2D(cloudMap, vec2(vUv.x + time * 0.0035, vUv.y)).r;

    vec3 surf = day * (0.05 + 0.95 * dayF);

    float term = smoothstep(0.22, 0.0, abs(ndl));
    surf += day * vec3(0.95, 0.45, 0.18) * term * 0.35;

    surf = mix(surf, vec3(0.9, 0.92, 0.95) * (0.10 + 0.90 * dayF), cloud * 0.55);

    surf += night * vec3(1.0, 0.82, 0.55) * pow(1.0 - dayF, 1.7) * (1.0 - cloud * 0.75) * 1.7;

    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    vec3 atmo = mix(vec3(0.10, 0.20, 0.45), vec3(0.35, 0.62, 1.0), dayF);
    surf += atmo * fres * 1.15;

    gl_FragColor = vec4(surf, 1.0);
  }
`;

// Outer halo: back-side shell, brightest just past the limb, tinted by
// how much of the visible limb is sunlit
const haloVertex = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 sunDir;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(vViewDir);
    float rim = pow(1.0 - abs(dot(n, v)), 3.0);
    float lit = smoothstep(-0.4, 0.6, dot(n, normalize(sunDir)));
    vec3 color = mix(vec3(0.08, 0.16, 0.38), vec3(0.35, 0.6, 1.0), lit);
    gl_FragColor = vec4(color, rim * 0.85);
  }
`;

export default function Earth() {
  const groupRef = useRef();
  // Memoize geometry; keep segments modest for perf (48 on low-power, otherwise 64)
  const geo = useMemo(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const mem = typeof navigator !== "undefined" && navigator.deviceMemory ? navigator.deviceMemory : 4;
    const segments = mem <= 4 || dpr <= 1 ? 48 : 64;
    return new THREE.SphereGeometry(3, segments, segments);
  }, []);

  // Load low-res textures immediately
  const [earthMapLow, lightsMapLow, cloudsMapLow] = useLoader(TextureLoader, [
    "/earth-lowres.webp",
    "/earth_lights-lowres.webp",
    "/earth_clouds-lowres.webp",
  ]);

  const optimizeLowRes = (textures) => {
    textures.forEach((texture) => {
      if (texture) {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
      }
    });
  };

  optimizeLowRes([earthMapLow, lightsMapLow, cloudsMapLow]);

  const surfaceMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: earthMapLow },
          nightMap: { value: lightsMapLow },
          cloudMap: { value: cloudsMapLow },
          sunDir: { value: SUN_DIRECTION.clone() },
          time: { value: 0 },
        },
        vertexShader: surfaceVertex,
        fragmentShader: surfaceFragment,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { sunDir: { value: SUN_DIRECTION.clone() } },
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  // Defer high-res loading to idle and based on device/network
  useEffect(() => {
    let cancelled = false;
    const loaded = [];

    const shouldLoadHighRes = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const conn = typeof navigator !== 'undefined' && navigator.connection ? navigator.connection.effectiveType : undefined;
      const saveData = typeof navigator !== 'undefined' && navigator.connection ? navigator.connection.saveData : false;
      const mem = navigator?.deviceMemory || 4;
      const okNet = !conn || conn === '4g';
      return dpr > 1 && okNet && !saveData && mem >= 4;
    };

    const createTexture = (imageBitmap) => {
      const tex = new THREE.CanvasTexture(imageBitmap);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      loaded.push(tex);
      return tex;
    };

    const loadTextureBitmap = (url) =>
      new Promise((resolve, reject) => {
        const loader = new ImageBitmapLoader();
        loader.setOptions({ imageOrientation: "flipY" });
        loader.load(
          url,
          (imageBitmap) => resolve(createTexture(imageBitmap)),
          undefined,
          (err) => reject(err)
        );
      });

    const pause = (ms) => new Promise((r) => setTimeout(r, ms));

    const loadHighRes = async () => {
      if (cancelled || !shouldLoadHighRes()) return;
      try {
        const earthTex = await loadTextureBitmap("/earth.webp");
        if (cancelled) return;
        surfaceMaterial.uniforms.dayMap.value = earthTex;

        await pause(100);
        const lightsTex = await loadTextureBitmap("/earth_lights.webp");
        if (cancelled) return;
        surfaceMaterial.uniforms.nightMap.value = lightsTex;

        await pause(100);
        const cloudsTex = await loadTextureBitmap("/earth_clouds_ultra.webp");
        if (cancelled) return;
        surfaceMaterial.uniforms.cloudMap.value = cloudsTex;

      } catch (e) {
        console.error("High-res texture load failed", e);
      }
    };

    const idle = (cb) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(cb, { timeout: 1500 });
      } else {
        setTimeout(cb, 600);
      }
    };

    idle(loadHighRes);
    return () => {
      cancelled = true;
      loaded.forEach((tex) => tex.dispose());
    };
  }, [surfaceMaterial]);

  useFrame((_, delta) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
    surfaceMaterial.uniforms.time.value += delta;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo}>
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>
      <mesh geometry={geo} scale={[1.05, 1.05, 1.05]}>
        <primitive object={haloMaterial} attach="material" />
      </mesh>
    </group>
  );
}
