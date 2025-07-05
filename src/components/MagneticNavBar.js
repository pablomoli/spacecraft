import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const sections = [
  { id: "hero", name: "Home" },
  { id: "about", name: "About" },
  { id: "technologies", name: "Skills" },
  { id: "projects", name: "Projects" },
  { id: "contact", name: "Contact" },
];

function MagneticNavBar({ currentSection }) {
  const navRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const dotRefs = useRef([]);
  const labelRefs = useRef([]);
  const rippleRefs = useRef([]);

  const handleSectionClick = (sectionId, index) => {
    // Create ripple effect
    const ripple = rippleRefs.current[index];
    if (ripple) {
      gsap.set(ripple, { scale: 0, opacity: 0.6 });
      gsap.to(ripple, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    // Navigate to section
    window.location.hash = `#${sectionId}`;
  };

  // Mouse tracking for magnetic effect
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleMouseMove = (e) => {
      const rect = nav.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      // Reset all dot positions
      dotRefs.current.forEach(dot => {
        if (dot) {
          gsap.to(dot, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    };

    nav.addEventListener('mousemove', handleMouseMove);
    nav.addEventListener('mouseenter', handleMouseEnter);
    nav.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nav.removeEventListener('mousemove', handleMouseMove);
      nav.removeEventListener('mouseenter', handleMouseEnter);
      nav.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Magnetic effect
  useEffect(() => {
    if (!isHovering) return;

    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;

      const rect = dot.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      
      const dotCenterX = rect.left - navRect.left + rect.width / 2;
      const dotCenterY = rect.top - navRect.top + rect.height / 2;
      
      const deltaX = mousePos.x - dotCenterX;
      const deltaY = mousePos.y - dotCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      const magneticRadius = 60;
      const magneticStrength = 15;

      if (distance < magneticRadius) {
        const force = (magneticRadius - distance) / magneticRadius;
        const angle = Math.atan2(deltaY, deltaX);
        
        const moveX = Math.cos(angle) * force * magneticStrength;
        const moveY = Math.sin(angle) * force * magneticStrength;

        gsap.to(dot, {
          x: moveX,
          y: moveY,
          duration: 0.2,
          ease: "power2.out"
        });

        // Show label with slide animation
        const label = labelRefs.current[index];
        if (label) {
          gsap.to(label, {
            x: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      } else {
        gsap.to(dot, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });

        // Hide label
        const label = labelRefs.current[index];
        if (label) {
          gsap.to(label, {
            x: -20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      }
    });
  }, [mousePos, isHovering]);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-dots">
        {sections.map((section, index) => (
          <div key={section.id} className="nav-item-container">
            <button
              ref={el => dotRefs.current[index] = el}
              className={`nav-dot magnetic ${index === currentSection ? "active" : ""}`}
              onClick={() => handleSectionClick(section.id, index)}
              aria-label={`Go to ${section.name} section`}
            >
              {/* Ripple effect element */}
              <div 
                ref={el => rippleRefs.current[index] = el}
                className="nav-ripple"
              />
              
              {/* Active pulse effect */}
              {index === currentSection && (
                <div className="nav-pulse" />
              )}
            </button>
            
            {/* Magnetic label */}
            <span 
              ref={el => labelRefs.current[index] = el}
              className="nav-label magnetic-label"
            >
              {section.name}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .navbar {
          position: fixed;
          left: 2rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
        }

        .nav-dots {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nav-item-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .nav-dot.magnetic {
          position: relative;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .nav-dot.magnetic:hover {
          border-color: rgba(100, 181, 246, 0.8);
          box-shadow: 0 0 10px rgba(100, 181, 246, 0.3);
        }

        .nav-dot.magnetic.active {
          background: rgba(100, 181, 246, 0.8);
          border-color: rgba(100, 181, 246, 1);
          box-shadow: 0 0 15px rgba(100, 181, 246, 0.5);
        }

        .nav-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 181, 246, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .nav-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(100, 181, 246, 0.2);
          animation: pulse 2s infinite;
        }

        .magnetic-label {
          position: absolute;
          left: 2rem;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0;
          transform: translateX(-20px);
          pointer-events: none;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(100, 181, 246, 0.3);
          backdrop-filter: blur(10px);
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            left: 1rem;
          }
          
          .nav-dots {
            gap: 1rem;
          }
          
          .nav-dot.magnetic {
            width: 10px;
            height: 10px;
          }
          
          .magnetic-label {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}

export default MagneticNavBar;