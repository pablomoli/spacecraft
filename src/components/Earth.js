import { useRef, useEffect, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader, ImageBitmapLoader } from "three";

// Fixed sun in world space: the camera's orbit travels through day,
// terminator, night and back. Chosen so About faces day, Projects rides
// the terminator, the receded rail view faces the city-lit night side.
export const SUN_DIRECTION = new THREE.Vector3(0.64, 0.22, 0.74).normalize();
// Earth -> moon. Upper right of the hero at 40 deg off-axis, the least
// the planet's disc allows; off-screen in the receded rail shot (that
// camera is on the far side); never within 5 units of any camera key
export const MOON_DIRECTION = new THREE.Vector3(10.4, 3.1, -8.8).normalize();

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
  uniform vec3 moonDir;
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
    // 0.006 uv/s: alive at a glance without racing (tuned by eye twice)
    float cloud = texture2D(cloudMap, vec2(vUv.x - time * 0.006, vUv.y)).r;

    // Night-side light budget, all cool so the dark side reads blue
    // rather than black: uniform space fill plus directional moonlight
    // that switches off where the sun already dominates
    float mdl = max(dot(n, normalize(moonDir)), 0.0);
    vec3 ambient = vec3(0.45, 0.55, 0.8) * 0.17
                 + vec3(0.55, 0.65, 0.9) * 0.12 * mdl * (1.0 - dayF);
    vec3 sunColor = vec3(1.0, 0.93, 0.82);
    vec3 surf = day * (sunColor * dayF * 0.95 + ambient);

    float water = clamp((day.b - max(day.r, day.g)) * 5.0, 0.0, 1.0);
    vec3 glintDir = reflect(-normalize(sunDir), n);
    float glint = pow(max(dot(glintDir, v), 0.0), 90.0) * water * dayF;
    surf += vec3(1.0, 0.95, 0.85) * glint * 0.9;

    // Warm terminator band: low sun reddened by the atmosphere
    float term = smoothstep(0.22, 0.0, abs(ndl));
    surf += day * vec3(0.95, 0.45, 0.18) * term * 0.35;

    surf = mix(surf, vec3(0.9, 0.92, 0.95) * (0.10 + 0.90 * dayF), cloud * 0.55);

    // City lights: emissive, night side only, dimmed under cloud
    surf += night * vec3(1.0, 0.82, 0.55) * pow(1.0 - dayF, 1.7) * (1.0 - cloud * 0.75) * 1.7;

    float fres = pow(1.0 - max(dot(n, v), 0.0), 4.5);
    vec3 atmo = mix(vec3(0.10, 0.20, 0.45), vec3(0.35, 0.62, 1.0), dayF);
    surf += atmo * fres * 0.7;

    // bloom used to carry this brightness; opt-in now, so the shader does
    surf *= 1.15;

    gl_FragColor = vec4(surf, 1.0);
  }
`;

// Outer halo: back-side shell brightest just past the limb, tinted by
// how much of the visible limb is sunlit. Falloff is driven by the ray's
// closest approach to the planet centre, not the shell's normal, so the
// peak sits on the true limb and alpha is exactly zero at the shell's
// polygonal edge
const HALO_SHELL = 1.035;

const haloVertex = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vCenter;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vCenter = modelMatrix[3].xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 sunDir;
  uniform float planetRadius;
  uniform float shellScale;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vCenter;

  void main() {
    vec3 d = normalize(vWorldPos - cameraPosition);
    vec3 rel = vCenter - cameraPosition;
    // impact parameter in planet radii: 1.0 is the limb
    float b = length(rel - dot(rel, d) * d) / planetRadius;
    float t = clamp((b - 1.0) / (shellScale - 1.0), 0.0, 1.0);
    float line = exp(-t * 9.0) * (1.0 - t) * 1.1;
    float scatter = exp(-t * 2.5) * (1.0 - t) * 0.16;
    float lit = smoothstep(-0.4, 0.6, dot(normalize(vWorldNormal), normalize(sunDir)));
    vec3 color = mix(vec3(0.08, 0.16, 0.38), vec3(0.38, 0.64, 1.0), lit);
    gl_FragColor = vec4(color, line + scatter);
  }
`;

export default function Earth({ children }) {
  const groupRef = useRef();
  // The hero shot fills the viewport with the limb; below ~96 segments the
  // silhouette reads as straight runs
  const geo = useMemo(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const mem = typeof navigator !== "undefined" && navigator.deviceMemory ? navigator.deviceMemory : 4;
    const segments = mem <= 4 || dpr <= 1 ? 96 : 128;
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
          moonDir: { value: MOON_DIRECTION.clone() },
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
        uniforms: {
          sunDir: { value: SUN_DIRECTION.clone() },
          planetRadius: { value: 3 },
          shellScale: { value: HALO_SHELL },
        },
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
      // No mip chain made the rotating surface shimmer: high-frequency
      // detail (city lights, clouds) aliases per-frame without one
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
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
      <mesh geometry={geo} scale={HALO_SHELL}>
        <primitive object={haloMaterial} attach="material" />
      </mesh>
      {children}
    </group>
  );
}
