import Link from "next/link";

// Shell for pages outside the journey (the experiment record). The body
// is position:fixed for the journey's scroll system, so these pages
// scroll inside their own container.
export default function RecordShell({ children }) {
  return (
    <div className="record-page">
      <header className="record-header">
        <Link href="/" className="record-back">&larr; journey</Link>
        <nav>
          <Link href="/experiments/">experiments</Link>
          <Link href="/how-i-work/">how I work</Link>
          <a href="/resume.pdf">resume</a>
        </nav>
      </header>
      <main className="record-main">{children}</main>
      <footer className="record-footer">
        <a href="https://github.com/pablomoli">GitHub</a>
        <a href="https://www.linkedin.com/in/pablo-molina-ro/">LinkedIn</a>
        <span className="record-email">pablomolinarojas@gmail.com</span>
      </footer>
    </div>
  );
}
