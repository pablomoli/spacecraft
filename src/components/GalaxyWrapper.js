import React, { memo } from 'react';
import Galaxy from './Galaxy';

// Memoized wrapper to prevent unnecessary re-renders
const GalaxyWrapper = memo(function GalaxyWrapper({ config }) {
  return (
    <Galaxy 
      mouseInteraction={false}
      mouseRepulsion={false}
      twinkleIntensity={0.3}
      density={config.density}
      speed={config.speed}
      glowIntensity={config.glowIntensity}
      rotationSpeed={config.rotationSpeed}
      autoCenterRepulsion={config.autoCenterRepulsion}
      transparent={true}
      hueShift={0}
      saturation={0}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if config values actually changed
  return (
    prevProps.config.density === nextProps.config.density &&
    prevProps.config.speed === nextProps.config.speed &&
    prevProps.config.glowIntensity === nextProps.config.glowIntensity &&
    prevProps.config.rotationSpeed === nextProps.config.rotationSpeed &&
    prevProps.config.autoCenterRepulsion === nextProps.config.autoCenterRepulsion
  );
});

export default GalaxyWrapper;