import { describe, expect, it } from 'vitest';
import { syncAnimatedPaneSurfaceShape } from './AnimatedPane.surface';

function classList(...classes: string[]) {
  return {
    contains: (name: string) => classes.includes(name),
  };
}

function element({
  classes = [],
  borderRadius = '',
  parentElement = null,
}: {
  classes?: string[];
  borderRadius?: string;
  parentElement?: HTMLDivElement | null;
}) {
  return {
    classList: classList(...classes),
    style: { borderRadius },
    parentElement,
  } as unknown as HTMLDivElement;
}

describe('AnimatedPane levitated surface shape', () => {
  it('applies the root pane radius to the explicit resize-handle surface', () => {
    const surface = element({
      classes: [
        'three-pane-scaffold__pane--levitated',
        'three-pane-scaffold__pane--has-resize-handle',
      ],
      borderRadius: '4px',
    });
    const content = element({
      classes: ['three-pane-scaffold__levitated-content'],
      parentElement: surface,
    });
    const pane = element({ borderRadius: '16px', parentElement: content });

    const cleanup = syncAnimatedPaneSurfaceShape(pane);

    expect(surface.style.borderRadius).toBe('16px');
    cleanup?.();
    expect(surface.style.borderRadius).toBe('4px');
  });

  it('does not modify an ordinary levitated pane without the resize wrapper', () => {
    const surface = element({ classes: ['three-pane-scaffold__pane--levitated'] });
    const pane = element({ borderRadius: '16px', parentElement: surface });

    expect(syncAnimatedPaneSurfaceShape(pane)).toBeUndefined();
    expect(surface.style.borderRadius).toBe('');
  });

  it('does not overwrite a newer wrapper radius during cleanup', () => {
    const surface = element({
      classes: [
        'three-pane-scaffold__pane--levitated',
        'three-pane-scaffold__pane--has-resize-handle',
      ],
    });
    const content = element({
      classes: ['three-pane-scaffold__levitated-content'],
      parentElement: surface,
    });
    const pane = element({ borderRadius: '16px', parentElement: content });

    const cleanup = syncAnimatedPaneSurfaceShape(pane);
    surface.style.borderRadius = '24px';
    cleanup?.();

    expect(surface.style.borderRadius).toBe('24px');
  });
});
