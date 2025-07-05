import { useRef, useState, useMemo } from "react";

export function useScroll() {
  const scrollProgress = useRef(0);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = useMemo(() => ["hero", "about", "technologies", "projects", "contact"], []);

  // Remove automatic scroll adjustment - let users scroll naturally
  // Hash changes will still update URL state but won't force scroll position

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
