import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  getSearchBarStyle,
  getSearchViewStyle,
  searchBarRuntime,
  searchBarTokens,
  searchViewTokens,
} from './SearchBar.defaults';

describe('SearchBar defaults', () => {
  it('projects canonical SearchBar/SearchView tokens', () => {
    expect(searchBarTokens).toMatchObject({
      containerColor: token.ComponentSearchBarContainerColor,
      containerHeight: token.ComponentSearchBarContainerHeight,
      containerShape: token.ComponentSearchBarContainerShape,
      inputTextColor: token.ComponentSearchBarInputTextColor,
    });
    expect(searchViewTokens).toMatchObject({
      containerColor: token.ComponentSearchViewContainerColor,
      dockedContainerShape: token.ComponentSearchViewDockedContainerShape,
      dockedHeaderHeight: token.ComponentSearchViewDockedHeaderContainerHeight,
      fullScreenHeaderHeight: token.ComponentSearchViewFullScreenHeaderContainerHeight,
    });
  });

  it('keeps AndroidX renderer constraints beside the consumer', () => {
    expect(searchBarRuntime).toEqual({
      minWidth: 360,
      maxWidth: 720,
      dockedMinHeight: 240,
      dockedMaxHeightScreenRatio: 2 / 3,
      horizontalPadding: 16,
      iconSize: 24,
    });
  });

  it('emits only renderer mechanics after static defaults move to generated CSS', () => {
    const bar = getSearchBarStyle();
    const docked = getSearchViewStyle('docked');
    const fullscreen = getSearchViewStyle('fullscreen');

    expect(bar).toEqual({
      '--_search-min-width': '360px',
      '--_search-max-width': '720px',
      '--_search-horizontal-padding': '16px',
      '--_search-icon-size': '24px',
    });
    expect(docked).toEqual(bar);
    expect(fullscreen).toEqual(bar);
    expect(bar).not.toHaveProperty('--_search-container-color');
    expect(bar).not.toHaveProperty('--_search-expand-duration');
    expect(docked).not.toHaveProperty('--_search-view-header-height');
  });
});
