import React, { memo, useState, useEffect } from 'react';
import Galaxy from './Galaxy';
import { DEFAULT_GALAXY_SETTINGS, WORMHOLE_TRANSITION_SETTINGS } from './galaxyConfig';

// Memoized wrapper to prevent unnecessary re-renders
const GalaxyWrapper = memo(function GalaxyWrapper({ 
  config, 
  isWormholeTransition = false,
  transitionDuration = 2000,
  onTransitionComplete,
  ...props 
}) {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_GALAXY_SETTINGS,
    ...(config || {}),
    ...props
  }));

  useEffect(() => {
    if (isWormholeTransition) {
      // Apply wormhole transition settings
      setSettings(WORMHOLE_TRANSITION_SETTINGS);

      // Reset after transition
      const timer = setTimeout(() => {
        setSettings({
          ...DEFAULT_GALAXY_SETTINGS,
          ...(config || {}),
          ...props
        });
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, transitionDuration);

      return () => clearTimeout(timer);
    } else if (config) {
      // Update settings when config changes
      setSettings(prev => ({
        ...prev,
        ...config
      }));
    }
  }, [isWormholeTransition, transitionDuration, onTransitionComplete, config, props]);

  return (
    <Galaxy 
      {...settings}
      transparent={true}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if props actually changed
  if (prevProps.isWormholeTransition !== nextProps.isWormholeTransition) return false;
  if (!prevProps.config || !nextProps.config) return false;
  
  return (
    prevProps.config.density === nextProps.config.density &&
    prevProps.config.speed === nextProps.config.speed &&
    prevProps.config.glowIntensity === nextProps.config.glowIntensity &&
    prevProps.config.rotationSpeed === nextProps.config.rotationSpeed &&
    prevProps.config.autoCenterRepulsion === nextProps.config.autoCenterRepulsion
  );
});

export default GalaxyWrapper;