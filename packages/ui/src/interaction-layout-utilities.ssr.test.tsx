import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  HorizontalMultiBrowseCarousel,
  NonInteractiveScrollbar,
  PullToRefresh,
  ScrollField,
  SwipeToDismissBox,
  ThemeProvider,
  VerticalDragHandle,
} from './index';

function renderLane9(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('Lane 9 interaction and layout utility SSR contracts', () => {
  it('renders carousel state deterministically without pretending the server knows viewport geometry', () => {
    const tree = (
      <HorizontalMultiBrowseCarousel
        aria-label="Server carousel"
        itemCount={4}
        preferredItemWidth={186}
      >
        {({ index }) => <span>Item {index + 1}</span>}
      </HorizontalMultiBrowseCarousel>
    );

    const first = renderLane9(tree);
    const second = renderLane9(tree);
    expect(second).toBe(first);
    expect(first).toContain('aria-label="Server carousel"');
    expect(first).toContain('carousel__viewport');
    expect(first).toContain('Item 1');
    expect(first).not.toContain('NaN');
  });

  it('renders pull-to-refresh and swipe-to-dismiss controlled state before browser gestures or measurement', () => {
    const tree = (
      <>
        <PullToRefresh isRefreshing={false} onRefresh={() => {}}>
          <span>Idle content</span>
        </PullToRefresh>
        <PullToRefresh isRefreshing onRefresh={() => {}}>
          <span>Refreshing content</span>
        </PullToRefresh>
        <SwipeToDismissBox
          aria-label="Server dismiss box"
          backgroundContent={<button type="button">Archive</button>}
          value="end-to-start"
        >
          <article>Dismissable content</article>
        </SwipeToDismissBox>
      </>
    );

    const first = renderLane9(tree);
    const second = renderLane9(tree);
    expect(second).toBe(first);
    expect(first).toContain('data-pull-status="idle"');
    expect(first).toContain('data-pull-status="refreshing"');
    expect(first).toContain('role="status"');
    expect(first).toContain('Refreshing');
    expect(first).toContain('data-state="end-to-start"');
    expect(first).toContain('--_swipe-to-dismiss-offset:0px');
    expect(first).not.toContain('NaN');
  });

  it('renders ScrollField and VerticalDragHandle semantics deterministically before local measurement', () => {
    const tree = (
      <>
        <ScrollField
          aria-label="Server scroll field"
          items={['One', 'Two', 'Three', 'Four']}
          selectedIndex={2}
        />
        <VerticalDragHandle
          aria-label="Server resize handle"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={40}
          isDragged
          role="separator"
          tabIndex={0}
        />
      </>
    );

    const first = renderLane9(tree);
    const second = renderLane9(tree);
    expect(second).toBe(first);
    expect(first).toContain('role="spinbutton"');
    expect(first).toContain('aria-valuenow="2"');
    expect(first).toContain('aria-valuetext="Three"');
    expect(first).toContain('data-selected-index="2"');
    expect(first).toContain('role="separator"');
    expect(first).toContain('data-state="dragged"');
    expect(first).not.toContain('NaN');
  });

  it('keeps NonInteractiveScrollbar decorative and geometry-free until browser metrics exist', () => {
    const tree = (
      <div style={{ position: 'relative' }}>
        <NonInteractiveScrollbar
          data-testid="server-scrollbar"
          isFadeEnabled={false}
          orientation="vertical"
        />
      </div>
    );

    const first = renderLane9(tree);
    const second = renderLane9(tree);
    expect(second).toBe(first);
    expect(first).toContain('aria-hidden="true"');
    expect(first).toContain('data-orientation="vertical"');
    expect(first).not.toContain('data-overflow');
    expect(first).not.toContain('tabindex');
    expect(first).not.toContain('NaN');
  });
});
