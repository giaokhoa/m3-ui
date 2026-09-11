'use client';

import { useState, type ComponentType } from 'react';
import { FilledTonalIconButton, IconButton } from '@m3-ui/ui';

type SearchDialogComponent = ComponentType<{ onDismiss: () => void }>;

let searchDialogPromise:
  | Promise<{ DocsSearchDialog: SearchDialogComponent }>
  | undefined;

function loadSearchDialog() {
  searchDialogPromise ??= import('./DocsSearchDialog');
  return searchDialogPromise;
}

export function SearchGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="m19.6 21-6.3-6.3a7.5 7.5 0 1 1 1.4-1.4L21 19.6 19.6 21ZM8.5 14A5.5 5.5 0 1 0 8.5 3a5.5 5.5 0 0 0 0 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DocsSearch({ inRail = false }: { inRail?: boolean }) {
  const [SearchDialog, setSearchDialog] =
    useState<SearchDialogComponent | null>(null);
  const SearchButton = inRail ? FilledTonalIconButton : IconButton;

  const openSearch = () => {
    void loadSearchDialog().then(({ DocsSearchDialog }) => {
      setSearchDialog(() => DocsSearchDialog);
    });
  };

  return (
    <>
      <SearchButton
        aria-label="Search documentation"
        onPress={openSearch}
        shape={inRail ? 'square' : 'round'}
        size={inRail ? 'medium' : 'small'}
      >
        <SearchGlyph />
      </SearchButton>
      {SearchDialog ? (
        <SearchDialog onDismiss={() => setSearchDialog(null)} />
      ) : null}
    </>
  );
}
