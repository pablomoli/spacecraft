import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { WORMHOLE_TRANSITION_SETTINGS } from "./galaxyConfig";
import "./Galaxy.css";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
// Exit settle progress (phase 3): 0 -> 1 only during return
uniform float uExitProgress;

varying vec2 vUv;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

uniform float uNumLayers;

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  
  // Phase 3: exit settle effect (gentle zoom + ripple)
  float E = smoothstep(0.0, 1.0, uExitProgress);
  float Eo = 1.0 - pow(1.0 - E, 3.0); // easeOutCubic
  float zoom = 1.0 - 0.16 * Eo + 0.05 * Eo * Eo;
  uv *= zoom;
  float r = length(uv);
  vec2 nrm = normalize(uv + 1e-6);
  uv += nrm * (0.025 * Eo * sin(16.0 * r - 6.0 * Eo));

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0); // Center in UV space
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 4.0; i += 1.0) {
    float layerIndex = i / 4.0;
    if (i >= uNumLayers) continue;
    float depth = fract(layerIndex + uTime * uStarSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + layerIndex * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha); // Enhance contrast
    alpha = min(alpha, 1.0); // Clamp to maximum 1.0
    // Exit settle: subtle glow pulse + slight desaturation
    col *= (1.0 + 0.26 * Eo);
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(luma), 0.22 * Eo);
    gl_FragColor = vec4(col, alpha);
  } else {
    col *= (1.0 + 0.26 * Eo);
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(luma), 0.22 * Eo);
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

