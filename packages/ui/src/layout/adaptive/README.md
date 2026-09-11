# Adaptive pane navigation

`ThreePaneScaffoldNavigator` is the framework-neutral navigation layer for Material 3 adaptive pane scaffolds. It owns logical pane destination history and derives `ThreePaneScaffoldValue` through the existing `calculateThreePaneScaffoldValueFromDirective` implementation; it does not duplicate pane allocation, motion, reflow, levitation or breakpoint logic.

## Canonical navigators

Use `createListDetailPaneScaffoldNavigator()` for List → Detail → Extra flows and `createSupportingPaneScaffoldNavigator()` for Main → Supporting → Extra flows. Their default histories start at List and Main respectively, matching the current AndroidX adaptive-navigation defaults. `NavigableListDetailPaneScaffold` and `NavigableSupportingPaneScaffold` can either consume a caller-owned navigator or create an internal default navigator.

Navigation history is independent from browser history. `navigateTo()`, `canNavigateBack()`, `navigateBack()` and `peekPreviousScaffoldValue()` operate only on pane destinations. The supported back policies mirror the meaningful current AndroidX choices: pop latest, pop until scaffold value changes, pop until the current destination pane changes, and pop until destination content/scaffold value changes. Content-key comparison uses JavaScript identity (`Object.is`) because arbitrary web payloads do not have Kotlin data-class equality semantics.

Directive or window-class changes call `updateConfiguration()` and recalculate the visible scaffold from the same logical history. This is why compact → expanded → compact resizing does not discard the user's navigation position. `isDestinationHistoryAware=false` keeps the complete logical history for back navigation while calculating layout priority from the current destination only.

## Predictive back

Gesture acquisition is deliberately external. A browser shell, native bridge or application can either call `beginPredictiveBack()`, `updatePredictiveBack()`, `cancelPredictiveBack()` and `commitPredictiveBack()` directly, or provide a `PanePredictiveBackSource` to a navigable wrapper. Preview progress seeks the navigator's `MutableThreePaneScaffoldState`; logical history is not popped until commit. Cancel animates back to the current logical scaffold value.

This boundary does not claim that browsers expose a universal predictive-back API. It only defines how a real progress source drives the existing pane motion/graphics state.

## Router adapters

Core adaptive navigation has no React Router, TanStack Router, Next.js or browser-history dependency. A router adapter should own four responsibilities outside this package:

- map routes/deep links to pane destinations and content keys;
- synchronize committed pane navigation with browser history push/pop as appropriate for the application;
- restore deep-linked route state into an initial navigator history/snapshot;
- decide URL ownership and conflict resolution when pane and application navigation happen concurrently.

The adapter should not replace pane history with `window.history`; browser entries and pane-layout destinations are different state machines.

## State restoration

`snapshot()` returns a versioned plain object containing destination history and the history-awareness flag. `restore()` reapplies that logical state against the navigator's current directive and adapt strategies. Applications may JSON-serialize snapshots only when their chosen `contentKey` values are JSON-serializable. Unlike Compose `rememberSaveable`, persistence ownership belongs to the React application (for example session storage, router loader state or another app-state store); the navigator does not write browser storage automatically.
