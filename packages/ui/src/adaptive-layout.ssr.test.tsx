import { useRef, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ListDetailPaneScaffold,
  NavigableListDetailPaneScaffold,
  NavigableSupportingPaneScaffold,
  NavigationSuiteScaffold,
  NavigationSuiteScaffoldState,
  PaneAdaptedValue,
  Scaffold,
  SupportingPaneScaffold,
  ThemeProvider,
  ThreePaneScaffold,
  calculatePaneScaffoldDirective,
  calculateWindowAdaptiveInfo,
  listDetailPaneScaffoldOrder,
  useContainerAdaptiveInfo,
  useWindowAdaptiveInfo,
} from './index';

function renderLane10(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

const compactInfo = calculateWindowAdaptiveInfo({ width: 480, height: 800 });
const compactDirective = calculatePaneScaffoldDirective(compactInfo);
const twoPaneValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
} as const;

function AdaptiveProbe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const windowInfo = useWindowAdaptiveInfo({ serverSize: { width: 700, height: 500 } });
  const containerInfo = useContainerAdaptiveInfo(containerRef, {
    serverSize: { width: 900, height: 500 },
  });

  return (
    <div
      ref={containerRef}
      data-window-width-class={windowInfo.windowSizeClass.width}
      data-window-height-class={windowInfo.windowSizeClass.height}
      data-container-width-class={containerInfo.containerSizeClass.width}
      data-container-height-class={containerInfo.containerSizeClass.height}
    />
  );
}

describe('Lane 10 adaptive layout SSR contracts', () => {
  it('keeps Scaffold inner padding as stable CSS references before bar measurement', () => {
    const tree = (
      <Scaffold
        topBar={<div>Top</div>}
        bottomBar={<div>Bottom</div>}
        contentWindowInsets={{ top: 10, right: 12, bottom: 14, left: 16 }}
      >
        {(innerPadding) => (
          <main data-testid="server-scaffold-content" style={innerPadding.style}>
            Body
          </main>
        )}
      </Scaffold>
    );

    const first = renderLane10(tree);
    const second = renderLane10(tree);
    expect(second).toBe(first);
    expect(first).toContain('var(--scaffold-inner-padding-top)');
    expect(first).toContain('var(--scaffold-inner-padding-bottom)');
    expect(first).toContain('--scaffold-inset-top:10px');
    expect(first).toContain('--scaffold-inset-left:16px');
    expect(first).not.toContain('--scaffold-top-bar-height:');
    expect(first).not.toContain('--scaffold-bottom-bar-height:');
  });

  it('renders explicit ThreePane and canonical wrapper role state deterministically', () => {
    const tree = (
      <>
        <ThreePaneScaffold
          aria-label="Server three pane"
          directive={compactDirective}
          value={twoPaneValue}
          paneOrder={listDetailPaneScaffoldOrder}
          primaryPane={<div>Direct primary</div>}
          secondaryPane={<div>Direct secondary</div>}
        />
        <ListDetailPaneScaffold
          aria-label="Server list detail"
          directive={compactDirective}
          value={twoPaneValue}
          listPane={<div>List pane</div>}
          detailPane={<div>Detail pane</div>}
        />
        <SupportingPaneScaffold
          aria-label="Server supporting"
          directive={compactDirective}
          value={twoPaneValue}
          mainPane={<div>Main pane</div>}
          supportingPane={<div>Supporting pane</div>}
        />
      </>
    );

    const first = renderLane10(tree);
    const second = renderLane10(tree);
    expect(second).toBe(first);
    expect(first).toContain('aria-label="Server three pane"');
    expect(first).toContain('data-pane-role="primary"');
    expect(first).toContain('data-pane-role="secondary"');
    expect(first).toContain('Direct primary');
    expect(first).toContain('List pane');
    expect(first).toContain('Detail pane');
    expect(first).toContain('Main pane');
    expect(first).toContain('Supporting pane');
    expect(first).not.toContain('NaN');
  });

  it('renders navigable canonical wrappers from logical initial history without browser history', () => {
    const tree = (
      <>
        <NavigableListDetailPaneScaffold
          directive={compactDirective}
          listPane={<div>Navigable list</div>}
          detailPane={<div>Navigable detail</div>}
        />
        <NavigableSupportingPaneScaffold
          directive={compactDirective}
          mainPane={<div>Navigable main</div>}
          supportingPane={<div>Navigable supporting</div>}
        />
      </>
    );

    const first = renderLane10(tree);
    const second = renderLane10(tree);
    expect(second).toBe(first);
    expect(first).toContain('Navigable list');
    expect(first).toContain('Navigable detail');
    expect(first).toContain('Navigable main');
    expect(first).toContain('Navigable supporting');
    expect(first).not.toContain('window.history');
    expect(first).not.toContain('NaN');
  });

  it('renders NavigationSuite deterministically from explicit adaptive info and state', () => {
    const state = new NavigationSuiteScaffoldState();
    const tree = (
      <NavigationSuiteScaffold
        items={[
          {
            selected: true,
            icon: <span aria-hidden="true">H</span>,
            label: 'Home',
            ariaLabel: 'Home',
          },
        ]}
        adaptiveInfo={compactInfo}
        state={state}
      >
        <main>Navigation body</main>
      </NavigationSuiteScaffold>
    );

    const first = renderLane10(tree);
    const second = renderLane10(tree);
    expect(second).toBe(first);
    expect(first).toContain('data-navigation-suite-type="short-navigation-bar-compact"');
    expect(first).toContain('data-navigation-position="bottom"');
    expect(first).toContain('Navigation body');
    expect(first).toContain('Home');
  });

  it('uses explicit stable server snapshots for window and container adaptive hooks', () => {
    const first = renderLane10(<AdaptiveProbe />);
    const second = renderLane10(<AdaptiveProbe />);
    expect(second).toBe(first);
    expect(first).toContain('data-window-width-class="medium"');
    expect(first).toContain('data-window-height-class="medium"');
    expect(first).toContain('data-container-width-class="expanded"');
    expect(first).toContain('data-container-height-class="medium"');
  });
});
