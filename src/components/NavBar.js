import React from "react";

const sections = [
  { id: "hero", name: "Home" },
  { id: "about", name: "About" },
  { id: "projects", name: "Projects" },
  { id: "experiments", name: "Experiments" },
  { id: "hackathons", name: "Hackathons" },
  { id: "contact", name: "Contact" },
];

function NavBar({ currentSection, onNavigate }) {
  const handleSectionClick = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      window.location.hash = `#${sectionId}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-dots">
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`nav-dot ${index === currentSection ? "active" : ""}`}
            onClick={() => handleSectionClick(section.id)}
            aria-label={`Go to ${section.name} section`}
          >
            <span className="nav-label">{section.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
