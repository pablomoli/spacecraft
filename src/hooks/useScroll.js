import { useRef, useEffect, useState } from "react";

export function useScroll() {
  const scrollProgress = useRef(0);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = ["hero", "about", "technologies", "projects", "contact"];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const sectionIndex = sections.indexOf(hash);

      if (sectionIndex !== -1) {
        // Find the scroll container
        const scrollContainer = document.querySelector(".scroll");
        if (scrollContainer) {
          const targetScroll = sectionIndex * scrollContainer.clientHeight * 2;
          scrollContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Handle initial hash
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [sections]);

  const handleSectionChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
  };

  return {
    scrollProgress,
    currentSection,
    sections,
    handleSectionChange,
  };
}
