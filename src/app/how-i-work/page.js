import RecordShell from "../../components/RecordShell";

export const metadata = {
  title: "How I work",
  description:
    "The time I caught my own false positive, and what it changed about how I run experiments.",
};

export default function HowIWork() {
  return (
    <RecordShell>
      <article className="record-article">
        <p className="record-kicker">How I work</p>
        <h1 className="record-title">The win I had to take back</h1>
        <div className="record-prose">
          <p>
            Last July I compared two ways of grouping my notes into trees, ran
            the comparison twice with different random starting points, and got
            a clear winner. I wrote it down as a finding: one algorithm beats
            the other, decisively. It felt like the kind of result you build
            on.
          </p>
          <p>
            Before building on it, I sent the work out for hostile review and
            reran the comparison twenty times instead of twice. The decisive
            margin dissolved. Across all twenty runs the differences between
            the two algorithms spanned zero; my winner had been two lucky
            draws. Worse, the ruler itself was wrong. I had been scoring tree
            structures with a metric built for flat groupings, so it could not
            even see the thing I claimed to measure. Scored properly, with a
            test that respects hierarchy, both algorithms pass and every group
            of notes reproduces well above chance.
          </p>
          <p>
            So the record now says what the twenty runs say. The retraction is
            written next to the original claim, and the algorithm I kept, I
            kept for stated engineering reasons, not for a performance edge
            that never existed.
          </p>
          <p>
            That episode set the loop I still run: write the claim down, hand
            it to a reviewer with no stake in it, then run the experiment that
            settles the disagreement. Four rounds of that loop on the same
            project each changed a conclusion or stopped a flawed step before
            it became permanent. Cheap experiments and flattering metrics
            produce confident wrong answers; the loop is how I catch mine
            before anyone else has to.
          </p>
          <p>
            The five writeups on this site went through the same wringer.
            Where a number did not survive, the correction ships with the
            claim.
          </p>
        </div>
      </article>
    </RecordShell>
  );
}
