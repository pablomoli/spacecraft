# Scroll Snap Redesign: Lenis-Owned Snapping

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the dual CSS-snap + Lenis system with a single Lenis-owned snap that provides magnetic glide with weighted inertia and momentum-based section skipping.

**Architecture:** Remove all CSS scroll-snap properties. Tune Lenis physics for a quartic ease-out curve with longer duration. Add velocity-based snap logic inside the existing `handleScroll` callback that detects deceleration and glides to the nearest section boundary.

**Tech Stack:** Lenis (smooth scroll), GSAP (existing animations), CSS (remove snap properties)

---

### Task 1: Remove CSS Scroll Snap Properties

**Files:**
- Modify: `src/app/globals.css:320` (remove scroll-snap-type)
- Modify: `src/app/globals.css:325-327` (remove scroll-snap-align rule)
- Modify: `src/app/globals.css:331` (remove scroll-snap-align override)

**Step 1: Remove `scroll-snap-type` from `.scroll`**

In `src/app/globals.css`, find the `.scroll` rule and remove the `scroll-snap-type: y proximity;` line.

The rule should go from:
```css
.scroll {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y proximity;
  z-index: 1;
  pointer-events: auto;
}
```

To:
```css
.scroll {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  z-index: 1;
  pointer-events: auto;
}
```

**Step 2: Remove the snap-align rule for section children**

Delete the entire rule block:
```css
.scroll > div:not(.extra-section) {
  scroll-snap-align: start;
}
```

**Step 3: Remove the snap-align override from `.extra-section`**

In the `.extra-section` rule, remove the `scroll-snap-align: none !important;` line. Keep the height properties:

Before:
```css
.extra-section {
  scroll-snap-align: none !important;
  height: 200vh !important;
  min-height: 200vh !important;
}
```

After:
```css
.extra-section {
  height: 200vh !important;
  min-height: 200vh !important;
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Successful build, no errors.

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Remove CSS scroll-snap properties in favor of Lenis-owned snapping"
```

---

### Task 2: Tune Lenis Scroll Physics

**Files:**
- Modify: `src/hooks/useLenis.js:35-36`

**Step 1: Update duration and easing**

In `src/hooks/useLenis.js`, change the Lenis constructor config:

Before:
```js
duration: 1.2,
easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
```

After:
```js
duration: 1.6,
easing: (t) => 1 - Math.pow(1 - t, 4),
```

The quartic ease-out (`1 - (1-t)^4`) starts with momentum and has a long gradual deceleration tail. The 1.6s duration gives weight without sluggishness.

**Step 2: Verify build**

Run: `npm run build`
Expected: Successful build.

**Step 3: Commit**

```bash
git add src/hooks/useLenis.js
git commit -m "Tune Lenis physics: quartic ease-out with 1.6s duration for weighted glide"
```

---

### Task 3: Add Section Offset Caching to measureHeights

**Files:**
- Modify: `src/app/page.js:224-263` (heightMeasurements ref and measureHeights function)

**Step 1: Extend heightMeasurements ref to include snap targets**

In `src/app/page.js`, find the `heightMeasurements` ref initialization at line 225 and add a `sectionOffsets` field:

Before:
```js
const heightMeasurements = useRef({
  normalSectionsHeight: 0,
  extraSectionHeight: 0,
  extraSectionStart: 0,
  isInitialized: false,
});
```

After:
```js
const heightMeasurements = useRef({
  normalSectionsHeight: 0,
  extraSectionHeight: 0,
  extraSectionStart: 0,
  sectionOffsets: [],
  isInitialized: false,
});
```

**Step 2: Populate sectionOffsets in measureHeights**

In the `measureHeights` callback, after the `normalSections.forEach` loop that calculates heights (around line 248-252), build the cumulative offsets array. Add this right after the forEach loop:

```js
// Build cumulative section offsets for snap targets
const offsets = [];
let cumulativeOffset = 0;
sectionHeights.forEach(({ height }) => {
  offsets.push(cumulativeOffset);
  cumulativeOffset += height;
});
```

Then in the cache assignment (line 258), add `sectionOffsets: offsets`:

