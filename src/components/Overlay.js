import React, { forwardRef, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import TextPressure from "./TextPressure";

// GSAP Glitch Subtitle Component
function GlitchSubtitle() {
  const subtitles = useMemo(() => [
    "Space Explorer & Developer",
    "Full-Stack Developer",
    "Cosmic Code Creator",
    "Surveyor of Digital Landscapes",
    "Sci-Fi Enthusiast",
    "Builder of Digital Worlds",
    "CAD Drafter",
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef(null);
  const redRef = useRef(null);
  const blueRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });

    subtitles.forEach((subtitle, index) => {
      if (index === 0) {
        // First subtitle - fade in
        tl.set([textRef.current, redRef.current, blueRef.current], {
          opacity: 1,
        }).fromTo(
          textRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
        );
      } else {
        // Quick glitch sequence before changing text
        tl.to([redRef.current, blueRef.current], {
          duration: 0.4,
          x: () => gsap.utils.random(-3, 3),
          y: () => gsap.utils.random(-3, 3),
          ease: "none",
        })
          .to([redRef.current, blueRef.current], {
            duration: 0.4,
            x: () => gsap.utils.random(-5, 5),
            y: () => gsap.utils.random(-3, 3),
            ease: "none",
          })
          .to([redRef.current, blueRef.current], {
            duration: 0.2,
            x: 0,
            y: 0,
            ease: "power2.out",
            onComplete: () => setCurrentIndex(index),
          });
      }

      // Hold for 5 seconds
      if (index < subtitles.length - 1) {
        tl.to({}, { duration: 5 });
      }
    });

    return () => {
      tl.kill();
    };
  }, [subtitles]);

  // Random glitch effect every few seconds
  useEffect(() => {
    const randomGlitch = () => {
      if (redRef.current && blueRef.current) {
        gsap.to([redRef.current, blueRef.current], {
          duration: 0.1,
          x: () => gsap.utils.random(-2, 2),
          y: () => gsap.utils.random(-1, 1),
          ease: "none",
          onComplete: () => {
            gsap.to([redRef.current, blueRef.current], {
              duration: 0.2,
              x: 0,
              y: 0,
              ease: "power2.out",
            });
          },
        });
      }
    };

    const interval = setInterval(randomGlitch, gsap.utils.random(8000, 15000));
    return () => clearInterval(interval);
  }, []);

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

