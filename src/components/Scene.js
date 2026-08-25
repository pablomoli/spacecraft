import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import Earth, { SUN_DIRECTION, MOON_DIRECTION } from "./Earth";
import Pins from "./Pins";
import { makeRadialTexture } from "./glow";

const EARTH_POS = new THREE.Vector3(0, 0, -1);
const UP = new THREE.Vector3(0, 1, 0);

// Places pinned on the globe: home plus the hackathon venues
const PINS = [
  { id: "home", kind: "home", lat: 28.538, lon: -81.379 }, // Orlando
  { id: "hacklytics", kind: "hackathon", lat: 33.776, lon: -84.398 }, // Georgia Tech
  { id: "knighthacks", kind: "hackathon", lat: 28.602, lon: -81.2 }, // UCF
];

// One shot per journey section, matched to the measured panel side:
// earthX is where Earth sits on screen (-1 left, +1 right), opposite
// the panel. Radius recedes for the experiments rail so the cards own
// the frame. Angles sum to one full orbit; with the sun fixed in world
// space the journey travels day -> terminator -> night -> crescent -> day.
const KEYS = [
  { a: 0.0, r: 5.2, earthX: 0.0, earthY: -0.1 }, // hero: centered
  { a: 0.18, r: 4.6, earthX: -0.62, earthY: 0.05 }, // about: panel right
  { a: 0.38, r: 4.8, earthX: 0.62, earthY: 0.05 }, // projects: panel left
  { a: 0.55, r: 9.5, earthX: 0.0, earthY: 0.12 }, // experiments: recede
  { a: 0.75, r: 4.8, earthX: 0.62, earthY: 0.05 }, // hackathons: panel left
  { a: 1.0, r: 6.5, earthX: -0.56, earthY: 0.0 }, // contact: panel right
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
// faint cool rim, additive halo so it reads as a light source.
// Radius is to scale (0.273 of Earth); distance is not: at 60 Earth
// radii it would sit past the star shells and vanish
const MOON_RADIUS = 3 * 0.273;
const MOON_DISTANCE = 14;

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
          vec3 sunColor = vec3(1.0, 0.95, 0.86);
          vec3 col = albedo * (sunColor * ndl * 1.5 + vec3(0.5, 0.58, 0.8) * 0.2);
          float rim = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 3.0);
          col += vec3(0.6, 0.66, 0.85) * rim * 0.3;
          gl_FragColor = vec4(col * 1.35, 1.0);
        }
      `,
    });
  }, [moonMap]);

  // Sprite depth-tests against the moon's own surface, so only the
  // ring outside the disc shows
  const haloMap = useMemo(
    () =>
      makeRadialTexture([
        [0.0, "rgba(255, 246, 228, 0.55)"],
        [0.3, "rgba(255, 242, 220, 0.16)"],
        [1.0, "rgba(255, 242, 220, 0)"],
      ]),
    [],
  );

  const position = useMemo(
    () => EARTH_POS.clone().addScaledVector(MOON_DIRECTION, MOON_DISTANCE).toArray(),
    [],
  );

  return (
    <group position={position}>
      <mesh material={material}>
        <sphereGeometry args={[MOON_RADIUS, 48, 48]} />
      </mesh>
      {haloMap && (
        <sprite scale={MOON_RADIUS * 5}>
          <spriteMaterial
            map={haloMap}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}
    </group>
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


// A meteor: one thin additive streak crossing the far sky, then a long
// quiet gap. An event, not a texture - most visits see one or two.
// Built as a camera-facing ribbon: THREE.Line hairlines proved unreliable.
function Meteor() {
  const meshRef = useRef(null);
  const stateRef = useRef(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uAlpha: { value: 0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uAlpha;
          varying vec2 vUv;
          void main() {
            float tail = pow(vUv.x, 2.2);
            float edge = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            vec3 color = mix(vec3(0.6, 0.75, 1.0), vec3(1.0), tail);
            gl_FragColor = vec4(color, tail * edge * uAlpha);
          }
        `,
      }),
    [],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const debug = new URLSearchParams(window.location.search).has("meteor");
    stateRef.current = {
      disabled: reduce,
      debug,
      next: debug ? 2 : 14 + Math.random() * 30,
      active: false,
      t0: 0,
      dur: 1.3,
      from: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      bx: new THREE.Vector3(),
      by: new THREE.Vector3(),
      bz: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
    };
  }, []);

  useFrame(({ clock, camera }) => {
    const st = stateRef.current;
    const mesh = meshRef.current;
    if (!st || st.disabled || !mesh) return;
    const t = clock.elapsedTime;
    if (st.debug) {
      window.__meteor = {
        t: Math.round(t * 10) / 10,
        next: Math.round(st.next * 10) / 10,
        active: st.active,
        alpha: material.uniforms.uAlpha.value,
        pos: mesh.position.toArray().map((v) => Math.round(v * 10) / 10),
        visible: mesh.visible,
      };
    }

    if (!st.active && t >= st.next) {
      if (st.debug) {
        st.from.set(16, 13, -26);
        st.dir.set(-0.75, -0.35, 0.1).normalize();
      } else {
        const theta = Math.random() * Math.PI * 2;
        const y = 8 + Math.random() * 14;
        st.from.set(Math.cos(theta) * 34, y, Math.sin(theta) * 34);
        const tangent = new THREE.Vector3().crossVectors(st.from, new THREE.Vector3(0, 1, 0)).normalize();
        st.dir.copy(tangent).multiplyScalar(Math.random() < 0.5 ? 1 : -1);
        st.dir.y = -(0.3 + Math.random() * 0.4);
        st.dir.normalize();
      }
      st.t0 = t;
      st.dur = 1.0 + Math.random() * 0.7;
      st.active = true;
    }

    if (st.active) {
      const u = (t - st.t0) / st.dur;
      if (u >= 1) {
        st.active = false;
        st.next = t + (st.debug ? 4 : 45 + Math.random() * 75);
        material.uniforms.uAlpha.value = 0;
        mesh.visible = false;
      } else {
        const travel = 14;
        st.mid.copy(st.from).addScaledVector(st.dir, u * travel - 1.1);
        mesh.position.copy(st.mid);
        // Face the camera while staying aligned with the travel direction
        st.bx.copy(st.dir);
        st.bz.copy(camera.position).sub(st.mid).normalize();
        st.by.crossVectors(st.bz, st.bx).normalize();
        st.bz.crossVectors(st.bx, st.by);
        st.basis.makeBasis(st.bx, st.by, st.bz);
        mesh.quaternion.setFromRotationMatrix(st.basis);
        mesh.visible = true;
        material.uniforms.uAlpha.value = Math.pow(Math.sin(Math.PI * u), 0.7) * 0.9;
      }
    }
  });

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false} visible={false}>
      <planeGeometry args={[3.0, 0.08]} />
    </mesh>
  );
}


