import Link from "next/link";
import RecordShell from "../../components/RecordShell";
import { experiments } from "../../content/experiments";

export const metadata = {
  title: "Experiments",
  description:
    "Five short writeups from a measured experiment record on a personal knowledge base.",
};

export default function ExperimentsIndex() {
  return (
    <RecordShell>
      <p className="record-kicker">The experiment record</p>
      <h1 className="record-title">Five experiments, short form</h1>
      <p className="record-lede">
        Teasers for the full sections on GitHub. Each one is a question, a
        method, and a measured answer.
      </p>
      <div className="exp-grid">
        {experiments.map((e) => (
          <Link key={e.slug} href={`/experiments/${e.slug}/`} className="exp-card">
            <span className="exp-card-figure">
              <img src={e.card} alt={e.figures[0].alt} loading="lazy" />
            </span>
            <span className="exp-card-kicker">Experiment {e.number}</span>
            <span className="exp-card-title">{e.title}</span>
            <span className="exp-card-hook">{e.hook}</span>
          </Link>
        ))}
      </div>
      <p className="record-aside">
        <Link href="/how-i-work/">How I decide what is real</Link> — the time
        I caught my own false positive.
      </p>
    </RecordShell>
  );
}
