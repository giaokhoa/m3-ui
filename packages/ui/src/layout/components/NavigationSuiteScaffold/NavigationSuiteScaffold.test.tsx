import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../../theme';
import {
  calculateWindowAdaptiveInfo,
  defaultWindowPosture,
} from '../../adaptive/paneScaffoldDirective';
import { Scaffold } from '../Scaffold';
import {
  NavigationSuiteScaffold,
  NavigationSuiteType,
  calculateNavigationSuiteType,
} from './NavigationSuiteScaffold';
import {
  NavigationSuiteScaffoldState,
  NavigationSuiteScaffoldValue,
} from './NavigationSuiteScaffoldState';

const items = [
  { selected: true, icon: <span>H</span>, label: 'Home', ariaLabel: 'Home' },
  { selected: false, icon: <span>S</span>, label: 'Search', ariaLabel: 'Search' },
];

function renderWithTheme(node: ReactNode) {
  return renderToStaticMarkup(<ThemeProvider mode="light">{node}</ThemeProvider>);
}

function adaptiveInfo(width: number, height: number, isTabletop = false) {
  return calculateWindowAdaptiveInfo(
    { width, height },
    isTabletop
      ? { isTabletop: true, foldingFeatures: [] }
      : defaultWindowPosture,
  );
}

describe('Material 3 NavigationSuiteScaffold', () => {
  it.each([
    [599, 900, false, NavigationSuiteType.ShortNavigationBarCompact],
    [599, 900, true, NavigationSuiteType.ShortNavigationBarCompact],
    [600, 479, false, NavigationSuiteType.ShortNavigationBarMedium],
    [600, 480, false, NavigationSuiteType.WideNavigationRailCollapsed],
    [840, 900, false, NavigationSuiteType.WideNavigationRailCollapsed],
    [1200, 900, false, NavigationSuiteType.WideNavigationRailCollapsed],
    [1600, 900, false, NavigationSuiteType.WideNavigationRailCollapsed],
    [840, 900, true, NavigationSuiteType.ShortNavigationBarMedium],
  ] as const)(
    'maps %sx%s tabletop=%s to %s',
    (width, height, tabletop, expected) => {
      expect(calculateNavigationSuiteType(adaptiveInfo(width, height, tabletop))).toBe(
        expected,
      );
    },
  );

  it('uses compact vertical items and medium horizontal items', () => {
    const compact = renderWithTheme(
      <NavigationSuiteScaffold items={items} adaptiveInfo={adaptiveInfo(599, 900)}>
        Body
      </NavigationSuiteScaffold>,
    );
    expect(compact).toContain('data-navigation-suite-type="short-navigation-bar-compact"');
    expect(compact).toContain('data-icon-position="top"');

    const medium = renderWithTheme(
      <NavigationSuiteScaffold items={items} adaptiveInfo={adaptiveInfo(700, 400)}>
        Body
      </NavigationSuiteScaffold>,
    );
    expect(medium).toContain('data-navigation-suite-type="short-navigation-bar-medium"');
    expect(medium).toContain('data-icon-position="start"');
  });

  it('honors explicit semantic type overrides including expanded wide rail', () => {
    const markup = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(400, 900)}
        navigationSuiteType={NavigationSuiteType.WideNavigationRailExpanded}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(markup).toContain('data-navigation-suite-type="wide-navigation-rail-expanded"');
    expect(markup).toContain('data-expanded="true"');
    expect(markup).toContain('data-navigation-position="start"');
  });

  it('supports the upstream None override without consuming a navigation edge', () => {
    const markup = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(900, 900)}
        navigationSuiteType={NavigationSuiteType.None}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(markup).toContain('data-navigation-suite-type="none"');
    expect(markup).toContain('data-navigation-position="none"');
    expect(markup).not.toContain('navigation-suite-scaffold__navigation');
  });

  it('represents upstream show/hide capability through observable state', () => {
    const state = new NavigationSuiteScaffoldState({
      initialValue: NavigationSuiteScaffoldValue.Hidden,
    });
    const hidden = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(400, 900)}
        state={state}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(hidden).not.toContain('navigation-suite-scaffold__navigation');

    state.show();
    const visible = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(400, 900)}
        state={state}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(visible).toContain('navigation-suite-scaffold__navigation');
  });

  it('keeps RTL on the root so logical start placement mirrors in CSS', () => {
    const markup = renderWithTheme(
      <NavigationSuiteScaffold
        dir="rtl"
        items={items}
        adaptiveInfo={adaptiveInfo(900, 900)}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('data-navigation-position="start"');
  });

  it('composes with Scaffold using the selected occupied edge contract', () => {
    const bottomMarkup = renderWithTheme(
      <NavigationSuiteScaffold items={items} adaptiveInfo={adaptiveInfo(400, 900)}>
        <Scaffold>Body</Scaffold>
      </NavigationSuiteScaffold>,
    );
    const sideMarkup = renderWithTheme(
      <NavigationSuiteScaffold items={items} adaptiveInfo={adaptiveInfo(900, 900)}>
        <Scaffold>Body</Scaffold>
      </NavigationSuiteScaffold>,
    );
    const rtlSideMarkup = renderWithTheme(
      <NavigationSuiteScaffold
        dir="rtl"
        items={items}
        adaptiveInfo={adaptiveInfo(900, 900)}
      >
        <Scaffold>Body</Scaffold>
      </NavigationSuiteScaffold>,
    );

    expect(bottomMarkup).toContain('data-navigation-position="bottom"');
    expect(bottomMarkup).toContain('class="scaffold"');
    expect(sideMarkup).toContain('data-navigation-position="start"');
    expect(sideMarkup).toContain('class="scaffold"');
    expect(rtlSideMarkup).toContain('dir="rtl"');
    expect(rtlSideMarkup).toContain('data-navigation-position="start"');
  });

  it('places the primary action above horizontal navigation with semantic alignment', () => {
    const markup = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(400, 900)}
        primaryAction={<button type="button">Create</button>}
        primaryActionAlignment="center"
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(markup).toContain('navigation-suite-scaffold__bottom-primary-action');
    expect(markup).toContain('data-alignment="center"');
    expect(markup).toContain('Create');
  });

  it('puts the primary action inside vertical navigation headers', () => {
    const markup = renderWithTheme(
      <NavigationSuiteScaffold
        items={items}
        adaptiveInfo={adaptiveInfo(900, 900)}
        primaryAction={<button type="button">Create</button>}
      >
        Body
      </NavigationSuiteScaffold>,
    );
    expect(markup).toContain('wide-navigation-rail__header');
    expect(markup).toContain('Create');
  });
});
