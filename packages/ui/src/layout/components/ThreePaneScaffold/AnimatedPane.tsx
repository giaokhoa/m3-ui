import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { syncAnimatedPaneSurfaceShape } from './AnimatedPane.surface';

export interface AnimatedPaneProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Web equivalent of AndroidX AnimatedPane.shape.
   * CSS border-radius is the browser-native shape contract for pane surfaces.
   */
  shape?: CSSProperties['borderRadius'];
}

/**
 * Visual/content root for a pane rendered by ThreePaneScaffold.
 *
 * ThreePaneScaffold owns adaptive measurement and motion. AnimatedPane owns
 * the pane-local clip shape and the levitated shadow surface, mirroring the
 * AndroidX split without translating Compose animation scopes into React.
 */
export function AnimatedPane({
  shape = 0,
  className,
  style,
  ...props
}: AnimatedPaneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // AndroidX applies AnimatedPane.shape to the outer AnimatedVisibility so a
  // levitated drag handle and pane content share one shaped shadow surface.
  // The web scaffold only needs an extra wrapper when an explicit resize
  // handle is present, so mirror the root pane radius onto that wrapper.
  useLayoutEffect(() => syncAnimatedPaneSurfaceShape(rootRef.current));

  return (
    <div
      {...props}
      ref={rootRef}
      className={['animated-pane', className].filter(Boolean).join(' ')}
      style={{ ...style, borderRadius: shape }}
    />
  );
}
