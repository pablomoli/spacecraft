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
    draft: true,
    figure: {
      src: '/images/experiments/coastlines-named-continents.png',
      card: '/images/experiments/card-coastlines-named-continents.webp',
      alt: 'The knowledge base rendered as a world map with 27 named continents on a dark sphere',
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
    ],
  },
  {
    slug: 'the-cone',
    hook:
      'Every note pointed the same way. Most similarity was a shared lean carrying no information.',
    number: '12',
    title: 'Every note points the same way',
    draft: true,
    figure: {
      src: '/images/experiments/the-cone.png',
      card: '/images/experiments/card-the-cone.webp',
      alt: 'Observed embedding directions forming a narrow cone against an isotropic null',
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
    ],
  },
  {
    slug: 'native-sae',
    hook:
      'A sparse autoencoder that names real threads in the corpus, and honestly fails the retrieval gate.',
    number: '24',
    title: 'Teaching my search index to explain itself',
    draft: true,
    figure: {
      src: '/images/experiments/native-sae-latents.png',
      card: '/images/experiments/card-native-sae-latents.webp',
      alt: 'Named sparse autoencoder latents recovered from production embeddings',
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
    ],
  },
  {
    slug: 'eval-gate',
    hook:
      'A quality alarm that fired on growth was retrained to fire only on breakage. Then sabotaged, to prove it.',
    number: '08',
    title: 'The alarm that cried wolf every day',
    draft: true,
    figure: {
      src: '/images/experiments/eval-gate-verdicts.png',
      card: '/images/experiments/card-eval-gate-verdicts.webp',
      alt: 'Gate verdicts over time: growth passes after the freeze, an injected regression still fails',
    },
    sectionUrl: `${RECORD}/08-eval-gate-freeze`,
    paragraphs: [
      'My knowledge base has an automated quality check: 156 search queries with known right answers, run before every code change, so I cannot accidentally make search worse. One problem. The collection grows every day, and growth alone made the scores drop. The alarm went red when I broke something and red when I simply added notes, which teaches a person to ignore alarms.',
      'The fix was to freeze the exam. The check now scores the same fixed set of questions against the same fixed pool of candidate answers, captured on the day the baseline was stamped. New notes are still searchable; they just do not get graded. Growth stopped moving the score at all.',
      'Then I proved the alarm still works: I deliberately sabotaged the ranking and ran the check. The score collapsed and the gate failed the change, exactly as it should. Passing growth is only half the job; an alarm that passes everything is as useless as one that fails everything.',
      'The check has run before every commit since. Red now means broken, not bigger.',
    ],
    footnotes: [],
  },
  {
    slug: 'reuse-ladder',
    hook:
      'Does saved knowledge ever come back? Yes, through a channel built by accident.',
    number: '40',
    title: 'Does my second brain pay rent',
    draft: true,
    figure: {
      src: '/images/experiments/reuse-ladder.png',
      card: '/images/experiments/card-reuse-ladder.webp',
      alt: 'Evidence ladder from notes that merely exist to notes explicitly cited in shipped work',
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
