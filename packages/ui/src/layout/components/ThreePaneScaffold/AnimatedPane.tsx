import type { CSSProperties, HTMLAttributes } from 'react';

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
  return (
    <div
      {...props}
      className={['animated-pane', className].filter(Boolean).join(' ')}
      style={{ ...style, borderRadius: shape }}
    />
  );
}
