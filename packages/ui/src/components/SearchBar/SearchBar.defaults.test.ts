import * as token from '@m3/tokens';
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
    expect(searchBarRuntime).toMatchObject({
      minWidth: 360,
      maxWidth: 720,
      dockedMinHeight: 240,
      dockedMaxHeightScreenRatio: 2 / 3,
      horizontalPadding: 16,
      iconSize: 24,
      motion: {
        expand: {
          duration: token.MotionSpringDefaultSpatialDuration,
          easing: token.MotionSpringDefaultSpatialEasing,
        },
      },
    });
  });

  it('emits collapsed and expanded style variables', () => {
    expect(getSearchBarStyle()).toMatchObject({
      '--_search-container-color': token.ComponentSearchBarContainerColor,
      '--_search-container-height': '56px',
      '--_search-min-width': '360px',
      '--_search-max-width': '720px',
      '--_search-expand-duration': token.MotionSpringDefaultSpatialDuration,
      '--_search-expand-easing': token.MotionSpringDefaultSpatialEasing,
    });
    expect(getSearchViewStyle('docked')).toMatchObject({
      '--_search-view-header-height': '56px',
      '--_search-min-width': '360px',
    });
    expect(getSearchViewStyle('fullscreen')).toMatchObject({
      '--_search-view-header-height': '72px',
      '--_search-view-radius': 0,
    });
  });
});
