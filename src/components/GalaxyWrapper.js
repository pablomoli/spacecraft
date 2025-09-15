import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Galaxy from './Galaxy';
import { DEFAULT_GALAXY_SETTINGS } from './galaxyConfig';

// Simple wrapper that forwards ref to Galaxy for direct uniform updates
const GalaxyWrapper = forwardRef(function GalaxyWrapper({
  config,
  ...props
}, ref) {
  const galaxyRef = useRef(null);

  // Forward the Galaxy's updateUniforms method
  useImperativeHandle(ref, () => ({
    updateUniforms: (newValues) => {
      if (galaxyRef.current) {
        galaxyRef.current.updateUniforms(newValues);
      }
    }
  }), []);

  // Use static config for initial setup, dynamic updates handled via ref
  const initialSettings = {
    ...DEFAULT_GALAXY_SETTINGS,
    ...(config || {}),
    ...props
  };

  return (
    <Galaxy
      ref={galaxyRef}
      {...initialSettings}
      transparent={true}
    />
  );
});

export default GalaxyWrapper;