# Custom pane transitions

`ThreePaneScaffold.paneTransitions` is the web-native customization surface corresponding to the configurable enter transition, exit transition, and bounds animation spec exposed by Material3 Adaptive `AnimatedPane`.

The ownership boundary stays the same as the default renderer: `adaptive/paneMotion.ts` still chooses *which* pane motion applies and the scaffold measurement engine still owns pane allocation. `paneTransitions` only replaces render-time visual channels or the interpolation timing for an already-selected bounds motion. Omitting the prop uses the existing Material transition engine without modification.

## API

Configuration is keyed by scaffold role:

```tsx
<ListDetailPaneScaffold
  paneTransitions={{
    secondary: {
      enter: {
        durationMs: 420,
        from: { opacity: 0, translateInline: 48 },
        to: { opacity: 1, translateInline: 0 },
      },
      bounds: {
        durationMs: 600,
        easing: (progress) => progress,
      },
    },
  }}
  {...props}
/>
```

`enter` and `exit` can animate `opacity`, logical `translateInline`, and `inlineClipFraction`. Positive `translateInline` moves toward logical inline-end and therefore mirrors automatically in RTL. Missing visual channels are neutral: opacity `1`, inline translation `0`, and unclipped content. A resolver can read `materialFrom` and `materialTo` when an application wants to keep the Material-selected effect but substitute its timing curve.

`bounds` applies only when the existing motion decision is `AnimateBounds`. It interpolates the measured start/end rectangles produced by the normal scaffold layout engine; it cannot replace pane allocation or invent a separate layout. `durationMs` gives the browser renderer a clock for bounds-only custom motion, while `easing` maps normalized progress.

## Timeline and state behavior

- **Seekable state:** custom specs are sampled from the same `ThreePaneScaffoldState.progressFraction` as Material motion. Seeking is deterministic and does not create a second CSS/DOM animation clock.
- **Predictive back:** predictive-back continues to own the scaffold graphics-layer scale. Pane custom specs consume the same seek fraction underneath that layer, so the two mechanisms compose without changing layout measurement.
- **Remeasure:** direct custom motion recalculates start/end geometry from the latest scaffold measurement. Bounds customization still consumes the normal measured rectangles rather than caching application-owned sizes.
- **Mid-transition retarget / visibility interruption:** the renderer captures the exact currently rendered pane frame, including custom opacity/translation/clip/bounds values, before handing the new target to the existing interruption spring machinery. This preserves visual continuity. The browser implementation intentionally does **not** attempt to translate an arbitrary custom easing function into Compose interruption velocity semantics after the retarget; after capture, the existing Material interruption spring owns the continuation.
- **Levitated panes:** the pane motion decision remains modal/levitated when selected by Material. A custom pane enter/exit may replace the pane's visual channels, but the scaffold-owned scrim remains on the Material transition timeline so modal interaction blocking stays coherent.
- **Canonical wrappers:** `ListDetailPaneScaffold` and `SupportingPaneScaffold` inherit `paneTransitions` from `ThreePaneScaffoldProps` and forward it through their existing prop spread. They do not duplicate the motion engine.

## Reduced motion

The library does not silently change Material default timing in response to `prefers-reduced-motion`; doing so would make the no-override path diverge from the pinned Material contract. Applications that choose to reduce or remove pane motion can derive `paneTransitions` from their own media-query/accessibility policy. A zero-duration enter/exit spec with neutral visual states is an explicit snap/opt-out path.

## Unsupported Compose equivalence

The web API intentionally exposes scalar, browser-safe render channels rather than accepting arbitrary DOM mutation or recreating Compose `EnterTransition` / `ExitTransition` objects. Custom easing functions are sampled deterministically from scaffold progress, but their velocity model is not carried through a retarget; continuity is preserved by capturing the rendered frame and handing off to the existing Material interruption spring. This limitation is explicit rather than silently ignored.
