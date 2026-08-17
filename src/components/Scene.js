import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import Earth, { SUN_DIRECTION } from "./Earth";

const EARTH_POS = new THREE.Vector3(0, 0, -1);
const UP = new THREE.Vector3(0, 1, 0);

// One shot per journey section, matched to the measured panel side:
// earthX is where Earth sits on screen (-1 left, +1 right), opposite
// the panel. Radius recedes for the experiments rail so the cards own
// the frame. Angles sum to one full orbit; with the sun fixed in world
// space the journey travels day -> terminator -> night -> crescent -> day.
const KEYS = [
  { a: 0.0, r: 5.2, earthX: 0.0, earthY: -0.1 }, // hero: centered
  { a: 0.18, r: 4.6, earthX: -0.55, earthY: 0.05 }, // about: panel right
  { a: 0.38, r: 4.8, earthX: 0.55, earthY: 0.05 }, // projects: panel left
  { a: 0.55, r: 9.5, earthX: 0.0, earthY: 0.12 }, // experiments: recede
  { a: 0.75, r: 4.8, earthX: 0.55, earthY: 0.05 }, // hackathons: panel left
  { a: 1.0, r: 6.5, earthX: -0.5, earthY: 0.0 }, // contact: panel right
];

// Hold each shot while the panel is pinned; ease to the next during the
// last part of the section, when the panel is scrolling away
const HOLD = 0.55;

const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function shotAt(fractions, progress) {
  let i = 0;
  for (let k = 0; k < fractions.length; k++) {
    if (progress >= fractions[k]) i = k;
  }
  const start = fractions[i];
  const end = i + 1 < fractions.length ? fractions[i + 1] : 1;
  const local = end > start ? (progress - start) / (end - start) : 0;
  const from = KEYS[i];
  const to = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const t = local <= HOLD ? 0 : smootherstep((local - HOLD) / (1 - HOLD));
  return {
    a: from.a + (to.a - from.a) * t,
    r: from.r + (to.r - from.r) * t,
    earthX: from.earthX + (to.earthX - from.earthX) * t,
    earthY: from.earthY + (to.earthY - from.earthY) * t,
  };
}

function applyShot(camera, shot, turn = 0) {
  const angle = shot.a * Math.PI * 2;
  camera.position.set(
    EARTH_POS.x + Math.sin(angle) * shot.r,
    EARTH_POS.y + 0.4,
    EARTH_POS.z + Math.cos(angle) * shot.r,
  );

  // Frame Earth into its zone: offset the lookAt target along camera
  // right; Earth lands on the opposite side of the screen
  const dir = EARTH_POS.clone().sub(camera.position).normalize();
  const right = new THREE.Vector3().crossVectors(dir, UP).normalize();
  const k = shot.r * 0.42;
  const target = EARTH_POS.clone()
    .addScaledVector(right, -shot.earthX * k)
    .addScaledVector(UP, shot.earthY * k);

  if (turn > 0) {
    // Wormhole approach: rotate the view away from Earth
    const away = target.clone().sub(camera.position);
    away.applyAxisAngle(UP, -turn);
    camera.lookAt(camera.position.clone().add(away));
  } else {
    camera.lookAt(target);
  }
}


// Solar System Scope 2k moon map, lambert-lit by the same fixed sun,
// faint cool rim. Positioned for the receded rail shot's open sky.
function Moon() {
  const [moonMap] = useLoader(TextureLoader, ["/moon.webp"]);

  const material = useMemo(() => {
    moonMap.colorSpace = THREE.SRGBColorSpace;
    moonMap.anisotropy = 4;
    return new THREE.ShaderMaterial({
      uniforms: {
        sunDir: { value: SUN_DIRECTION.clone() },
        moonMap: { value: moonMap },
      },
      vertexShader: `
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
      `,
      fragmentShader: `
        uniform vec3 sunDir;
        uniform sampler2D moonMap;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vec3 n = normalize(vWorldNormal);
          float ndl = max(dot(n, normalize(sunDir)), 0.0);
          vec3 albedo = texture2D(moonMap, vUv).rgb;
          vec3 sunColor = vec3(1.0, 0.93, 0.82);
          vec3 col = albedo * (sunColor * ndl * 1.1 + vec3(0.5, 0.58, 0.8) * 0.22);
          float rim = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 3.0);
          col += vec3(0.45, 0.55, 0.8) * rim * 0.35;
          gl_FragColor = vec4(col * 1.25, 1.0);
        }
      `,
    });
  }, [moonMap]);

  return (
    <mesh position={[-3.5, 3.0, 3]} material={material}>
      <sphereGeometry args={[0.5, 32, 32]} />
    </mesh>
  );
}


