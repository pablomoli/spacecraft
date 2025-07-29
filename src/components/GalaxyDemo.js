import React, { useState } from 'react';
import GalaxyWrapper from './GalaxyWrapper';

export default function GalaxyDemo() {
  const [isWormhole, setIsWormhole] = useState(false);

  const handleWormholeToggle = () => {
    setIsWormhole(true);
  };

  const handleTransitionComplete = () => {
    setIsWormhole(false);
    console.log('Wormhole transition completed!');
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <GalaxyWrapper 
        isWormholeTransition={isWormhole}
        transitionDuration={3000}
        onTransitionComplete={handleTransitionComplete}
      />
      
      <button 
        onClick={handleWormholeToggle}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        Trigger Wormhole Transition
      </button>
    </div>
  );
}