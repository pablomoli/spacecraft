import Link from "next/link";
import RecordShell from "../../components/RecordShell";
import { experiments, externalSections } from "../../content/experiments";
import { GitHubIcon } from "../../components/Icons";

export const metadata = {
  title: "Experiments",
  description:
    "Writeups from the experiment record of ytk, a personal knowledge system.",
  openGraph: {
    title: "The experiment record",
    description:
      "Writeups from the experiment record of ytk, a personal knowledge system.",
    url: "/experiments/",
    siteName: "Pablo Molina",
    type: "website",
    images: [
      {
        url: "/images/experiments/card-coastlines-named-continents.webp",
        width: 900,
        height: 483,
        alt: "Map of note clusters drawn as named continents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ExperimentsIndex() {
  return (
    <RecordShell>
      <p className="record-kicker">ytk</p>
      <h1 className="record-title">The experiment record</h1>
      <p className="record-lede">
        Experiments on my own knowledge system. Each writeup starts plain
        and goes deep; the full sections live on GitHub.
      </p>
      <div className="exp-grid">
        {[...experiments, ...externalSections]
          .sort((a, b) => Number(a.number) - Number(b.number))
          .map((e) =>
            e.slug ? (
              <Link key={e.number} href={`/experiments/${e.slug}/`} className="exp-card">
                <span className="exp-card-figure">
                  <img src={e.card} alt={e.figures[0].alt} loading="lazy" />
                </span>
                <span className="exp-card-kicker">Experiment {e.number}</span>
                <span className="exp-card-title">{e.title}</span>
                <span className="exp-card-hook">{e.hook}</span>
              </Link>
            ) : (
              <a key={e.number} href={e.sectionUrl} className="exp-card exp-card--external">
                <span className="exp-card-figure">
                  <img src={e.card} alt={e.title} loading="lazy" />
                </span>
                <span className="exp-card-kicker">
                  Experiment {e.number}
                  <span className="exp-card-ext" aria-label="Opens the section on GitHub">
                    <GitHubIcon size={13} />
                  </span>
                </span>
                <span className="exp-card-title">{e.title}</span>
                <span className="exp-card-hook">{e.hook}</span>
              </a>
            ),
          )}
      </div>
      <p className="record-aside">
        <Link href="/how-i-work/">How I decide what is real</Link> — the time
        I caught my own false positive.
      </p>
    </RecordShell>
  );
}