// In-scene stars: the OGL galaxy behind the canvas is screen-space and
// cannot parallax, so these two world-space shells are what make the
// camera shots read as travel. Deterministic seed keeps SSR/CSR stable.
function ParallaxStars() {
  const geometry = useMemo(() => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const positions = [];
    const sizes = [];
    const shells = [
      { count: 630, radius: 24, jitter: 6, size: 0.09 },
      { count: 420, radius: 48, jitter: 10, size: 0.16 },
    ];
    shells.forEach(({ count, radius, jitter, size }) => {
      for (let i = 0; i < count; i++) {
        const u = rand() * 2 - 1;
        const theta = rand() * Math.PI * 2;
        const r = radius + rand() * jitter;
        const s = Math.sqrt(1 - u * u);
        positions.push(s * Math.cos(theta) * r, u * r, s * Math.sin(theta) * r);
        sizes.push(size * (0.5 + rand()));
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float aSize;
          varying float vSize;
          void main() {
            vSize = aSize;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * 1400.0 / -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vSize;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.05, d);
            gl_FragColor = vec4(vec3(0.9, 0.92, 1.0), a * 0.85);
          }
        `,
      }),
    [],
  );

  return <points geometry={geometry} material={material} />;
}

function Scene({ scrollProgress, extraScrollProgress, scrollPhase }) {
  const { camera } = useThree();
  // Section boundaries as fractions of the normal scroll span, measured
  // from the DOM (sections are not uniform height: the rail is 500vh)
  const fractionsRef = useRef([0, 0.133, 0.267, 0.4, 0.733, 0.867]);

  useEffect(() => {
    const measure = () => {
      const sections = document.querySelectorAll(
        ".scroll > .section:not(.extra-section)",
      );
      if (!sections.length) return;
      let total = 0;
      const offsets = [];
      sections.forEach((s) => {
        offsets.push(total);
        total += s.offsetHeight;
      });
      if (total > 0) fractionsRef.current = offsets.map((o) => o / total);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    applyShot(camera, KEYS[0]);
  }, [camera]);

  const reduceMotionRef = useRef(false);
  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useFrame(({ clock }) => {
    if (!scrollProgress) return;

    if (scrollPhase === "normal") {
      const shot = shotAt(fractionsRef.current, scrollProgress.current);
      if (!reduceMotionRef.current) {
        // Idle drift: sub-degree sway so held shots breathe
        const t = clock.elapsedTime;
        shot.a += Math.sin(t * 0.1) * 0.0012;
        shot.r += Math.sin(t * 0.07) * 0.04;
        shot.earthY += Math.sin(t * 0.13) * 0.008;
      }
      applyShot(camera, shot);
    } else if (scrollPhase === "extra" && extraScrollProgress) {
      const extraProgress = extraScrollProgress.current;
      applyShot(camera, KEYS[KEYS.length - 1], extraProgress * (Math.PI / 2));

      // Subtle shake while the wormhole charges
      if (extraProgress > 0.8) {
        const shakeIntensity = ((extraProgress - 0.8) / 0.2) * 0.01;
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
      }
    }
  });

  return (
    <>
      {/* Earth lights itself in-shader from SUN_DIRECTION; the ambient
          only keeps any future standard-material props readable */}
      <ambientLight intensity={0.15} />
      <group position={EARTH_POS.toArray()}>
        <Earth />
      </group>
      <Moon />
      <ParallaxStars />
    </>
  );
}

export default Scene;