// SVG Icons for Technologies
function getTechIcon(tech) {
  const icons = {
    JavaScript: (
      <svg viewBox="0 0 24 24" fill="#F7DF1E">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
      </svg>
    ),
    TypeScript: (
      <svg viewBox="0 0 24 24" fill="#3178C6">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.302.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.213.776.213 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.372-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
      </svg>
    ),
    Python: (
      <svg viewBox="0 0 24 24" fill="url(#python-gradient)">
        <defs>
          <linearGradient
            id="python-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3776ab" />
            <stop offset="100%" stopColor="#ffd43b" />
          </linearGradient>
        </defs>
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
      </svg>
    ),
    "Node.js": (
      <svg viewBox="0 0 24 24" fill="#68A063">
        <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z" />
      </svg>
    ),
    Blender: (
      <svg viewBox="0 0 24 24" fill="#F5792A">
        <path d="M12.51,0.02 C12.74,0.02 12.98,0.05 13.21,0.12 L20.68,2.24 C21.84,2.54 22.64,3.66 22.64,4.95 L22.64,6.77 C22.64,7.92 22.01,8.95 21.02,9.37 L14.44,12.01 L21.02,14.64 C22.01,15.06 22.64,16.09 22.64,17.24 L22.64,19.06 C22.64,20.35 21.84,21.47 20.68,21.77 L13.21,23.89 C12.41,24.08 11.59,24.08 10.79,23.89 L3.32,21.77 C2.16,21.47 1.36,20.35 1.36,19.06 L1.36,4.95 C1.36,3.66 2.16,2.54 3.32,2.24 L10.79,0.12 C11.36,-0.04 11.95,-0.04 12.51,0.02 z M12,4.5 C9.92,4.5 8.25,6.17 8.25,8.25 C8.25,10.33 9.92,12 12,12 C14.08,12 15.75,10.33 15.75,8.25 C15.75,6.17 14.08,4.5 12,4.5 z M12,15 C10.62,15 9.5,16.12 9.5,17.5 C9.5,18.88 10.62,20 12,20 C13.38,20 14.5,18.88 14.5,17.5 C14.5,16.12 13.38,15 12,15 z" />
      </svg>
    ),
    React: (
      <svg viewBox="0 0 24 24" fill="#61DAFB">
        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.45-.572.905-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.866.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.375-.498-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.355-.493l.006-.003zm1.873 3.497c.2.39.41.783.64 1.175.23.39.465.772.705 1.145-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933l.001-.001zm11.729 0c.255.653.48 1.305.662 1.935-.64.15-1.315.283-2.015.387.24-.377.48-.763.704-1.16.225-.39.435-.782.635-1.174l.014.012zm-5.825 1.744c.16.106.325.232.476.377.103.1.188.213.264.335.663.838.337 1.863-.266 2.448-.451.43-1.083.609-1.674.609-.612 0-1.222-.189-1.697-.639-.332-.314-.598-.764-.616-1.25-.024-.972.796-1.817 1.684-1.817.314 0 .626.066.914.194l.915-.257z" />
      </svg>
    ),
    "Three.js": (
      <svg viewBox="0 0 24 24" fill="#000000">
        <path d="M.38 0h23.24L20.76 24 12 21.82 3.24 24 .38 0zM12 3.43L8.85 4.55l3.15 1.12 3.15-1.12L12 3.43zM7.17 5.48L4.24 6.48l2.93 1 2.93-1-2.93-1zm9.66 0l-2.93 1 2.93 1 2.93-1-2.93-1zM5.73 8.04L3.5 8.84l2.23.8 2.23-.8-2.23-.8zm5.54 0L8.84 8.84l2.43.88 2.43-.88-2.43-.88zm6.46 0l-2.23.8 2.23.8 2.23-.8-2.23-.8zM7.51 10.8l-2.23.8 2.23.8 2.23-.8-2.23-.8zm8.98 0l-2.23.8 2.23.8 2.23-.8-2.23-.8zM12 11.68l-2.43.88 2.43.88 2.43-.88-2.43-.88zM9.29 13.56l-2.23.8 2.23.8 2.23-.8-2.23-.8zm5.42 0l-2.23.8 2.23.8 2.23-.8-2.23-.8zM12 14.44l-2.43.88 2.43.88 2.43-.88-2.43-.88zm-1.22 2.76l-2.23.8 2.23.8 2.23-.8-2.23-.8zm2.44 0l-2.23.8 2.23.8 2.23-.8-2.23-.8z" />
      </svg>
    ),
  };

  return (
    icons[tech] || (
      <svg viewBox="0 0 24 24" fill="#64b5f6">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8">
          {tech.charAt(0)}
        </text>
      </svg>
    )
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
      "Sports enthusiast who finds balance through soccer, boxing, and outdoor adventures",
      "Problem-solver who approaches every challenge with curiosity and persistence",
      "Space exploration fanatic following rocket launches and astronomical discoveries",
      "Advocate for clean code, user experience, and technology that empowers people",
    ],
  },

  {
    id: "university",
    company: "University of Central Florida",
    role: "Computer Science Student",
    period: "AUG 2023 - PRESENT",
    highlights: [
      "Studying algorithms, data structures, and software engineering fundamentals",
      "Maintaining strong academic performance while gaining real-world experience",
      "Participating in hackathons and coding competitions",
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

// Add this data structure for projects
const projects = [
  {
    id: "project1",
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
  {
    id: "project2",
    name: "Epic Map",
    tech: "Flask, Python, JavaScript, PostGIS, Leaflet",
    period: "MAY 2025",
    description:
      "Enterprise surveying job management platform with real-time mapping, advanced search, and workflow automation",
    highlights: [
      "Manages 1000+ surveying jobs across 5 Central Florida counties with enterprise-grade architecture",
      "Reduced job lookup time by 75% through intelligent fuzzy search and real-time filtering",
      "Built interactive mapping with marker clustering, multi-selection, and Google Maps integration",
      "Designed fieldwork tracking with automated time calculation and soft-deletion recovery",
    ],
    links: {
      link: "https://www.linkedin.com/posts/pablo-molina-ro_took-some-time-off-from-designing-my-own-activity-7332954345124069376-gUdu?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADmSf2MBODRgI29MSI00ULMirsuoP2iKSUk",
    },
  },
  // {
  //   id: "project3",
  //   name: "Weather Dashboard",
  //   tech: "React, TypeScript, Chart.js",
  //   period: "AUG 2024",
  //   description: "Weather visualization dashboard with interactive charts",
  //   highlights: [
  //     "Integrated multiple weather APIs for comprehensive data",
  //     "Built interactive charts showing weather trends",
  //     "Implemented location-based weather forecasting",
  //   ],
  //   links: {
  //     github: "https://github.com/yourusername/weather-dashboard",
  //     live: "https://weather-dash.com",
  //   },
  // },
];

// Interactive Experience Component
function ExperienceSection() {
  const [selectedExperience, setSelectedExperience] = useState(experiences[0]);

  return (
    <div className="interactive-section">
      <div className="section-sidebar">
        {experiences.map((exp) => (
          <button
            key={exp.id}
            className={`sidebar-item ${
              selectedExperience.id === exp.id ? "active" : ""
            }`}
            onClick={() => setSelectedExperience(exp)}
          >
            {exp.company}
          </button>
        ))}
      </div>

      <div className="section-content-area">
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

  return (
    <div className="interactive-section">
      <div className="section-sidebar">
        {projects.map((project) => (
          <button
            key={project.id}
            className={`sidebar-item ${
              selectedProject.id === project.id ? "active" : ""
            }`}
            onClick={() => setSelectedProject(project)}
          >
            {project.name}
          </button>
        ))}
      </div>

      <div className="section-content-area">
        <h3 className="project-title">{selectedProject.name}</h3>
        <p className="project-tech">{selectedProject.tech}</p>
        <p className="period">{selectedProject.period}</p>
        <p className="project-description">{selectedProject.description}</p>

        <ul className="highlights-list">
          {selectedProject.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>

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

const sections = [
  {
    id: "hero",
    title: "Pablo Molina",
    subtitle: null, // Will use GlitchSubtitle component instead
    description:
      "Navigate through space to discover more about my journey, projects, and skills.",
  },
  {
    id: "about",
    title: "About Me",
    subtitle: "A constellation of experiences",
    description:
      "Curious student passionate about technology, design, and exploration. My journey began with web development and has led me through various technologies, developing a unique perspective on digital experiences.",
  },
  {
    id: "technologies",
    title: "Tech Meteors",
    subtitle: "Skills & technologies",
    description:
      "A shower of technologies I've worked with along my journey. From frontend frameworks to 3D modeling, each meteor represents a tool in my  arsenal.",
    techs: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Node.js",
      "Blender",
      "React",
      "Three.js",
    ],
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "Mission Logs",
    description: "Discoveries from across the digital universe",
  },
  {
    id: "contact",
    title: "Contact Me",
    subtitle: "Let's establish contact",
    description:
      "Ready to collaborate? Send a signal my way and let's create something extraordinary together.",
    links: [{ name: "Email", url: "mailto:pablomolinarojas@gmail.com" }],
  },
];

const Overlay = forwardRef(function Overlay({ scrollData, style, lenisRef, scrollContainerRef }, ref) {
  const ventureTextRef = useRef(null);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const triggerWormholeAnimation = useCallback(() => {
    setIsScrollLocked(true);
    lenisRef.current?.stop(); // Stop Lenis scroll

    // Disable keyboard navigation
    const handleKeydown = (e) => {
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKeydown);

    // After 3 seconds, reset everything
    setTimeout(() => {
      lenisRef.current?.scrollTo(0, { immediate: true }); // Reset scroll to top
      
      // Reset state
      scrollData.resetToHero();
      setIsScrollLocked(false);
      
      // Re-enable keyboard
      window.removeEventListener('keydown', handleKeydown);
      lenisRef.current?.start(); // Resume Lenis scroll
    }, 3000);
  }, [lenisRef, scrollData]);

  // The main scroll logic is now in page.js, so we just need to check for the trigger
  useEffect(() => {
    const checkWormholeTrigger = () => {
      if (scrollData.extraScrollProgress.current >= 1 && !scrollData.wormholeTriggered) {
        scrollData.triggerWormhole();
        triggerWormholeAnimation();
      }
    };
    // Poll for the trigger condition
    const interval = setInterval(checkWormholeTrigger, 50);
    return () => clearInterval(interval);
  }, [scrollData, scrollData.wormholeTriggered, triggerWormholeAnimation]);

  // Animate "Venture beyond the known" text when entering extra section
  useEffect(() => {
    if (scrollData.scrollPhase === 'extra' && ventureTextRef.current) {
      gsap.fromTo(ventureTextRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1, ease: "power2.out" }
      );
    }
  }, [scrollData.scrollPhase]);

  return (
    <div ref={(el) => {
      if (ref) ref.current = el;
      if (scrollContainerRef) scrollContainerRef.current = el;
    }} className="scroll" style={style}>
      {sections.map((section) => (
        <div key={section.id} className="section" id={section.id}>
          <div className="dot">
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
            {/* Conditional subtitle rendering */}
            {section.id === "hero" ? (
              <GlitchSubtitle />
            ) : (
              section.subtitle && <p className="subtitle">{section.subtitle}</p>
            )}
            <p className="description">{section.description}</p>
            {/* Conditional rendering for interactive sections */}
            {section.id === "about" && <ExperienceSection />}
            {section.id === "projects" && <ProjectsSection />}
            {/* Tech skills */}
            {section.techs && (
              <div className="tech-grid">
                {section.techs.map((tech, idx) => (
                  <div key={idx} className="tech-item-icon" data-tech={tech}>
                    <div className="tech-svg">{getTechIcon(tech)}</div>
                    <span className="tech-tooltip">{tech}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Contact links */}
            {section.links && (
              <div className="contact-section-wrapper">
                <div className="contact-content">
                  <div className="contact-links">
                    {section.links.map((link, idx) => (
                      <a key={idx} href={link.url} className="contact-button">
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="copyright-info">
                  <p>Built and designed by Pablo Molina.</p>
                  <p>All rights reserved. ©</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Extra scroll section for wormhole trigger */}
      <div className="extra-section" style={{ 
        height: '100vh', 
        minHeight: '100vh',
        position: 'relative', 
      }}>
        <div className="venture-text" ref={ventureTextRef} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2rem',
          opacity: 0,
          color: 'rgba(255, 255, 255, 0.8)',
          fontFamily: 'inherit',
          pointerEvents: 'none'
        }}>
          Venture beyond the known...
        </div>
      </div>
    </div>
  );
});

export default Overlay;

