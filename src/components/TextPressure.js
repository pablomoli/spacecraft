import React, { useRef, useEffect, useState } from 'react';

export default function TextPressure({ 
  text = "Pablo Molina", 
  strength = 8, 
  radius = 80, 
  className = "",
  style = {},
  ...props 
}) {
  // Reduce strength on mobile devices for better UX
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const adjustedStrength = isMobile ? strength * 0.6 : strength;
  const adjustedRadius = isMobile ? radius * 0.8 : radius;
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const charRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      setMousePos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      // Reset all character positions
      charRefs.current.forEach(char => {
        if (char) {
          char.style.transform = 'translateX(0px) translateY(0px)';
        }
      });
    };

    const handleTouchStart = () => setIsHovering(true);
    const handleTouchEnd = () => {
      setIsHovering(false);
      // Reset all character positions
      charRefs.current.forEach(char => {
        if (char) {
          char.style.transform = 'translateX(0px) translateY(0px)';
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (!isHovering) return;

    charRefs.current.forEach((char, index) => {
      if (!char) return;

      const rect = char.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const charCenterX = rect.left - containerRect.left + rect.width / 2;
      const charCenterY = rect.top - containerRect.top + rect.height / 2;
      
      const deltaX = mousePos.x - charCenterX;
      const deltaY = mousePos.y - charCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < adjustedRadius) {
        const force = (adjustedRadius - distance) / adjustedRadius;
        const angle = Math.atan2(deltaY, deltaX);
        
        const displaceX = -Math.cos(angle) * force * adjustedStrength;
        const displaceY = -Math.sin(angle) * force * adjustedStrength;

        char.style.transform = `translateX(${displaceX}px) translateY(${displaceY}px)`;
        char.style.transition = 'transform 0.1s ease-out';
      } else {
        char.style.transform = 'translateX(0px) translateY(0px)';
        char.style.transition = 'transform 0.3s ease-out';
      }
    });
  }, [mousePos, isHovering, adjustedStrength, adjustedRadius]);

  const characters = text.split('').map((char, index) => (
    <span
      key={index}
      ref={el => charRefs.current[index] = el}
      style={{
        display: 'inline-block',
        position: 'relative',
        whiteSpace: char === ' ' ? 'pre' : 'normal'
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-block',
        cursor: 'default',
        userSelect: 'none',
        ...style
      }}
      {...props}
    >
      {characters}
    </div>
  );
}