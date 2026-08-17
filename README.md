# spacecraft

The site behind [pablomolina.space](https://pablomolina.space): a scroll
journey through a WebGL space scene, carrying my projects and the
experiment record from [ytk](https://github.com/pablomoli/ytk).

## Structure

- `/` — the journey. Six scroll sections over a Three.js Earth with a
  day/night shader and per-section camera shots; a pinned horizontal
  gallery scrubs through five experiment cards; the finale is an OGL
  wormhole into a galaxy.
- `/experiments` — the record: five short writeups, each a question, a
  method, and a measured answer, linking to the long form on GitHub.
- `/how-i-work` — the retraction story: catching my own false positive.

## Stack

Next.js (static export), React Three Fiber + Three.js for the Earth
scene, OGL for the galaxy, GSAP for interface motion, Lenis for scroll
physics. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on
push to main.

## Development

```bash
npm ci
npm run dev      # dev server
npm run build    # static export to out/
```

Useful query params: `?lite=1` renders without WebGL, `?nogalaxy=1`
disables the galaxy layer.
