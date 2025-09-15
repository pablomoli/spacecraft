// Galaxy configuration settings

export const DEFAULT_GALAXY_SETTINGS = {
  focal: [0.5, 0.5],
  rotation: [1.0, 0.0],
  mouseInteraction: false,
  mouseRepulsion: false,
  density: 0.3,
  glowIntensity: 0.2,
  saturation: 0,
  hueShift: 0, // 0 for white stars
  twinkleIntensity: 0.3,
  rotationSpeed: 0,
  repulsionStrength: 1,
  autoCenterRepulsion: 0,
  starSpeed: 0.5,
  speed: 0,
  disableAnimation: false,
  transparent: true,
};

export const WORMHOLE_TRANSITION_SETTINGS = {
  mouseInteraction: false, // Disabled during wormhole
  mouseRepulsion: false, // Disabled during wormhole
  density: 1.2,
  glowIntensity: 0.5,
  saturation: 1,
  hueShift: 140, // Blue during transition
  twinkleIntensity: 0.3,
  rotationSpeed: 0.15,
  repulsionStrength: 2,
  autoCenterRepulsion: 10,
  starSpeed: 2,
  speed: 1.5,
};

// Settings for GSAP animation timeline
export const WORMHOLE_ANIMATION_CONFIG = {
  // Phase 1: Charge up to wormhole state
  chargeUp: {
    duration: 2.0,
    ease: "power2.inOut",
    settings: WORMHOLE_TRANSITION_SETTINGS,
  },
  // Phase 2: Hold wormhole state
  hold: {
    duration: 1.6,
    progress: 1,
  },
  // Phase 3: Return to normal
  return: {
    duration: 0.1,
    settings: {
      density: DEFAULT_GALAXY_SETTINGS.density,
      speed: DEFAULT_GALAXY_SETTINGS.speed,
      starSpeed: DEFAULT_GALAXY_SETTINGS.starSpeed,
      glowIntensity: DEFAULT_GALAXY_SETTINGS.glowIntensity,
      rotationSpeed: DEFAULT_GALAXY_SETTINGS.rotationSpeed,
      autoCenterRepulsion: DEFAULT_GALAXY_SETTINGS.autoCenterRepulsion,
      hueShift: DEFAULT_GALAXY_SETTINGS.hueShift,
      saturation: DEFAULT_GALAXY_SETTINGS.saturation,
    },
  },
};
