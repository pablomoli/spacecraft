import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import TextPressure from "./TextPressure";
import Link from "next/link";
import { experiments } from "../content/experiments";

// GSAP Glitch Subtitle Component
function GlitchSubtitle() {
  const subtitles = useMemo(() => [
    "Software Engineer",
    "Cosmic Code Creator",
    "Surveyor of Digital Landscapes",
    "ML & Retrieval Experimenter",
    "WebGL Tinkerer",
    "Sci-Fi Enthusiast",
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef(null);
  const redRef = useRef(null);
  const blueRef = useRef(null);

  // Motion budget: the glitch fires once on arrival; after that the
  // rotation is a clean 200ms crossfade. Nothing jitters while reading.
  useEffect(() => {
    const tl = gsap.timeline();
    tl.set([textRef.current, redRef.current, blueRef.current], { opacity: 1 })
      .fromTo(textRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" })
      .to([redRef.current, blueRef.current], {
        duration: 0.12,
        x: () => gsap.utils.random(-4, 4),
        y: () => gsap.utils.random(-2, 2),
        ease: "none",
      })
      .to([redRef.current, blueRef.current], {
        duration: 0.18,
        x: 0,
        y: 0,
        ease: "power2.out",
      });

    const rotate = setInterval(() => {
      const layers = [textRef.current, redRef.current, blueRef.current];
      gsap.to(layers, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex((i) => (i + 1) % subtitles.length);
          gsap.to(layers, { opacity: 1, duration: 0.2, ease: "power2.out" });
        },
      });
    }, 5000);

    return () => {
      tl.kill();
      clearInterval(rotate);
    };
  }, [subtitles]);

  return (
    <div className="glitch-container">
      <p ref={textRef} className="subtitle glitch-text-main">
        {subtitles[currentIndex]}
      </p>
      <p ref={redRef} className="subtitle glitch-text-red" aria-hidden="true">
        {subtitles[currentIndex]}
      </p>
      <p ref={blueRef} className="subtitle glitch-text-blue" aria-hidden="true">
        {subtitles[currentIndex]}
      </p>
    </div>
  );
}

const experiences = [
  {
    id: "personal",
    company: "Who I Am",
    role: "Beyond the Code",
    period: "LIFE & PASSIONS",
    highlights: [
      "Avid sci-fi reader exploring worlds from Dune to Annihilation series",
      "Sports enthusiast who finds balance through soccer, mma, and outdoor adventures",
      "Problem-solver who approaches every challenge with curiosity and persistence",
      "Space exploration fanatic following rocket launches and astronomical discoveries",
      "Advocate for clean code, user experience, and technology that empowers curiosity",
    ],
  },

  {
    id: "university",
    company: "University of Central Florida",
    role: "B.S. Computer Science, Math Minor",
    period: "AUG 2023 - MAY 2026",
    highlights: [
      "Graduated with a 3.5 GPA, consistently on the Dean's List",
      "Coursework in Data Structures & Algorithms, Security in Computing, Computer Logic & Organization, and Discrete Structures",
      "Math minor spanning Calculus I-III, Linear Algebra, Differential Equations, and Differential Mathematical Modeling",
      "Active member of Knight Hacks, UCF's competitive hackathon organization",
    ],
  },

  {
    id: "oneethos",
    company: "OneEthos",
    role: "Research & Development Intern",
    period: "AUG 2025 - DEC 2025",
    highlights: [
      "Architected a fraud detection pipeline in Flask with a dashboard to track run history, using a model ensemble to score temporal transaction data",
      "Built a URL shortening service with Next.js and MongoDB to provide marketing with campaign-level click tracking and analytics",
      "Developed and delivered core application features for Green Bank partners across the full stack",
      "Owned end-to-end delivery of internal tools from requirements gathering through deployment in a fast-paced startup environment",
    ],
  },

  {
    id: "company1",
    company: "Epic Surveying",
    role: "CAD Drafter & Instrument Person",
    period: "AUG 2023 - PRESENT",
    highlights: [
      "Utilizing precision surveying equipment to capture accurate field measurements and topographic data",
      "Developing comprehensive technical drawings and site plans through advanced CAD workflows",
      "Analyzing complex blueprints and survey data to ensure dimensional accuracy and compliance",
      "Working closely with design professionals to translate field observations into actionable project revisions",
    ],
  },
];

const hackathons = [
  {
    id: "crisis-averted",
    name: "Crisis Averted",
    award: "3rd Best Overall",
    event: "Hacklytics 2026, Georgia Tech",
    period: "FEB 2026",
    tech: "Databricks, Delta Lake, Google Gemini, ElevenLabs",
    description:
      "Built a 3D geospatial intelligence platform visualizing humanitarian funding gaps on an interactive globe. Engineered data pipelines with Databricks and Delta Lake, and integrated an AI voice agent using Google Gemini and ElevenLabs for natural language crisis exploration.",
  },
  {
    id: "helios-ai",
    name: "Helios AI",
    award: "Best Use of ARM",
    event: "Knight Hacks VIII, UCF",
    period: "NOV 2025",
    tech: "Arduino, Google ADK, React, IoT",
    description:
      "Built an IoT-powered educational platform using Arduinos, servos, and solar cells to demonstrate renewable energy. Developed a real-time dashboard visualizing KPIs and integrated Google ADK for voice interaction.",
  },
];

const projects = [
  {
    id: "ytk",
    name: "ytk",
    tech: "Python, SQLite, embeddings, SAEs, Three.js",
    period: "2026 - PRESENT",
    description:
      "A personal knowledge system treated as a lab: everything I save becomes searchable, mapped, and measured",
    highlights: [
      "40+ numbered experiments on the production corpus, from embedding geometry to a native sparse autoencoder, published with figures and corrections",
      "Retrieval eval gate runs before every commit: 156 frozen queries with known answers; regressions fail the build",
      "The corpus rendered as an explorable galaxy, with coastlines drawn by measured nulls instead of by eye",
    ],
    links: {
      github: "https://github.com/pablomoli/ytk",
    },
  },
  {
    id: "epicmap",
    name: "EpicMap",
    tech: "Leaflet.js, Flask, PostgreSQL/PostGIS, S3, Docker",
    period: "JUN 2025 - PRESENT",
    description:
      "Full-stack field service platform for a land surveying company: map frontend, geospatial API, and self-hosted document storage",
    highlights: [
      "Mobile-first Leaflet.js map interface for real-time field data across 1,000+ job sites in 5 Florida counties",
      "Flask REST API with 50+ endpoints spanning geocoding, job management, crew scheduling, and PostGIS geospatial queries, integrating county ArcGIS, Google Maps, and FEMA flood zone services",
      "Self-hosted S3-compatible document storage on a Synology NAS, with health monitoring on the platform status page",
    ],
    links: {
      link: "https://www.linkedin.com/posts/pablo-molina-ro_took-some-time-off-from-designing-my-own-activity-7332954345124069376-gUdu?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADmSf2MBODRgI29MSI00ULMirsuoP2iKSUk",
    },
  },
  {
    id: "space-portfolio",
    name: "Space Portfolio",
    tech: "React, Three.js, R3F, Blender",
    period: "JUN 2025",
    description:
      "Interactive 3D portfolio website featuring immersive space exploration with scroll-driven animations and responsive design",
    highlights: [
      "Built immersive 3D space scenes using Blender and React Three Fiber with optimized performance",
      "Engineered physics-based scroll animations with smooth camera interpolation",
      "Achieved 60fps performance through texture compression and asset optimization",
    ],
  },
];

function HackathonSection() {
  const [selected, setSelected] = useState(hackathons[0]);

  return (
    <div className="interactive-section">
      <div className="section-sidebar">
        {hackathons.map((hack) => (
          <button
            key={hack.id}
            className={`sidebar-item ${selected.id === hack.id ? "active" : ""}`}
            onClick={() => setSelected(hack)}
          >
            {hack.name}
          </button>
        ))}
      </div>

      <div className="section-content-area" data-lenis-prevent>
        <div className="project-header-row hackathon-header-row">
          <div className="project-header-text">
            <p className="hackathon-award">{selected.award}</p>
            <h3 className="project-title">{selected.name}</h3>
            <p className="hackathon-event">{selected.event}</p>
            <p className="project-tech">{selected.tech}</p>
            <p className="period">{selected.period}</p>
          </div>
          {selected.image && (
            <div className="project-image-container">
              <img
                src={selected.image}
                alt={selected.name}
                className="project-image"
                onError={(e) => { e.currentTarget.closest(".project-image-container").style.display = "none"; }}
              />
            </div>
          )}
        </div>
        <p className="project-description">{selected.description}</p>
      </div>
    </div>
  );
}

// Interactive Experience Component
function ExperienceSection() {
  const [selectedExperience, setSelectedExperience] = useState(experiences[0]);

  return (
    <div className="interactive-section">
      <div className="section-sidebar">
        {experiences.map((exp) => (
          <button
            key={exp.id}
            className={`sidebar-item ${selectedExperience.id === exp.id ? "active" : ""
              }`}
            onClick={() => setSelectedExperience(exp)}
          >
            {exp.company}
          </button>
        ))}
      </div>

      <div className="section-content-area" data-lenis-prevent>
        {selectedExperience.image && (
          <div className="project-image-container">
            <img
              src={selectedExperience.image}
              alt={selectedExperience.company}
              className="project-image"
              onError={(e) => { e.currentTarget.closest(".project-image-container").style.display = "none"; }}
            />
          </div>
        )}
        <h3 className="role-title">
          {selectedExperience.role}
          <br />
          <span className="company-accent">@ {selectedExperience.company}</span>
        </h3>
        <p className="period">{selectedExperience.period}</p>
        <ul className="highlights-list">
          {selectedExperience.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Interactive Projects Component
function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sidebarRefs = useRef([]);
  const contentRef = useRef(null);
  const sidebarContainerRef = useRef(null);
  const highlightRefs = useRef([]);

  useEffect(() => {
    gsap.fromTo(sidebarRefs.current.filter(Boolean),
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.1
      }
    );

    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 }
      );
    }

    gsap.fromTo(highlightRefs.current.filter(Boolean),
      { x: 30, opacity: 0, scale: 0.9 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.06,
        ease: "back.out(1.2)",
        delay: 0.3
      }
    );
  }, []);

  useEffect(() => {
    const container = sidebarContainerRef.current;
    if (!container) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const magneticRadius = 60;
    const magneticStrength = isMobile ? 0 : 6;

    const handleMouseMove = (e) => {
      sidebarRefs.current.forEach((item) => {
        if (!item) return;

        const rect = item.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const itemCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - itemCenterX;
        const deltaY = e.clientY - itemCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < magneticRadius) {
          const force = (magneticRadius - distance) / magneticRadius;
          const angle = Math.atan2(deltaY, deltaX);

          const moveX = Math.cos(angle) * force * magneticStrength;
          const moveY = Math.sin(angle) * force * magneticStrength;

          gsap.to(item, {
            x: moveX,
            y: moveY,
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        } else {
          gsap.to(item, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) return;

    const handleContentHover = (e) => {
      const rect = content.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      gsap.to(content, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000
      });
    };

    const handleContentLeave = () => {
      gsap.to(content, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    content.addEventListener('mousemove', handleContentHover);
    content.addEventListener('mouseleave', handleContentLeave);
    return () => {
      content.removeEventListener('mousemove', handleContentHover);
      content.removeEventListener('mouseleave', handleContentLeave);
    };
  }, []);

  const handleProjectChange = useCallback((newProject) => {
    if (isTransitioning || selectedProject.id === newProject.id) return;

    setIsTransitioning(true);

    gsap.to(highlightRefs.current.filter(Boolean), {
      x: -30,
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      stagger: 0.03,
      ease: "power2.in"
    });

    gsap.to(contentRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setSelectedProject(newProject);
        gsap.fromTo(contentRef.current,
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.25,
            ease: "power2.out",
            onComplete: () => {
              gsap.fromTo(highlightRefs.current.filter(Boolean),
                { x: 30, opacity: 0, scale: 0.9 },
                {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  duration: 0.25,
                  stagger: 0.05,
                  ease: "back.out(1.2)",
                  onComplete: () => setIsTransitioning(false)
                }
              );
            }
          }
        );
      }
    });
  }, [isTransitioning, selectedProject.id]);

  return (
    <div className="interactive-section">
      <div ref={sidebarContainerRef} className="section-sidebar">
        {projects.map((project, index) => (
          <button
            key={project.id}
            ref={(el) => sidebarRefs.current[index] = el}
            className={`sidebar-item ${selectedProject.id === project.id ? "active" : ""
              }`}
            onClick={() => handleProjectChange(project)}
          >
            {project.name}
          </button>
        ))}
      </div>

      <div className="section-content-wrapper">
        <div ref={contentRef} className="section-content-area" data-lenis-prevent>
          <div className="project-header-row">
            {selectedProject.image && (
              <div className="project-image-container">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="project-image"
                  onError={(e) => { e.currentTarget.closest(".project-image-container").style.display = "none"; }}
                />
              </div>
            )}
            <div className="project-header-text">
              <h3 className="project-title">{selectedProject.name}</h3>
              {selectedProject.badge && (
                <p className="project-badge">{selectedProject.badge}</p>
              )}
              <p className="project-tech">{selectedProject.tech}</p>
              <p className="period">{selectedProject.period}</p>
            </div>
          </div>
          <p className="project-description">{selectedProject.description}</p>

          <ul className="highlights-list">
            {selectedProject.highlights.map((highlight, index) => (
              <li key={index} ref={(el) => highlightRefs.current[index] = el}>{highlight}</li>
            ))}
          </ul>
        </div>

        <div className="project-links">
          {selectedProject.links && selectedProject.links.github && (
            <a
              href={selectedProject.links?.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {selectedProject.links && selectedProject.links.link && (
            <a
              href={selectedProject.links?.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


// Pinned horizontal gallery: the sticky .dot pins the rail for the
// section's height while vertical scroll drives the horizontal track.
// No ScrollTrigger: progress derives from the Lenis container itself,
// so the existing snap physics and the rail can't fight.
function ExperimentsRail({ scrollContainerRef, kicker }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth <= 768;
    if (reduce || mobile) return;

    let raf;
    const tick = () => {
      const scroller = scrollContainerRef?.current;
      const track = trackRef.current;
      const wrap = wrapRef.current;
      if (scroller && track && wrap) {
        const sectionEl = wrap.closest(".section");
        const span = sectionEl.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, (scroller.scrollTop - sectionEl.offsetTop) / span));
        const max = Math.max(0, track.scrollWidth - wrap.clientWidth);
        track.style.transform = `translate3d(${-p * max}px, 0, 0)`;
        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollContainerRef]);

  return (
    <div className="exp-rail-wrap" ref={wrapRef}>
      <div className="exp-rail-head">
        <div>
          <p className="panel-kicker exp-rail-kicker">{kicker} / EXPERIMENTS</p>
          <h1 className="exp-rail-title">The record</h1>
          <p className="exp-rail-sub">
            Numbered experiments on my own knowledge base. Figures first;
            each card opens the writeup.
          </p>
        </div>
        <Link href="/experiments/" className="exp-rail-viewall">view all</Link>
      </div>
      <div className="exp-rail" ref={trackRef}>
        {experiments.filter((e) => e.featured).map((e) => (
          <Link key={e.slug} href={`/experiments/${e.slug}/`} className="exp-card exp-card--rail">
            <span className="exp-card-figure">
              <img src={e.card} alt={e.figures[0].alt} loading="lazy" />
            </span>
            <span className="exp-card-kicker">Experiment {e.number}</span>
            <span className="exp-card-title">{e.title}</span>
            <span className="exp-card-hook">{e.hook}</span>
          </Link>
        ))}
      </div>
      <div className="exp-rail-progress">
        <span className="exp-rail-bar-track"><span className="exp-rail-bar" ref={barRef} /></span>
        <span className="exp-rail-count">01&ndash;05</span>
      </div>
    </div>
  );
}

const sections = [
  {
    id: "hero",
    title: "Pablo Molina",
    subtitle: null, // Will use GlitchSubtitle component instead
    description:
      "Scroll to travel. Projects, experiments, and the record of what held up.",
  },
  {
    id: "about",
    title: "About Me",
    subtitle: "A constellation of experiences",
    description:
      "Computer science grad from UCF, working across full-stack systems, ML, and real-time graphics. Most of my recent time goes into ytk, a personal knowledge system, and the experiment record that grew out of it. Before that: geospatial tooling for a land surveying company, a fintech R&D internship, and a lot of hackathons.",
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "Mission Logs",
    description: "Discoveries from across the digital universe",
  },
  {
    id: "experiments",
    title: "Experiments",
    subtitle: "the record",
  },
  {
    id: "hackathons",
    title: "Hackathons",
    subtitle: "Competition Wins",
    description: "",
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "open to SWE / ML roles",
    description:
      "The fastest channel is email.",
    email: "pablomolinarojas@gmail.com",
  },
];

// Plain-text email with client-side copy: always works, nothing to
// validate, and not a mailto scrape target.
function ContactEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const copy = useCallback(() => {
    const confirm = () => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) confirm();
      } finally {
        document.body.removeChild(ta);
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(confirm).catch(fallback);
    } else {
      fallback();
    }
  }, [email]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="contact-email-row">
      <span className="contact-email">{email}</span>
      <button type="button" className="copy-email-button" onClick={copy}>
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

function Overlay({ scrollData, style, lenisRef, scrollContainerRef, ref }) {
  const isAnimatingRef = useRef(false);

  // One-time panel entrance: pre-enter is added by JS (no-JS users never
  // get hidden content), the observer flips to entered on first reveal
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panels = document.querySelectorAll(".section-panel, .exp-rail-head");
    panels.forEach((el) => el.classList.add("pre-enter"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("entered");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    panels.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const animationTimeoutRef = useRef(null);
  const scrollAtBottomTimeoutRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const triggerWormholeAnimation = useCallback(() => {
    // console.log('[Overlay] triggerWormholeAnimation called');
    // Prevent overlapping animations
    if (isAnimatingRef.current) {
      // console.log('[Overlay] Animation already in progress, returning');
      return;
    }

    isAnimatingRef.current = true;
    hasTriggeredRef.current = true;

    // console.log('[Overlay] Stopping Lenis scroll');
    // Stop Lenis scroll during animation
    lenisRef.current?.stop();

    // console.log('[Overlay] Calling scrollData.triggerWormhole()');
    scrollData.triggerWormhole();

    // The animation completion and scroll reset is now handled in page.js
    // via the GSAP timeline's onComplete callback

    // Reset the animation flag after the animation duration
    animationTimeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
      hasTriggeredRef.current = false;
      animationTimeoutRef.current = null;
    }, 2600);
  }, [scrollData, lenisRef]);

  // Monitor scroll progress to auto-trigger at 100%
  useEffect(() => {
    const checkScrollProgress = () => {
      const extraProgress = scrollData.extraScrollProgress?.current ?? 0;
      const scrollPhase = scrollData.scrollPhase;

      // Debug logging
      // if (extraProgress > 0) {
      //   console.log('Extra progress:', extraProgress, 'Phase:', scrollPhase, 'Triggered:', hasTriggeredRef.current);
      // }

      // When user reaches the extra section (even at low progress, since scroll is maxed out)
      // Trigger at 5% since that's the max we can reach when scrollTop equals max scroll
      if (extraProgress >= 0.02 && !hasTriggeredRef.current && !isAnimatingRef.current && scrollPhase === 'extra') {
        // console.log('Triggering wormhole animation at progress:', extraProgress);
        hasTriggeredRef.current = true;
        triggerWormholeAnimation();
      }
    };

    // Check every frame
    const intervalId = setInterval(checkScrollProgress, 16);

    return () => {
      clearInterval(intervalId);
      if (scrollAtBottomTimeoutRef.current) {
        clearTimeout(scrollAtBottomTimeoutRef.current);
      }
    };
  }, [scrollData, triggerWormholeAnimation]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (scrollAtBottomTimeoutRef.current) {
        clearTimeout(scrollAtBottomTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={(el) => {
      if (ref) ref.current = el;
      if (scrollContainerRef) scrollContainerRef.current = el;
    }} className="scroll" style={style}>
      {sections.map((section, sectionIndex) => {
        const sectionBody = (
          <>
            {/* Conditional rendering for interactive sections */}
            {section.id === "about" && <ExperienceSection />}
            {section.id === "projects" && <ProjectsSection />}
            {section.id === "hackathons" && <HackathonSection />}
            {/* Contact email */}
            {section.email && (
              <div className="contact-section-wrapper">
                <ContactEmail email={section.email} />
                <div className="copyright-info">
                  <p>Built and designed by Pablo Molina.</p>
                  <p>All rights reserved. ©</p>
                </div>
              </div>
            )}
          </>
        );

        const title = (
          <h1>
            <TextPressure
              text={section.title}
              strength={8}
              radius={80}
              width={true}
              weight={true}
              widthRange={[0.7, 1.3]}
              weightRange={[200, 900]}
              style={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                color: 'inherit',
                fontFamily: 'inherit'
              }}
            />
          </h1>
        );

        return (
          <div
            key={section.id}
            className={`section${section.id === "experiments" ? " exp-section" : ""}`}
            id={section.id}
          >
            <div className={`dot${section.id === "experiments" ? " dot--rail" : ""}`}>
              {section.id === "experiments" ? (
                <ExperimentsRail
                  scrollContainerRef={scrollContainerRef}
                  kicker={String(sectionIndex).padStart(2, "0")}
                />
              ) : section.id === "hero" ? (
                <>
                  {title}
                  <GlitchSubtitle />
                  <p className="description">{section.description}</p>
                </>
              ) : (
                <div className="section-panel">
                  {title}
                  {section.subtitle && <p className="subtitle">{section.subtitle}</p>}
                  {section.description && <p className="description">{section.description}</p>}
                  {sectionBody}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Extra section - auto-triggers wormhole when user scrolls to bottom */}
      <div className="section extra-section venture-section" style={{
        height: '100vh !important',
        minHeight: '100vh !important',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 2
      }}>
      </div>
    </div>
  );
}

export default Overlay;
