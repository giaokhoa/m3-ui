import { describe, expect, it } from 'vitest';
import { createContainerSizeStore } from './containerAdaptiveStore';

function createMeasuredElement(initialWidth: number, initialHeight: number) {
  let width = initialWidth;
  let height = initialHeight;
  const element = {
    getBoundingClientRect: () => ({ width, height }),
  } as unknown as Element;

  return {
    element,
    setSize(nextWidth: number, nextHeight: number) {
      width = nextWidth;
      height = nextHeight;
    },
  };
}

describe('container adaptive size store', () => {
  it('starts at zero without touching browser-only APIs', () => {
    const store = createContainerSizeStore({ createResizeObserver: null });
    expect(store.getSnapshot()).toEqual({ width: 0, height: 0 });
    expect(() => store.subscribe(() => {})()).not.toThrow();
  });

  it('observes the current target, updates on resize, and suppresses duplicate sizes', () => {
    const measured = createMeasuredElement(599, 480);
    let resizeCallback: ((entries: readonly ResizeObserverEntry[]) => void) | undefined;
    const observed: Array<{ target: Element; options?: ResizeObserverOptions }> = [];
    let disconnectCount = 0;
    let notificationCount = 0;

    const store = createContainerSizeStore({
      createResizeObserver: (callback) => {
        resizeCallback = callback;
        return {
          observe(target, options) {
            observed.push({ target, options });
          },
          disconnect() {
            disconnectCount += 1;
          },
        };
      },
    });
    const unsubscribe = store.subscribe(() => {
      notificationCount += 1;
    });

    store.setTarget(measured.element);
    expect(store.getSnapshot()).toEqual({ width: 599, height: 480 });
    expect(observed).toEqual([
      { target: measured.element, options: { box: 'border-box' } },
    ]);

    measured.setSize(840, 900);
    resizeCallback?.([{ target: measured.element } as ResizeObserverEntry]);
    expect(store.getSnapshot()).toEqual({ width: 840, height: 900 });
    expect(notificationCount).toBe(2);

    resizeCallback?.([{ target: measured.element } as ResizeObserverEntry]);
    expect(notificationCount).toBe(2);

    unsubscribe();
    expect(disconnectCount).toBe(1);
  });

  it('disconnects the old observer and ignores stale entries when the ref target changes', () => {
    const first = createMeasuredElement(520, 600);
    const second = createMeasuredElement(920, 600);
    const callbacks: Array<(entries: readonly ResizeObserverEntry[]) => void> = [];
    const observed: Element[] = [];
    let disconnectCount = 0;

    const store = createContainerSizeStore({
      createResizeObserver: (callback) => {
        callbacks.push(callback);
        return {
          observe(target) {
            observed.push(target);
          },
          disconnect() {
            disconnectCount += 1;
          },
        };
      },
    });
    const unsubscribe = store.subscribe(() => {});

    store.setTarget(first.element);
    store.setTarget(second.element);

    expect(disconnectCount).toBe(1);
    expect(observed).toEqual([first.element, second.element]);
    expect(store.getSnapshot()).toEqual({ width: 920, height: 600 });

    first.setSize(1600, 600);
    callbacks[0]?.([{ target: first.element } as ResizeObserverEntry]);
    expect(store.getSnapshot()).toEqual({ width: 920, height: 600 });

    second.setSize(1200, 600);
    callbacks[1]?.([{ target: second.element } as ResizeObserverEntry]);
    expect(store.getSnapshot()).toEqual({ width: 1200, height: 600 });

    store.setTarget(null);
    expect(disconnectCount).toBe(2);
    expect(store.getSnapshot()).toEqual({ width: 0, height: 0 });

    unsubscribe();
  });
});