// A small craft on an inclined low orbit: crosses the hero's disc every
// ~50s, a nod to the surveying origin story
const UFO_URL = "/models/ovni.glb";
// Emissive parts keyed by material name as exported in the GLB. sharp
// lamps flash briefly once per cycle; soft ones breathe
const UFO_LIGHTS = {
  Engine_glow: { color: [0.2, 0.7, 1.0], base: 2.2, pulse: 1.2, rate: 4.0, phase: 0, sharp: false },
  light_bulb: { color: [1.0, 0.85, 0.5], base: 0.6, pulse: 2.0, rate: 3.6, phase: 1.2, sharp: true },
  yellow: { color: [1.0, 0.9, 0.3], base: 0.8, pulse: 1.4, rate: 2.4, phase: 2.5, sharp: true },
};
const ENGINE_COLOR = "#3cb4ff";

function Satellite() {
  const groupRef = useRef(null);
  const craftRef = useRef(null);
  const { scene } = useGLTF(UFO_URL);

  // One clone per named material, shared by every mesh that used it;
  // cloning keeps useGLTF's cached scene untouched
  const lights = useMemo(() => {
    const byName = new Map();
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const spec = UFO_LIGHTS[o.material.name];
      if (!spec) return;
      let entry = byName.get(o.material.name);
      if (!entry) {
        const m = o.material.clone();
        m.emissive = new THREE.Color(...spec.color);
        m.emissiveIntensity = spec.base;
        m.toneMapped = false;
        entry = { material: m, ...spec };
        byName.set(o.material.name, entry);
      }
      o.material = entry.material;
    });
    return [...byName.values()];
  }, [scene]);

  const beaconMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uPulse: { value: 1 } },
        vertexShader: `
          uniform float uPulse;
          void main() {
            vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            gl_PointSize = clamp(900.0 / -mv.z, 8.0, 64.0) * uPulse;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float core = smoothstep(0.12, 0.02, d);
            float glow = smoothstep(0.5, 0.08, d) * 0.3;
            gl_FragColor = vec4(vec3(0.35, 0.75, 1.0), core * 0.6 + glow);
          }
        `,
      }),
    [],
  );

  const pointGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    const c = craftRef.current;
    if (!g || !c) return;
    const t = clock.elapsedTime;
    const u = t * 0.13;
    const r = 3.55;
    const incl = 0.6;
    g.position.set(
      EARTH_POS.x + Math.cos(u) * r,
      EARTH_POS.y + Math.sin(u) * Math.sin(incl) * r,
      EARTH_POS.z + Math.sin(u) * Math.cos(incl) * r,
    );

    // Saucer spin plus a slow bank and bob: reads as flown, not carried
    c.rotation.y = t * 1.6;
    c.rotation.z = Math.sin(t * 0.7) * 0.12;
    c.rotation.x = Math.sin(t * 0.45) * 0.08;
    c.position.y = Math.sin(t * 1.3) * 0.012;

    for (const l of lights) {
      const w = Math.sin(t * l.rate + l.phase);
      const p = l.sharp ? Math.pow(Math.max(w, 0), 12) : 0.5 + 0.5 * w;
      l.material.emissiveIntensity = l.base + l.pulse * p;
    }
    beaconMaterial.uniforms.uPulse.value = 0.85 + 0.15 * Math.sin(t * 4.0);
  });

  return (
    <group ref={groupRef}>
      <group ref={craftRef}>
        <primitive object={scene} scale={0.02} />
      </group>
      <pointLight color={ENGINE_COLOR} intensity={3} distance={0.5} decay={2} />
      <points geometry={pointGeometry} material={beaconMaterial} frustumCulled={false} />
    </group>
  );
}
useGLTF.preload(UFO_URL);

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
      <directionalLight position={SUN_DIRECTION.clone().multiplyScalar(10)} intensity={2.5} />
      <group position={EARTH_POS.toArray()}>
        <Earth>
          <Pins pins={PINS} />
        </Earth>
      </group>
      <Moon />
      <ParallaxStars />
      <Meteor />
      <Satellite />
    </>
  );
}

export default Scene;
