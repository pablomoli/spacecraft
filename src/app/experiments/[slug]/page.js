import Link from "next/link";
import RecordShell from "../../../components/RecordShell";
import { experiments, getExperiment } from "../../../content/experiments";
import { Prose, Footnotes } from "../../../components/Prose";
import FigureGallery from "../../../components/FigureGallery";

export function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = getExperiment(slug);
  return { title: e.title };
}

export default async function ExperimentPage({ params }) {
  const { slug } = await params;
  const e = getExperiment(slug);
  const i = experiments.findIndex((x) => x.slug === slug);
  const prev = experiments[i - 1];
  const next = experiments[i + 1];
  return (
    <RecordShell>
      <article className="record-article has-figure">
        <p className="record-kicker">Experiment {e.number}</p>
        <h1 className="record-title">{e.title}</h1>
        <div className="record-prose">
          <Prose paragraphs={e.paragraphs} slug={e.slug} />
        </div>
        <FigureGallery figures={e.figures} />
        {e.deep && (
          <section className="record-deep">
            <h2 className="record-h2">{e.deep.title}</h2>
            <div className="record-prose">
              <Prose paragraphs={e.deep.paragraphs} slug={e.slug} />
            </div>
          </section>
        )}
        <a className="record-section-link" href={e.sectionUrl}>
          The full section on GitHub: scripts, data, and the complete record.
        </a>
        <div className="record-prose">
          <Footnotes footnotes={e.footnotes} slug={e.slug} />
        </div>
        <nav className="record-pager">
          {prev ? (
            <Link href={`/experiments/${prev.slug}/`}>&larr; {prev.title}</Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/experiments/${next.slug}/`}>{next.title} &rarr;</Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </RecordShell>
  );
}
