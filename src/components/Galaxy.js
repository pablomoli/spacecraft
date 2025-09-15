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

 // Warp progress and targets
 uniform float uWarpProgress; // 0.0 -> 1.0
 uniform float uWarpDensity;
 uniform float uWarpGlowIntensity;
 uniform float uWarpSaturation;
 uniform float uWarpHueShift;
 uniform float uWarpRotationSpeed;
 uniform float uWarpAutoCenterRepulsion;
 uniform float uWarpStarSpeed;
 uniform float uWarpSpeed;
  uniform float uWarpTwinkleIntensity;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

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

  // Local effective params for this layer
  float p = smoothstep(0.0, 1.0, uWarpProgress);
  float speedEff = mix(uSpeed, uWarpSpeed, p);
  float hueShiftEff = mix(uHueShift, uWarpHueShift, p);
  float satEff = mix(uSaturation, uWarpSaturation, p);
  float twinkleIntensityEff = mix(uTwinkleIntensity, uWarpTwinkleIntensity, p);

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
      hue = fract(hue + hueShiftEff / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * satEff;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * speedEff / 10.0), tris(seed * 38.0 + uTime * speedEff / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * speedEff + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, twinkleIntensityEff);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  // Progress with a soft ease for smoother visuals
  float p = smoothstep(0.0, 1.0, uWarpProgress);
  
  // Derive effective parameters by blending base->warp
  float densityEff = mix(uDensity, uWarpDensity, p);
  float glowEff = mix(uGlowIntensity, uWarpGlowIntensity, p);
  float satEff = mix(uSaturation, uWarpSaturation, p);
  float hueShiftEff = mix(uHueShift, uWarpHueShift, p);
  float rotationSpeedEff = mix(uRotationSpeed, uWarpRotationSpeed, p);
  float autoCenterRepulsionEff = mix(uAutoCenterRepulsion, uWarpAutoCenterRepulsion, p);
  float starSpeedEff = mix(uStarSpeed, uWarpStarSpeed, p);
  float speedEff = mix(uSpeed, uWarpSpeed, p);

  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (autoCenterRepulsionEff > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0); // Center in UV space
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (autoCenterRepulsionEff / (centerDist + 0.1));
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

  float autoRotAngle = uTime * rotationSpeedEff;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uTime * starSpeedEff);
    float scale = mix(20.0 * densityEff, 0.5 * densityEff, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha); // Enhance contrast
    alpha = min(alpha, 1.0); // Clamp to maximum 1.0
    gl_FragColor = vec4(col, alpha);
  } else {
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

  // Expose uniform update method via ref
  useImperativeHandle(ref, () => ({
    updateUniforms: (newValues) => {
      if (programRef.current) {
        const program = programRef.current;
        if (newValues.density !== undefined) program.uniforms.uDensity.value = newValues.density;
        if (newValues.speed !== undefined) program.uniforms.uSpeed.value = newValues.speed;
        if (newValues.glowIntensity !== undefined) program.uniforms.uGlowIntensity.value = newValues.glowIntensity;
        if (newValues.rotationSpeed !== undefined) program.uniforms.uRotationSpeed.value = newValues.rotationSpeed;
        if (newValues.autoCenterRepulsion !== undefined) program.uniforms.uAutoCenterRepulsion.value = newValues.autoCenterRepulsion;
        if (newValues.saturation !== undefined) program.uniforms.uSaturation.value = newValues.saturation;
        if (newValues.hueShift !== undefined) program.uniforms.uHueShift.value = newValues.hueShift;
        if (newValues.twinkleIntensity !== undefined) program.uniforms.uTwinkleIntensity.value = newValues.twinkleIntensity;
        if (newValues.repulsionStrength !== undefined) program.uniforms.uRepulsionStrength.value = newValues.repulsionStrength;
        if (newValues.mouseRepulsion !== undefined) program.uniforms.uMouseRepulsion.value = newValues.mouseRepulsion;
        if (newValues.starSpeed !== undefined) program.uniforms.uStarSpeed.value = newValues.starSpeed * (newValues.speed || speed) * 0.1;
        if (newValues.warpProgress !== undefined) program.uniforms.uWarpProgress.value = newValues.warpProgress;
      }
    }
  }), [speed]);

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
        // Warp uniforms
        uWarpProgress: { value: 0.0 },
        uWarpDensity: { value: WORMHOLE_TRANSITION_SETTINGS.density },
        uWarpGlowIntensity: { value: WORMHOLE_TRANSITION_SETTINGS.glowIntensity },
        uWarpSaturation: { value: WORMHOLE_TRANSITION_SETTINGS.saturation },
        uWarpHueShift: { value: WORMHOLE_TRANSITION_SETTINGS.hueShift },
        uWarpRotationSpeed: { value: WORMHOLE_TRANSITION_SETTINGS.rotationSpeed },
        uWarpAutoCenterRepulsion: { value: WORMHOLE_TRANSITION_SETTINGS.autoCenterRepulsion },
        // Precompute warp starSpeed effective (matches JS combo logic: * speed * 0.1)
        uWarpStarSpeed: { value: WORMHOLE_TRANSITION_SETTINGS.starSpeed * WORMHOLE_TRANSITION_SETTINGS.speed * 0.1 },
        uWarpSpeed: { value: WORMHOLE_TRANSITION_SETTINGS.speed },
        uWarpTwinkleIntensity: { value: WORMHOLE_TRANSITION_SETTINGS.twinkleIntensity },
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
  ]);

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
});

export default Galaxy;
