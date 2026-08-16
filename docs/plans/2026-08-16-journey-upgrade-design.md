# Journey upgrade — design spec

Approved 2026-08-16 after brainstorm. Supersedes the work-first rework
direction (branch `work-first-rework`, parked as content donor).

## Mission

Keep and upgrade the space-journey portfolio at pablomolina.space. Make
it premium: high-quality text UX, quick animations, personality intact.
Add the ytk experiment record as a first-class section and route. The
site serves the SWE/ML/AI job search; applications never wait on it.

Plan C: polish the current spine now; structure it so a future
Blender-rendered scroll-scrubbed sequence can replace the background
layer without restructuring (the scrub docks into the section timeline).

## Information architecture

```
/                       The journey (single scroll page, six stops)
  1 Hero                name, identity line, starfield + wormhole, magnetic buttons
  2 About               repositioned copy, clamped tab panel
  3 Projects            ytk headline card + others; mono tech chips (skills live here)
  4 Experiments         pinned horizontal gallery of the five record figures
  5 Hackathons          kept, restyled into the panel system
  6 Contact             panel + plain-text email w/ copy-to-clipboard; magnetic buttons stay
/experiments/           Index: five cards, static grid; footer link to /how-i-work/
/experiments/<slug>/    coastlines, the-cone, native-sae, eval-gate, reuse-ladder
/how-i-work/            The clustering-retraction story (no journey stop)
/resume.pdf             Synced from ~/Developer/resume (V7)
```

- No standalone skills section (badge walls read junior; evidence or
  nothing — vault note: "Relentlessly glazing the best dev portfolio").
- Experiment pages: prev/next links, persistent "back to journey" link.
- Journey sections are an ordered timeline with explicit scroll ranges
  (section N owns [a,b]); the future scrub replaces the background per
  range, panels and ranges survive.

## Visual system

**Split contract.** Every journey section declares which zone the 3D
scene owns and which the panel owns; the camera frames the scene around
the reserved zone. Sections alternate sides. Text never sits raw on the
scene. Mobile: scene becomes a framed backdrop band, panel full-column.

**Panel anatomy** (one component everywhere):
- Surface `rgba(8,8,10,0.72)` + backdrop blur; contrast guaranteed
- Frame: 1px `#2e2e36`; one instrument detail only — short accent tick
  top-left (echo of the record figures' header rule). No rivets, no
  brackets, no scanlines.
- Fixed dimensions per breakpoint; content swaps clamped (crossfade
  inside, never resize). The About tab layout-shift bug dies as a class.

**Typography.**
- Display/headings: Space Grotesk (site's existing voice)
- Meta/labels/kickers/dates/chips: monospace (systematize the existing
  `AUG 2023 — PRESENT` whisper)
- Long-form prose on /experiments/<slug>/ and /how-i-work/: CMU Serif
  (vendored woff2, `src/fonts/`) — the record's face appears exactly
  when the reader enters the record
- Left-aligned text, real scale (label/heading/body/meta), ~60ch measure

**Color semantics.**
- Journey UI accent: the site's space blue/cyan
- Gold `#f2b950` reserved: means "the experiment record" (gallery
  kicker, experiment-page accents, record links). Nothing else is gold.
- Red reserved for verdict lines inside figures (already baked in PNGs)

**Motion budget.** Micro-interactions 150-250ms, tight easing. Only
journey-scale transitions (camera, section snaps, wormhole) run long,
on the existing Lenis physics. Glitch effect: one-shot on hero arrival
only. Nothing loops while a user reads.

## Experiments gallery (journey stop 4)

- GSAP ScrollTrigger pins the section; vertical scroll scrubs a
  horizontal tween across five cards. Pin releases naturally at both
  ends — no scroll hijack loops.
- Card: figure-dominant, mono kicker (`EXPERIMENT 30`), Grotesk title,
  one-line hook, gold tick. Click → /experiments/<slug>/.
- Progress rail 1-5, mono-labeled. "View all" → /experiments/.
- Keyboard arrows work while pinned. `prefers-reduced-motion`: plain
  vertical stack of the same cards.
- Perf: cards use downscaled WebP derivatives (~100-150KB), lazy-loaded;
  full PNGs only on experiment pages.

## Content

- **About**: engineer-who-measures positioning; ytk in one breath
  (built a knowledge system, ran 40+ numbered experiments, published
  corrections). One capability line naming domains (ML/evals, systems,
  graphics) — prose, not badges. History stays in tabs (Epic Surveying,
  UCF), reframed.
- **Projects**: ytk headline card (two sentences, galaxy demo link,
  experiments cross-link, GitHub, mono tech chips). Demo recording
  slots in when made. Existing projects restyled; cull list decided at
  build time with Pablo.
- **Experiment pages**: donor content from `work-first-rework`
  (`src/content/experiments.js`), restyled to the new skin. Draft
  banners stay until Pablo red-pens. GitHub links use `master`.
- **Contact**: panel + written-out plain-text email with client-side
  copy-to-clipboard (no form). Magnetic buttons remain, untouched.
- All new copy ships draft-marked. Quoted figures (11x, 104/1024,
  one-in-five, 671/45/26 ladder) verified against section READMEs
  before anything goes live.

## Engineering

- Branch `journey-upgrade` from main (worktree
  `~/Developer/spacecraft.journey-upgrade`).
- Build order:
  1. Foundations — design tokens, panel component, typography wiring
  2. Journey recomposition — About, Projects, Hackathons, Contact into
     the split/panel system; layout-shift fixes
  3. Experiments — gallery section, /experiments/ routes, /how-i-work/
  4. Motion polish — budget enforcement, hero one-shot, section snaps
- Rendered screenshot checkpoints at every stage (headless Chromium),
  judged by eye before advancing. Mobile + reduced-motion included.
- `next build` green at every step. RAM checked before heavy runs.
- Ship gate: nothing merges to main without explicit go; draft banners
  ship only if knowingly accepted.

## Out of scope (tracked, not built now)

- Blender scrub sequence (structure reserves its slot)
- ytk demo screen recording (Projects slot reserved)
- Hosted map export
- ESLint 9 flat-config migration (pre-existing breakage; separate fix)
