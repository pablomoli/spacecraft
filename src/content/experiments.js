// Placeholder copy: MVP drafts from the vault (second-brain/projects/job-search).
// Every entry stays draft: true until Pablo rewrites hook and ending in his own voice.
// Figures quoted in 12/24/40 need verification against the section READMEs before ship.

const RECORD = 'https://github.com/pablomoli/ytk/tree/master/docs/assets';

export const experiments = [
  {
    slug: 'coastlines',
    hook:
      'Where does a knowledge base end? Drawing the border with a yardstick instead of an eye.',
    number: '30',
    title: 'My notes have a coastline',
    featured: true,
    card: '/images/experiments/card-coastlines-named-continents.webp',
    figures: [
      { src: '/images/experiments/coastlines-01-the-planet-unrolled.webp', alt: 'The distance field, Mollweide-projected', caption: 'The distance field on a 0.5 degree grid, Mollweide-projected: brightness is nearness to content, the contour is the coast at the calibrated radius.' },
      { src: '/images/experiments/coastlines-02-the-named-continents.webp', alt: 'Land components labeled by dominant themes', caption: 'Wrap-aware land components, tinted and labeled at their interior poles by the dominant themes of the tiles they carry.' },
      { src: '/images/experiments/coastlines-04-three-coast-rules.webp', alt: 'Three coast rules, same land area', caption: 'Hard-min circles vs softmin metaballs vs seeded warp, land area held constant across all three.' },
      { src: '/images/experiments/coastlines-05-globes-three-rules.webp', alt: 'The three rules on orthographic globes', caption: 'The three coast rules judged where they will live: per-pixel orthographic hemispheres, limb-shaded, one camera.' },
      { src: '/images/experiments/coastlines-06-fbm-and-domain-warp.webp', alt: 'Perlin fBm and domain warp vs value noise', caption: 'The noise step done per the literature: Perlin-gradient fBm and Quilez domain warp against the shipped 2-octave value noise.' },
      { src: '/images/experiments/coastlines-07-the-shuffle-knob.webp', alt: 'Three shuffle seeds, rerolled shorelines', caption: 'The reroll parameter: seeded tangent jitter inside the field computation only. Same clusters, rerolled shorelines; rendered tiles never move.' },
    ],
    deep: {
      title: 'From contour to geography',
      paragraphs: [
        'The parameter-free version first. The map already had an ocean calibration: the 99th percentile of probe gaps from a uniform lattice, 5.09 degrees at 646 notes. Geodesic distance[^4] to the nearest note, contoured at exactly that radius, is a coastline with no bandwidth and no density estimator, nothing to defend. Its honest price is shape: a union of fixed-radius caps, beads of water on glass.',
        'The organic rule replaces the caps without touching the calibration. A softmin metaball field pools nearby notes into landmasses, a seeded domain warp erodes the edges, and Perlin fBm roughens the shoreline[^5]. Every candidate rule is re-leveled to the same 48% land area, so the atlas numbers survive a change of temperament. A lone note stays round under any rule: an isolated note is an atoll.',
        'Measuring the wiggliness needed an instrument correction. Box-counting returns impossible dimensions below 1 on an archipelago, because disconnected islands collapse into single boxes at coarse scales. The committed values use Mandelbrot\'s Richardson divider on the longest single coast: 1.09 to 1.11 across ruler lengths of 1.5 to 12 degrees, against Britain\'s roughly 1.25.',
        'The atlas mechanics: continents are connected components of the land mask, merged across the longitude seam (the seam is where the map was cut open, not a coast), with areas weighted by cos(latitude). Labels sit at each continent\'s interior pole rather than its centroid, because a sprawling landmass centers over someone else\'s ocean. The largest continent carries 29.9% of the land: agentic coding workflows and systems engineering. And there is a reroll knob: seeded tangent jitter inside the field computation only, so the shoreline rerolls while the rendered notes never move.',
      ],
    },
    sectionUrl: `${RECORD}/30-coastlines`,
    paragraphs: [
      'My knowledge base is about 650 notes. Each one is turned into a point on a map[^1], and related notes land near each other, so the whole collection spreads across a sphere like settlements on a planet. That raised a question I could not let go of: where exactly does my knowledge end and emptiness begin?',
      'I refused to draw the border by eye. First I measured how far apart points would sit if they were just sprinkled evenly at random, and used that distance as the yardstick for "empty". Tracing that yardstick around every note gives a shoreline, the same way a depth line on a nautical chart is traced at one fixed depth. Nothing hand-tuned, nothing to defend.',
      'The first version looked like beads of water on glass, a neat circle around every lonely note. So I fixed the shape honestly: I tried three ways of drawing the coast, held the amount of land constant across all three, and measured every adjustment I added[^2]. The final coastline is even wiggly in the same measurable way real ones are, a bit smoother than Britain’s[^3].',
      'The map it draws turned out to be weirdly personal. One supercontinent carries my daily work in coding and engineering. My personal growth themes, discipline and self-taught learning, sit on their own continent dead center, separated from the work landmass by open sea.',
    ],
    footnotes: [
      'An "embedding": software that reads text and produces coordinates, so that similar texts get nearby coordinates.',
      'The techniques come from video game terrain: nearby blobs pool together and edges get roughened so coasts read as geography instead of circles.',
      'Coastline wiggliness is measurable (fractal dimension). Mine came out 1.09; Britain’s is famously about 1.25.',
      'Geodesic distance: distance measured along the sphere\'s surface, the way a flight path curves, rather than in a straight line through it.',
      'Terrain techniques from graphics literature: Perlin\'s gradient-noise fBm (1985, 2002), Musgrave\'s fractal terrain, and Quilez\'s domain warping, which bends the coordinate space before roughening it.',
    ],
  },
  {
    slug: 'the-cone',
    hook:
      'Every note pointed the same way. Most similarity was a shared lean carrying no information.',
    number: '12',
    title: 'Every note points the same way',
    featured: true,
    card: '/images/experiments/card-the-cone.webp',
    figures: [
      { src: '/images/experiments/the-cone-01-the-cone.webp', alt: 'The corpus against an isotropic null', caption: 'The corpus does not fill its sphere: the mean vector is 11x longer than chance allows.' },
      { src: '/images/experiments/the-cone-02-spectrum.webp', alt: 'Participation ratio', caption: 'Participation ratio 104 of 1024: no small set of directions carries the corpus.' },
      { src: '/images/experiments/the-cone-03-dynamic-range.webp', alt: 'Tag z before and after centring', caption: 'Every tag\'s z before and after centring, and the observed similarities behind it.' },
      { src: '/images/experiments/the-cone-04-the-cone-drawn.webp', alt: 'The geometry drawn', caption: 'The geometry itself: the corpus, an isotropic control, and the centred corpus, with the origin marked in each.' },
      { src: '/images/experiments/the-cone-05-gram-matrix.webp', alt: 'Note-to-note similarity', caption: 'All 493 notes against each other, one ordering, two geometries.' },
      { src: '/images/experiments/the-cone-06-angular.webp', alt: 'Angle from the shared direction', caption: 'Angle from the shared direction, against what randomness gives.' },
    ],
    deep: {
      title: 'What the offset was hiding',
      paragraphs: [
        'The numbers behind the lean. As stored, the mean cosine between two notes is +0.259 and the median cosine between two tag centroids is +0.699; the corpus mean vector has length 0.510 where an even spread would give 0.045. After subtracting the mean, note pairs land at -0.002 and tag centroids at -0.057: near orthogonal. This is the anisotropy described for language-model embeddings by Ethayarajh and by Mu and Viswanath[^2], showing up in a personal corpus at full strength.',
        'Removing the shared direction does not leave a low-dimensional remnant. The participation ratio[^3] is 104 of 1024; the top component explains only 4.1% of variance, 30 components reach 41%, and 100 reach 72%. One enormous removable offset, and behind it a genuinely high-dimensional cloud.',
        'Scored against size-matched nulls in each geometry, the mean tag z-score rises from 5.4 to 23.0 after centring, and every one of 69 tags separates from chance where 58 did before. Stripping the leading principal components as well makes things worse, not better: the common mean is the artifact, the top components are signal.',
        'The corrections it forced: a published list of redundant tag pairs survives centring, but the values deflate from about 0.97 to 0.93 and the order reshuffles; the two geometries agree on substance with a rank correlation of only +0.61. One tag flipped its story entirely: reference scored z = -3.4 as stored, apparently anti-coherent, and lands at +0.003 centred. Notes sharing it are simply unrelated: a tag that fails is not one that clusters badly, it is one whose notes have nothing in common.',
        'And the honest downstream result: on the one retrieval-shaped task measured so far, centring gains 1.2 points of tag-match@10 against a registered 2-point bar. It did not clear it. Production search still runs on the stored vectors; the geometry finding stands, the retrieval win is not yet earned.',
      ],
    },
    sectionUrl: `${RECORD}/12-embedding-geometry`,
    paragraphs: [
      'My search engine kept telling me that any two of my notes were somewhat related. A cooking video and a paper on neural networks: somewhat related. That is either a deep truth about me or a broken ruler, and I wanted to know which.',
      'So I measured the shape of the collection itself. If my 493 notes were spread evenly in every direction, their average direction would cancel out to nearly nothing. Instead it came out eleven times longer than chance allows. Every note leans the same way, like a crowd where everyone faces the stage. Most of what any two notes "have in common" is just that shared lean, and since it is the same for all of them, it carries no information at all.',
      'Subtract the lean and the picture changes. Pairs of notes stop looking uniformly friendly, the space turns out to be genuinely roomy[^1], and topics that seemed crowded together move nearly apart. Some similarity numbers I had published earlier dropped once the lean was removed, so the record now carries the corrections next to the original claims.',
      'The lesson I keep from it: before trusting that two things are alike, measure the room they are standing in.',
    ],
    footnotes: [
      'Technically: after centering, the collection uses about 104 effective dimensions of the 1024 available, and the average pair of notes is close to unrelated, which is what an honest ruler should say.',
      'Ethayarajh (2019) and Mu & Viswanath (2018) documented the same anisotropy, a dominant shared direction, in contextual and static word embeddings.',
      'Participation ratio: an effective-dimension count, roughly how many directions the cloud really uses once the variance spectrum is taken into account.',
    ],
  },
  {
    slug: 'native-sae',
    hook:
      'A sparse autoencoder that names real threads in the corpus, and honestly fails the retrieval gate.',
    number: '24',
    title: 'Teaching my search index to explain itself',
    featured: true,
    card: '/images/experiments/card-native-sae-latents.webp',
    figures: [
      { src: '/images/experiments/native-sae-01-native-sae-cost.webp', alt: 'Reconstruction sweep', caption: 'The config sweep: held-out reconstruction cosine across dictionary and latent-count combinations.' },
      { src: '/images/experiments/native-sae-02-latents-and-taste.webp', alt: 'Named latents and the taste regression', caption: 'The most-active named latents with exemplars, and the save-prediction experiment with confound isolation.' },
    ],
    deep: {
      title: 'Pricing the readable index',
      paragraphs: [
        'The discipline first. 16,483 vectors, split by note key so a video\'s segments never straddle train and test. The sweep says small: a 2048-latent dictionary at k=32 reaches 0.825 held-out reconstruction cosine, and doubling the dictionary makes things worse, overfitting 15k training vectors with a larger train-validation gap and an earlier peak. Dead latents are a non-issue; the auxiliary loss keeps over 99.9% alive.',
        'Before measuring the SAE\'s cost, the ruler itself was verified: a numpy mirror of the production ranking reproduced the frozen eval baseline exactly, hit@1 .7115, hit@5 .9038, hit@10 .9423, and every per-bucket cell. Only then was the index swapped for reconstructions. Every configuration fails the gate: hit@5 drops by 0.026 to 0.081 against a tolerance of 0.02, and one in five top-10 results changes. The subtler finding: reconstruction cosine and retrieval faithfulness rank the configurations differently, so a cosine-only sweep would have picked the wrong dictionary.',
        'Are the features real? The dictionary at large is not reproducible: across independent runs only about 9% of latents find a counterpart above 0.8 cosine, and the number is identical whether the data split moves or not, which pins the instability on the optimizer, not the data. The frequently-firing head is different: restricting to the top-100 latents by firing rate and demanding a match against both independent runs gives a mean best-match of 0.762, with half above 0.8. The named features are largely real directions; the long tail is fit noise.',
        'The taste experiment ended in an honest null with a lesson attached. Predicting deliberate saves worked at AUC[^2] 0.771, but the raw embedding solved the same task at 0.978, and the reason is a confound: every deliberate-save in this corpus is Instagram, TikTok or web, and every unrated note is YouTube. The label is the medium. Holding the medium fixed leaves 27 and 19 positives, too few for any feature to keep a stable sign. The output of the experiment is that this corpus cannot currently support the question.',
      ],
    },
    sectionUrl: `${RECORD}/24-native-sae`,
    paragraphs: [
      'My search engine stores every note as a long list of numbers that no human can read. It works, but it cannot tell me what it thinks a note is about. I wanted a translation layer: the same space, but with names.',
      'I trained a small dictionary model[^1] directly on those production numbers, 16,483 of them covering about 5,000 notes. The entries it learned are strikingly concrete: "icon library migration", "multi-agent systems for parallel tasks", "system design interview preparation". These are real threads in what I save and build, recovered from raw numbers with no labels given. Half of the strongest entries showed up again when I retrained from scratch, so they are not one run’s accident.',
      'Then the honest part. I rebuilt the search index through this readable version and ran my own quality gate on it, the same automated check every search change must pass. It failed, clearly, in every configuration I tried: about one in five of the top results goes missing. So the verdict shipped exactly as measured: a readable side channel beside the search engine, not a replacement for it.',
      'I would rather have a translation layer that admits its cost than a pretty demo that hides one.',
    ],
    footnotes: [
      'A sparse autoencoder: it learns a large dictionary of patterns and describes each note using only a handful of them, which is what makes the patterns nameable.',
      'AUC, area under the ROC curve: 0.5 is coin-flip performance, 1.0 is perfect separation.',
    ],
  },
  {
    slug: 'eval-gate',
    hook:
      'A quality alarm that fired on growth was retrained to fire only on breakage. Then sabotaged, to prove it.',
    number: '08',
    title: 'The alarm that cried wolf every day',
    featured: true,
    card: '/images/experiments/card-eval-gate-verdicts.webp',
    figures: [
      { src: '/images/experiments/eval-gate-01-corpus-growth.webp', alt: 'Corpus growth', caption: 'The corpus growing under the gate: every ingest enlarged the haystack the queries were scored against.' },
      { src: '/images/experiments/eval-gate-02-growth-drift-curve.webp', alt: 'Score drift from growth alone', caption: 'Score drift as a pure function of corpus growth, before the freeze: red for bigger, not broken.' },
      { src: '/images/experiments/eval-gate-03-gate-verdicts.webp', alt: 'The acceptance run', caption: 'Frozen scoring on the grown corpus passes; the same run with a deliberately injected regression still fails.' },
    ],
    deep: {
      title: 'The instrument, verified',
      paragraphs: [
        'The diagnosis was retrospective and clean: historical corpus states rebuilt from ingestion timestamps, same embeddings, same code, only the distractor pool varying. The score drop tracks pool size alone. The alarm was measuring growth, not damage.',
        'The freeze pins two things at the moment a baseline is stamped: the query set and the pool of candidate documents that gets scored. New notes remain fully searchable in production; they simply do not join the graded pool until a new baseline is deliberately stamped. Scores become comparable across months.',
        'The acceptance run is the proof the alarm still works: frozen scoring on the grown corpus comes back green, and the same run with a regression deliberately injected into the searchers comes back red, against a tolerance of 0.02 on hit@5[^1].',
        'The gate has since paid rent as an instrument, not just a guard: the native-SAE experiment rebuilt the ranking in a mirror that reproduced this baseline exactly, then used the gate to reject a reconstructed index at every configuration tried. An eval you can hand to another experiment as a trusted ruler is the difference between a test suite and an instrument.',
      ],
    },
    sectionUrl: `${RECORD}/08-eval-gate-freeze`,
    paragraphs: [
      'My knowledge base has an automated quality check: 156 search queries with known right answers, run before every code change, so I cannot accidentally make search worse. One problem. The collection grows every day, and growth alone made the scores drop. The alarm went red when I broke something and red when I simply added notes, which teaches a person to ignore alarms.',
      'The fix was to freeze the exam. The check now scores the same fixed set of questions against the same fixed pool of candidate answers, captured on the day the baseline was stamped. New notes are still searchable; they just do not get graded. Growth stopped moving the score at all.',
      'Then I proved the alarm still works: I deliberately sabotaged the ranking and ran the check. The score collapsed and the gate failed the change, exactly as it should. Passing growth is only half the job; an alarm that passes everything is as useless as one that fails everything.',
      'The check has run before every commit since. Red now means broken, not bigger.',
    ],
    footnotes: [
      'hit@k: the fraction of eval queries whose one correct document appears in the top k results.',
    ],
  },
  {
    slug: 'reuse-ladder',
    hook:
      'Does saved knowledge ever come back? Yes, through a channel built by accident.',
    number: '40',
    title: 'Does my second brain pay rent',
    featured: true,
    card: '/images/experiments/card-reuse-ladder.webp',
    figures: [
      { src: '/images/experiments/reuse-ladder-01-reuse-ladder.webp', alt: 'The evidence ladder and the calendar', caption: 'Left, evidence per note from weakest to strongest: 671 embedded, 153 read in sessions, 57 elective source reads, 1 cited across all 56 briefs. Right, the same sessions on a week axis: the loop closing is a recent habit.' },
    ],
    deep: {
      title: 'Rungs and instruments',
      paragraphs: [
        'Two corrections drive every number. Counting at the observation level undercounts: a session reads a note in one observation and edits code in another, and at that level 49 of 55 read-and-modified events are the vault housekeeping itself. And ritual reads had to be separated from elective ones: ytk sessions are instructed to load wiki and project context at start, so the signal that means captured knowledge was wanted is specifically a read under sources. Pooling ritual with elective inflates reuse roughly threefold, 125 sessions against 45.',
        'The full ladder, weakest claim to strongest: 671 notes embedded; 153 read inside sessions at all; 57 elective source-note reads; 55 served to a genuine search in a 15-day window; 1 cited in a session brief. Across all 56 briefs there are 2 genuine wikilinks, both to the same LinkedIn draft. The rung the design named as strongest evidence is the emptiest, because briefs describe work produced and nothing in the ritual asks what was consulted.',
        'The calendar view adds the uncomfortable timestamp: the 45 elective-read sessions concentrate in the last five weeks, coinciding with the study and library features and heavier agent use. The loop closing is a recent habit, not a steady property of the system. And every bit of this evidence arrived through an accidental instrument: another tool\'s log of which files got read.',
        'Consequences for the event vocabulary: the citation rung stays empty unless the brief ritual asks one question it never asked, a one-line template change that converts the emptiest rung into the strongest at zero cost; and elective-versus-ritual has to be a first-class dimension of any read event, or the threefold inflation comes back.',
      ],
    },
    sectionUrl: `${RECORD}/40-reuse-ladder`,
    paragraphs: [
      'I save a lot: videos, articles, voice memos, all summarized and searchable. The uncomfortable question is whether any of it ever comes back, or whether I built an expensive shelf.',
      'I went looking for evidence in 56 working sessions, arranged on a ladder from weakest proof to strongest. Weakest rung: a note merely exists in the system (671 of those). Stronger: a note was actually opened during real work. Strongest: a note was explicitly cited as the source of something I built.',
      'The answer was yes, with a twist. Knowledge does come back: 45 sessions reached into old notes by choice, and 26 of those fed directly into real work outside the vault. But all of that evidence arrived through a logging channel I never designed for the purpose, a side effect of another tool recording which files got read. The channel I had designed as proof, citations in my end-of-session write-ups, held exactly one citation across all 56. The ritual asked what I produced and never asked what I consulted, so nobody wrote it down.',
      'One line added to the ritual template fixed it. The lesson: if you want to know whether a loop closes, you have to instrument it, because the evidence will not volunteer itself.',
    ],
    footnotes: [],
  },
];

export function getExperiment(slug) {
  return experiments.find((w) => w.slug === slug);
}
