import React, { memo, useState, useEffect, useRef } from 'react';
import Galaxy from './Galaxy';
import { DEFAULT_GALAXY_SETTINGS, WORMHOLE_TRANSITION_SETTINGS } from './galaxyConfig';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

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

  // Debounce config updates to prevent rapid re-renders
  const debouncedConfig = useDebounce(config, 16); // ~60fps

  useEffect(() => {
    if (isWormholeTransition) {
      setSettings(WORMHOLE_TRANSITION_SETTINGS);

      const timer = setTimeout(() => {
        setSettings({
          ...DEFAULT_GALAXY_SETTINGS,
          ...(debouncedConfig || {}),
          ...props
        });
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, transitionDuration);

      return () => clearTimeout(timer);
    } else if (debouncedConfig) {
      setSettings(prev => ({
        ...prev,
        ...debouncedConfig
      }));
    }
  }, [isWormholeTransition, transitionDuration, onTransitionComplete, debouncedConfig, props]);

  return (
    <Galaxy 
      {...settings}
      transparent={true}
    />
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison to prevent unnecessary re-renders
  if (prevProps.isWormholeTransition !== nextProps.isWormholeTransition) return false;
  if (!prevProps.config || !nextProps.config) return false;
  
  // Deep comparison of config properties
  const configKeys = [
    'density', 'speed', 'glowIntensity', 'rotationSpeed',
    'autoCenterRepulsion', 'mouseInteraction', 'mouseRepulsion',
    'twinkleIntensity', 'hueShift', 'saturation', 'repulsionStrength',
    'starSpeed'
  ];
  
  return configKeys.every(key => prevProps.config[key] === nextProps.config[key]);
});

export default GalaxyWrapper;