import Link from "next/link";
import RecordShell from "../../../components/RecordShell";
import { experiments, getExperiment } from "../../../content/experiments";
import { Prose, Footnotes, DraftNotice } from "../../../components/Prose";

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
      <article className="record-article">
        {e.draft && <DraftNotice />}
        <p className="record-kicker">Experiment {e.number}</p>
        <h1 className="record-title">{e.title}</h1>
        <div className="record-prose">
          <Prose paragraphs={e.paragraphs} slug={e.slug} />
        </div>
        <figure className="record-figure">
          <img src={e.figure.src} alt={e.figure.alt} />
          <figcaption>
            From the section record. Full anatomy and meta line on GitHub.
          </figcaption>
        </figure>
        <a className="record-section-link" href={e.sectionUrl}>
          Read the full section, figures and all.
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
