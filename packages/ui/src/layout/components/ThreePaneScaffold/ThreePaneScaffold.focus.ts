type FocusableElement = Element & {
  tabIndex: number;
  focus: (options?: FocusOptions) => void;
};

const ProgrammaticallyFocusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isFocusableCandidate(element: Element): element is FocusableElement {
  if (!('tabIndex' in element) || typeof element.tabIndex !== 'number') return false;
  if (!('focus' in element) || typeof element.focus !== 'function') return false;
  if (element.getClientRects().length === 0) return false;
  if (!element.matches(ProgrammaticallyFocusableSelector)) return false;
  if (element.matches(':disabled')) return false;
  if (element.closest('[inert]') !== null) return false;
  return true;
}

function collectAccessibleFocusTargets(
  root: Element,
  targets: FocusableElement[],
) {
  for (const child of Array.from(root.children)) {
    if (isFocusableCandidate(child)) {
      // Compose collectAccessibleChildren stops descending once the first
      // focusable FocusTarget is reached on a branch.
      targets.push(child);
    } else {
      collectAccessibleFocusTargets(child, targets);
    }
  }
}

function isRightCandidate(rect: DOMRect, originX: number) {
  // FocusTraversal.isCandidate(Right) for the zero-sized top-left source rect
  // created by findChildCorrespondingToFocusEnter.
  return originX <= rect.left && originX < rect.right;
}

function isInSourceBeam(rect: DOMRect, originY: number) {
  return rect.bottom > originY && rect.top < originY;
}

function beamBeats(
  proposed: DOMRect,
  current: DOMRect,
  originY: number,
) {
  // For horizontal focus directions AndroidX gives an exclusive source-beam
  // candidate priority over every candidate outside the beam.
  return isInSourceBeam(proposed, originY) && !isInSourceBeam(current, originY);
}

function weightedDistance(rect: DOMRect, originX: number, originY: number) {
  // AndroidX converts both distances to Long before squaring.
  const major = Math.trunc(Math.max(0, rect.left - originX));
  const minor = Math.trunc(originY - (rect.top + rect.height / 2));
  return 13 * major * major + minor * minor;
}

function isBetterCandidate(
  proposed: DOMRect,
  current: DOMRect,
  originX: number,
  originY: number,
) {
  if (!isRightCandidate(proposed, originX)) return false;
  if (!isRightCandidate(current, originX)) return true;
  if (beamBeats(proposed, current, originY)) return true;
  if (beamBeats(current, proposed, originY)) return false;
  return (
    weightedDistance(proposed, originX, originY) <
    weightedDistance(current, originX, originY)
  );
}

/**
 * Browser analogue of requesting focus through AndroidX's non-focusable
 * ThreePaneScaffold focusGroup. At the pinned Compose revision,
 * FocusRequester.requestFocus(Enter) maps Enter to a physical Right search
 * from the group's top-left point and focuses a descendant, never the group.
 * Browser candidates are rendered, programmatically focusable descendants,
 * including explicit tabindex="-1" targets outside sequential keyboard
 * navigation. Like Compose collectAccessibleChildren, traversal stops at the
 * first focusable target on each DOM branch.
 */
export function requestPaneDestinationFocus(pane: HTMLElement): boolean {
  const candidates: FocusableElement[] = [];
  collectAccessibleFocusTargets(pane, candidates);

  // AndroidX findChildCorrespondingToFocusEnter skips spatial search entirely
  // when zero or one accessible focus target exists.
  if (candidates.length === 0) return false;
  if (candidates.length === 1) {
    candidates[0]!.focus({ preventScroll: true });
    return true;
  }

  const paneRect = pane.getBoundingClientRect();
  const originX = paneRect.left;
  const originY = paneRect.top;
  let best: FocusableElement | undefined;
  let bestRect: DOMRect | undefined;

  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    if (!isRightCandidate(rect, originX)) continue;
    if (
      bestRect === undefined ||
      isBetterCandidate(rect, bestRect, originX, originY)
    ) {
      best = candidate;
      bestRect = rect;
    }
  }

  if (best === undefined) return false;
  best.focus({ preventScroll: true });
  return true;
}
