import React, { useRef, useEffect, useState } from 'react';

export default function TextPressure({ 
  text = "Pablo Molina", 
  strength = 8, 
  radius = 80, 
  className = "",
  width = true,
  weight = true,
  widthRange = [0.8, 1.2],    // [min, max] width multiplier
  weightRange = [300, 800],   // [min, max] font weight
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
  const originalFontWeight = useRef(null);

  // Capture original font weight on mount
  useEffect(() => {
    if (containerRef.current && originalFontWeight.current === null) {
      const computedStyle = getComputedStyle(containerRef.current);
      originalFontWeight.current = computedStyle.fontWeight || '400';
    }
  }, []);

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
      // Reset all character positions, width, and weight
      charRefs.current.forEach(char => {
        if (char) {
          let transforms = 'translateX(0px) translateY(0px)';
          if (width) {
            transforms += ' scaleX(1)';
          }
          char.style.transform = transforms;
          
          if (weight) {
            char.style.fontWeight = originalFontWeight.current || '400';
          }
        }
      });
    };

    const handleTouchStart = () => setIsHovering(true);
    const handleTouchEnd = () => {
      setIsHovering(false);
      // Reset all character positions, width, and weight
      charRefs.current.forEach(char => {
        if (char) {
          let transforms = 'translateX(0px) translateY(0px)';
          if (width) {
            transforms += ' scaleX(1)';
          }
          char.style.transform = transforms;
          
          if (weight) {
            char.style.fontWeight = originalFontWeight.current || '400';
          }
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

        // Calculate dynamic width and weight based on proximity
        let transforms = `translateX(${displaceX}px) translateY(${displaceY}px)`;
        
        if (width) {
          const [minWidth, maxWidth] = widthRange;
          const currentWidth = minWidth + (maxWidth - minWidth) * force;
          transforms += ` scaleX(${currentWidth})`;
        }
        
        if (weight) {
          const [minWeight, maxWeight] = weightRange;
          const currentWeight = Math.round(minWeight + (maxWeight - minWeight) * force);
          char.style.fontWeight = currentWeight;
        }

        char.style.transform = transforms;
        char.style.transition = 'transform 0.1s ease-out, font-weight 0.1s ease-out';
      } else {
        let transforms = 'translateX(0px) translateY(0px)';
        
        if (width) {
          transforms += ' scaleX(1)';
        }
        
        if (weight) {
          char.style.fontWeight = originalFontWeight.current || '400';
        }
        
        char.style.transform = transforms;
        char.style.transition = 'transform 0.3s ease-out, font-weight 0.3s ease-out';
      }
    });
  }, [mousePos, isHovering, adjustedStrength, adjustedRadius, width, weight, widthRange, weightRange]);

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
