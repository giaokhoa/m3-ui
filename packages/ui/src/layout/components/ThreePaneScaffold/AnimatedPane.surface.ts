const LevitatedContentClass = 'three-pane-scaffold__levitated-content';
const LevitatedPaneClass = 'three-pane-scaffold__pane--levitated';
const ResizeHandlePaneClass = 'three-pane-scaffold__pane--has-resize-handle';

/**
 * Mirrors the root AnimatedPane radius onto the scaffold-owned wrapper used
 * only when a levitated pane has an explicit drag-to-resize handle.
 *
 * AndroidX applies AnimatedPane.shape to the outer AnimatedVisibility, which
 * encloses both the handle and pane content. Without this propagation the web
 * wrapper would keep a rectangular shadow even when AnimatedPane is shaped.
 */
export function syncAnimatedPaneSurfaceShape(element: HTMLDivElement | null) {
  if (element === null) return undefined;

  const content = element.parentElement;
  if (content === null || !content.classList.contains(LevitatedContentClass)) {
    return undefined;
  }

  const surface = content.parentElement;
  if (
    surface === null ||
    !surface.classList.contains(LevitatedPaneClass) ||
    !surface.classList.contains(ResizeHandlePaneClass)
  ) {
    return undefined;
  }

  const previousBorderRadius = surface.style.borderRadius;
  const appliedBorderRadius = element.style.borderRadius;
  surface.style.borderRadius = appliedBorderRadius;

  return () => {
    if (surface.style.borderRadius === appliedBorderRadius) {
      surface.style.borderRadius = previousBorderRadius;
    }
  };
}
