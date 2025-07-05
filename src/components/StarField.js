import React, { useRef, useEffect, useMemo } from 'react';

export default function StarField({ count = 200 }) {
  const canvasRef = useRef(null);
  
  // Generate stars with fixed seed for consistent positions
  const stars = useMemo(() => {
    const starArray = [];
    // Use a deterministic approach so stars don't change positions
    for (let i = 0; i < count; i++) {
      // Create deterministic "random" values based on index
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 39.346) * 43758.5453;
      const seed4 = Math.sin(i * 52.123) * 43758.5453;
      
      starArray.push({
        x: (seed1 - Math.floor(seed1)),
        y: (seed2 - Math.floor(seed2)),
        size: Math.abs((seed3 - Math.floor(seed3))) * 2 + 0.5,
        layer: Math.floor(Math.abs((seed4 - Math.floor(seed4))) * 3),
        opacity: 0.4 + Math.abs((seed1 - Math.floor(seed1))) * 0.6
      });
    }
    return starArray;
  }, [count]);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStars();
    };

    // Draw stars once
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all stars
      stars.forEach((star) => {
        const x = star.x * canvas.width;
        const y = star.y * canvas.height;
        
        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines for nearby stars (constellation effect)
      const nearStars = stars.filter(s => s.layer === 2);
      ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
      ctx.lineWidth = 1;
      
      nearStars.forEach((star, i) => {
        nearStars.slice(i + 1).forEach((otherStar) => {
          const x1 = star.x * canvas.width;
          const y1 = star.y * canvas.height;
          const x2 = otherStar.x * canvas.width;
          const y2 = otherStar.y * canvas.height;
          
          const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.8
      }}
    />
  );
}