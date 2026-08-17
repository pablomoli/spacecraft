// Renders draft paragraphs kept as plain strings so copy edits never touch JSX.
// [^n] markers become superscript links into the footnotes list below the figure.

function renderMarkers(text, slug) {
  const parts = text.split(/(\[\^\d+\])/);
  return parts.map((part, i) => {
    const m = part.match(/^\[\^(\d+)\]$/);
    if (!m) return part;
    return (
      <sup key={i} id={`${slug}-ref-${m[1]}`}>
        <a href={`#${slug}-fn-${m[1]}`}>{m[1]}</a>
      </sup>
    );
  });
}

export function Prose({ paragraphs, slug }) {
  return paragraphs.map((p, i) => <p key={i}>{renderMarkers(p, slug)}</p>);
}

export function Footnotes({ footnotes, slug }) {
  if (!footnotes.length) return null;
  return (
    <ol className="footnotes">
      {footnotes.map((note, i) => (
        <li key={i} id={`${slug}-fn-${i + 1}`}>
          {note} <a href={`#${slug}-ref-${i + 1}`} aria-label="Back to text">&#8617;</a>
        </li>
      ))}
    </ol>
  );
}

export function DraftNotice() {
  return (
    <aside className="draft-notice">
      Draft. Placeholder copy pending a rewrite in my own words. Quoted
      figures verified against the section records 2026-08-16.
    </aside>
  );
}
