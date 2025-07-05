import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/pablomoli",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    color: "#64b5f6"
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/pablo-molina-ro/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "#0077b5"
  },
  {
    name: "Resume",
    url: "/resume.pdf",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2v9.255S12 12 8 12s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h5.5z" />
      </svg>
    ),
    color: "#ff6b6b"
  },
];

function MagneticSocialLinks() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const linkRefs = useRef([]);
  const iconRefs = useRef([]);
  const [mounted, setMounted] = useState(false);

  const handleSocialClick = (url) => {
    if (url.startsWith("/")) {
      window.open(url, "_blank");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Entrance animation
  useEffect(() => {
    setMounted(true);
    
    // Staggered entrance animation
    gsap.fromTo(linkRefs.current, 
      {
        scale: 0,
        opacity: 0,
        rotation: -180
      },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      }
    );
  }, []);

  // Mouse tracking
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

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      // Reset all icons
      linkRefs.current.forEach(link => {
        if (link) {
          gsap.to(link, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
      iconRefs.current.forEach(icon => {
        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Magnetic and pressure effects
  useEffect(() => {
    if (!isHovering || !mounted) return;

    linkRefs.current.forEach((link, index) => {
      if (!link) return;

      const rect = link.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const linkCenterX = rect.left - containerRect.left + rect.width / 2;
      const linkCenterY = rect.top - containerRect.top + rect.height / 2;
      
      const deltaX = mousePos.x - linkCenterX;
      const deltaY = mousePos.y - linkCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      const magneticRadius = 50;
      const magneticStrength = 12;
      const pressureStrength = 0.3;

      if (distance < magneticRadius) {
        const force = (magneticRadius - distance) / magneticRadius;
        const angle = Math.atan2(deltaY, deltaX);
        
        // Magnetic movement (toward cursor)
        const moveX = Math.cos(angle) * force * magneticStrength;
        const moveY = Math.sin(angle) * force * magneticStrength;
        
        // Pressure effect (scale based on proximity)
        const scale = 1 + force * pressureStrength;
        const rotation = force * 15; // Slight rotation

        gsap.to(link, {
          x: moveX,
          y: moveY,
          scale: scale,
          rotation: rotation,
          duration: 0.2,
          ease: "power2.out"
        });

        // Icon orbital motion
        const icon = iconRefs.current[index];
        if (icon) {
          const orbitalRotation = Math.sin(Date.now() * 0.003) * 10 * force;
          gsap.to(icon, {
            rotation: orbitalRotation,
            duration: 0.1,
            ease: "none"
          });
        }
      } else {
        gsap.to(link, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });

        const icon = iconRefs.current[index];
        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      }
    });
  }, [mousePos, isHovering, mounted]);

  return (
    <div className="social-links" ref={containerRef}>
      {socialLinks.map((link, index) => (
        <button
          key={link.name}
          ref={el => linkRefs.current[index] = el}
          className="social-link magnetic"
          onClick={() => handleSocialClick(link.url)}
          aria-label={link.name}
          title={link.name}
          onMouseEnter={() => {
            // Color shift on individual hover
            const linkEl = linkRefs.current[index];
            if (linkEl) {
              gsap.to(linkEl, {
                color: link.color,
                duration: 0.2,
                ease: "power2.out"
              });
            }
          }}
          onMouseLeave={() => {
            // Reset color
            const linkEl = linkRefs.current[index];
            if (linkEl) {
              gsap.to(linkEl, {
                color: "rgba(255, 255, 255, 0.7)",
                duration: 0.3,
                ease: "power2.out"
              });
            }
          }}
        >
          <span 
            className="social-icon" 
            ref={el => iconRefs.current[index] = el}
          >
            {link.icon}
          </span>
          
          {/* Glow effect */}
          <div className="social-glow" />
        </button>
      ))}

      <style>{`
        .social-links {
          position: fixed;
          left: 2rem;
          bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 1000;
        }

        .social-link.magnetic {
          position: relative;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .social-link.magnetic:hover {
          border-color: rgba(100, 181, 246, 0.5);
          box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
        }

        .social-icon {
          position: relative;
          z-index: 2;
          transition: transform 0.2s ease;
        }

        .social-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .social-link.magnetic:hover .social-glow {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .social-links {
            left: 1rem;
            bottom: 1rem;
          }
          
          .social-link.magnetic {
            width: 40px;
            height: 40px;
          }
          
          .social-icon svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
}

export default MagneticSocialLinks;