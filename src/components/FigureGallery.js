"use client";

import { useState, useEffect, useCallback } from "react";
import { CloseIcon } from "./Icons";

// Figure stack with click-to-expand: clicking a figure opens it near
// full-viewport with its caption; Esc, backdrop or the button close it.
export default function FigureGallery({ figures }) {
  const [open, setOpen] = useState(null);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && open < figures.length - 1) setOpen(open + 1);
      if (e.key === "ArrowLeft" && open > 0) setOpen(open - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, figures.length, close]);

  return (
    <>
      <div className="record-figures">
        {figures.map((f, i) => (
          <figure key={f.src} className="record-figure">
            <button
              type="button"
              className="figure-expand"
              onClick={() => setOpen(i)}
              aria-label={`Expand figure: ${f.alt}`}
            >
              <img src={f.src} alt={f.alt} loading="lazy" />
            </button>
            <figcaption>{f.caption}</figcaption>
          </figure>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={figures[open].src} alt={figures[open].alt} />
            <figcaption>{figures[open].caption}</figcaption>
          </figure>
          <button type="button" className="lightbox-close" onClick={close} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>
      )}
    </>
  );
}