```js
heightMeasurements.current = {
  normalSectionsHeight: actualNormalSectionsHeight,
  extraSectionHeight,
  extraSectionStart,
  sectionOffsets: offsets,
  isInitialized: true,
};
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Successful build.

**Step 4: Commit**

```bash
git add src/app/page.js
git commit -m "Cache section offsets in heightMeasurements for snap targeting"
```

---

### Task 4: Add Velocity-Based Snap Logic

**Files:**
- Modify: `src/app/page.js` (add refs after line ~303, add snap logic inside handleScroll)

**Step 1: Add snap state refs**

After the existing `throttleRef` (line 303), add refs for tracking snap state:

```js
const snapTimeoutRef = useRef(null);
const isSnappingRef = useRef(false);
const peakVelocityRef = useRef(0);
```

**Step 2: Add snap function**

After the refs, before `handleScroll`, add the snap function:

```js
const SNAP_VELOCITY_THRESHOLD = 0.5;
const SKIP_VELOCITY_THRESHOLD = 3.0;
const SNAP_DEBOUNCE_MS = 100;

const snapToSection = useCallback((scrollTop, velocity) => {
  if (isSnappingRef.current) return;
  if (!heightMeasurements.current.isInitialized) return;

  const { sectionOffsets, extraSectionStart } = heightMeasurements.current;
  if (sectionOffsets.length === 0) return;

  // Skip snap if in extra section territory (wormhole zone)
  if (scrollTop >= extraSectionStart - 100) return;

  // Find nearest section offset
  let nearestIndex = 0;
  let minDistance = Infinity;
  for (let i = 0; i < sectionOffsets.length; i++) {
    const distance = Math.abs(scrollTop - sectionOffsets[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  // Determine scroll direction from velocity sign
  const direction = velocity > 0 ? 1 : -1;

  // If peak velocity exceeded skip threshold, target next section in direction
  let targetIndex = nearestIndex;
  if (Math.abs(peakVelocityRef.current) > SKIP_VELOCITY_THRESHOLD) {
    const skipTarget = nearestIndex + direction;
    if (skipTarget >= 0 && skipTarget < sectionOffsets.length) {
      targetIndex = skipTarget;
    }
  }

  const targetOffset = sectionOffsets[targetIndex];

  // Only snap if we are not already very close to the target
  if (Math.abs(scrollTop - targetOffset) < 5) return;

  isSnappingRef.current = true;

  lenisRef.current?.scrollTo(targetOffset, {
    duration: 1.4,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    onComplete: () => {
      isSnappingRef.current = false;
      peakVelocityRef.current = 0;
    },
  });
}, [lenisRef]);
```

**Step 3: Integrate snap detection into handleScroll**

Inside the existing `handleScroll` callback (line 306), add velocity tracking at the top of the function (after the throttle guard and before height checks), and snap triggering at the end.

At the top, right after `const scrollTop = e.scroll;` (line 313), add:

```js
// Track peak velocity for snap logic
const velocity = e.velocity || 0;
if (Math.abs(velocity) > Math.abs(peakVelocityRef.current)) {
  peakVelocityRef.current = velocity;
}

// Snap detection: when velocity drops below threshold, trigger snap
if (Math.abs(velocity) < SNAP_VELOCITY_THRESHOLD && Math.abs(velocity) > 0.01) {
  if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
  snapTimeoutRef.current = setTimeout(() => {
    snapToSection(scrollTop, velocity);
  }, SNAP_DEBOUNCE_MS);
} else if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
  // User is actively scrolling, cancel any pending snap
  if (snapTimeoutRef.current) {
    clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = null;
  }
  isSnappingRef.current = false;
}
```

**Step 4: Clean up snap timeout on unmount**

Find the existing cleanup `useEffect` that clears `animationTimeoutRef` (or add to the resize cleanup). In the component, ensure `snapTimeoutRef` is cleared on unmount. Add inside an existing cleanup or create one near the other refs:

```js
useEffect(() => {
  return () => {
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
  };
}, []);
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Successful build, no errors.

**Step 6: Manual test**

Run: `npm run dev`

Test these scenarios:
1. Gentle scroll (one wheel tick) -- should glide to nearest section
2. Fast flick -- should skip one section and land on the next
3. Nav dot click -- should work as before (no snap interference)
4. Scroll to bottom -- wormhole should still trigger
5. Resize window -- sections should still snap correctly

**Step 7: Commit**

```bash
git add src/app/page.js
git commit -m "Add velocity-based snap logic: magnetic glide with momentum skip"
```