const Galaxy = forwardRef(function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 0,  // Default to 0 for white stars
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  quality = 'high', // 'low' = 2 layers, 'medium' = 3 layers, 'high' = 4 layers
  ...rest
}, ref) {
  const ctnDom = useRef(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);
  const animateIdRef = useRef(null);
  const isVisibleRef = useRef(true);
  const programRef = useRef(null);
  const currentWarpProgress = useRef(0.0);
  const currentExitProgress = useRef(0.0);

  // Convert quality setting to number of layers
  const getNumLayers = (qualitySetting) => {
    switch (qualitySetting) {
      case 'low': return 2;
      case 'medium': return 3;
      case 'high': return 4;
      default: return 4;
    }
  };

  // Expose uniform update method via ref
  useImperativeHandle(ref, () => ({
    updateUniforms: (newValues) => {
      if (!programRef.current) return;
      const program = programRef.current;

      // Track warp/exit progress for interpolation
      if (newValues.warpProgress !== undefined) {
        currentWarpProgress.current = newValues.warpProgress;
      }
      if (newValues.exitProgress !== undefined) {
        currentExitProgress.current = newValues.exitProgress;
        program.uniforms.uExitProgress.value = newValues.exitProgress;
      }

      // Compute interpolated values on CPU
      const p = Math.max(0, Math.min(1, currentWarpProgress.current)); // clamp 0-1
      const pSmooth = p * p * (3 - 2 * p); // smoothstep approximation

      // Motion ramps matching original shader logic
      const ps = Math.max(0, Math.min(1, (pSmooth - 0.65) / 0.35));
      const pss = Math.max(0, Math.min(1, (pSmooth - 0.85) / 0.15));
      const speedBlend = Math.pow(ps, 3.0);
      const starSpeedBlend = Math.pow(pss, 3.4);

      // Exit snap damping
      const E_snap = currentExitProgress.current * currentExitProgress.current * (3 - 2 * currentExitProgress.current);
      const exitSnap = Math.pow(E_snap, 6.0);
      const exitSnapStars = Math.pow(E_snap, 8.0);
      const finalSpeedBlend = speedBlend * (1.0 - exitSnap);
      const finalStarSpeedBlend = starSpeedBlend * (1.0 - exitSnapStars);

      // Interpolate uniforms
      const baseDensity = newValues.density !== undefined ? newValues.density : density;
      const baseSpeed = newValues.speed !== undefined ? newValues.speed : speed;
      const baseStarSpeed = newValues.starSpeed !== undefined ? newValues.starSpeed : starSpeed;
      const baseGlow = newValues.glowIntensity !== undefined ? newValues.glowIntensity : glowIntensity;
      const baseRotation = newValues.rotationSpeed !== undefined ? newValues.rotationSpeed : rotationSpeed;
      const baseRepulsion = newValues.autoCenterRepulsion !== undefined ? newValues.autoCenterRepulsion : autoCenterRepulsion;
      const baseSaturation = newValues.saturation !== undefined ? newValues.saturation : saturation;
      const baseHueShift = newValues.hueShift !== undefined ? newValues.hueShift : hueShift;
      const baseTwinkle = newValues.twinkleIntensity !== undefined ? newValues.twinkleIntensity : twinkleIntensity;

      // Warp targets from config
      const warpDensity = WORMHOLE_TRANSITION_SETTINGS.density;
      const warpSpeed = WORMHOLE_TRANSITION_SETTINGS.speed;
      const warpStarSpeed = WORMHOLE_TRANSITION_SETTINGS.starSpeed;
      const warpGlow = WORMHOLE_TRANSITION_SETTINGS.glowIntensity;
      const warpRotation = WORMHOLE_TRANSITION_SETTINGS.rotationSpeed;
      const warpRepulsion = WORMHOLE_TRANSITION_SETTINGS.autoCenterRepulsion;
      const warpSaturation = WORMHOLE_TRANSITION_SETTINGS.saturation;
      const warpHueShift = WORMHOLE_TRANSITION_SETTINGS.hueShift;
      const warpTwinkle = WORMHOLE_TRANSITION_SETTINGS.twinkleIntensity;

      // Interpolate and set uniforms
      program.uniforms.uDensity.value = baseDensity + (warpDensity - baseDensity) * pSmooth;
      program.uniforms.uGlowIntensity.value = baseGlow + (warpGlow - baseGlow) * pSmooth;
      program.uniforms.uSaturation.value = baseSaturation + (warpSaturation - baseSaturation) * pSmooth;
      program.uniforms.uHueShift.value = baseHueShift + (warpHueShift - baseHueShift) * pSmooth;
      program.uniforms.uRotationSpeed.value = baseRotation + (warpRotation - baseRotation) * pSmooth;
      program.uniforms.uAutoCenterRepulsion.value = baseRepulsion + (warpRepulsion - baseRepulsion) * pSmooth;
      program.uniforms.uTwinkleIntensity.value = baseTwinkle + (warpTwinkle - baseTwinkle) * pSmooth;

      // Speed uses delayed blend
      const effectiveSpeed = baseSpeed + (warpSpeed - baseSpeed) * finalSpeedBlend;
      const effectiveStarSpeed = baseStarSpeed + (warpStarSpeed - baseStarSpeed) * finalStarSpeedBlend;
      program.uniforms.uSpeed.value = effectiveSpeed;
      program.uniforms.uStarSpeed.value = effectiveStarSpeed * effectiveSpeed * 0.1;

      // Direct updates for other properties
      if (newValues.repulsionStrength !== undefined) program.uniforms.uRepulsionStrength.value = newValues.repulsionStrength;
      if (newValues.mouseRepulsion !== undefined) program.uniforms.uMouseRepulsion.value = newValues.mouseRepulsion;
    }
  }), [density, speed, starSpeed, glowIntensity, rotationSpeed, autoCenterRepulsion, saturation, hueShift, twinkleIntensity]);

  useEffect(() => {
    if (!ctnDom.current) return;

    const ctn = ctnDom.current;
    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;

    if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener("resize", resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([
            smoothMousePos.current.x,
            smoothMousePos.current.y,
          ]),
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uExitProgress: { value: 0.0 },
        uNumLayers: { value: getNumLayers(quality) },
      },
    });

    // Store program reference for imperative updates
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });

    function update(t) {
      // If page/tab is hidden, skip scheduling/rendering
      if (!isVisibleRef.current) return;
      animateIdRef.current = requestAnimationFrame(update);
      if (!disableAnimation) {
        program.uniforms.uTime.value = t * 0.001;
      }

      const lerpFactor = 0.05;
      smoothMousePos.current.x +=
        (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y +=
        (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;

      smoothMouseActive.current +=
        (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      // Skip render if effectively idle to save CPU/GPU
      const idle =
        disableAnimation &&
        speed === 0 &&
        rotationSpeed === 0 &&
        twinkleIntensity === 0 &&
        Math.abs(smoothMouseActive.current) < 0.001;

      if (!idle) {
        renderer.render({ scene: mesh });
      }
    }
    animateIdRef.current = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    function handleVisibility() {
      const visible = !document.hidden;
      isVisibleRef.current = visible;
      if (!visible) {
        if (animateIdRef.current) {
          cancelAnimationFrame(animateIdRef.current);
          animateIdRef.current = null;
        }
      } else if (!animateIdRef.current) {
        animateIdRef.current = requestAnimationFrame(update);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    function handleMouseMove(e) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMousePos.current = { x, y };
      targetMouseActive.current = 1.0;
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0;
    }

    if (mouseInteraction) {
      ctn.addEventListener("mousemove", handleMouseMove);
      ctn.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {

      if (animateIdRef.current) cancelAnimationFrame(animateIdRef.current);
      animateIdRef.current = null;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (mouseInteraction) {
        ctn.removeEventListener("mousemove", handleMouseMove);
        ctn.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (ctn && gl.canvas && ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    transparent,
    quality,
  ]);

  // Apply prop-driven uniform updates only when props change,
  // not every animation frame. This prevents overwriting GSAP updates.
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    program.uniforms.uDensity.value = density;
    program.uniforms.uSpeed.value = speed;
    program.uniforms.uGlowIntensity.value = glowIntensity;
    program.uniforms.uRotationSpeed.value = rotationSpeed;
    program.uniforms.uAutoCenterRepulsion.value = autoCenterRepulsion;
    program.uniforms.uSaturation.value = saturation;
    program.uniforms.uHueShift.value = hueShift;
    program.uniforms.uTwinkleIntensity.value = twinkleIntensity;
    program.uniforms.uRepulsionStrength.value = repulsionStrength;
    program.uniforms.uMouseRepulsion.value = mouseRepulsion;
    program.uniforms.uNumLayers.value = getNumLayers(quality);
    // Compound value derived from starSpeed & speed
    program.uniforms.uStarSpeed.value = starSpeed * speed * 0.1;
  }, [
    density,
    speed,
    glowIntensity,
    rotationSpeed,
    autoCenterRepulsion,
    saturation,
    hueShift,
    twinkleIntensity,
    repulsionStrength,
    mouseRepulsion,
    starSpeed,
    quality,
  ]);

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
});

export default Galaxy;
