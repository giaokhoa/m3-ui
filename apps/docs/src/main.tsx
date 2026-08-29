import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  IconButton,
  TopAppBar,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import '@m3-ui/ui/styles.css';
import { DocsSearch } from './DocsSearch';
import { DocsThemeProvider, useDocsTheme } from './DocsThemeProvider';
import { feedbackSearchMdxComponents } from './feedbackSearchMdxComponents';
import { groupedControlMdxComponents } from './groupedControlMdxComponents';
import { getDocsPage } from './lib/source';
import { getMdxComponents } from './mdx';
import './styles.css';

function currentSlugs(): string[] {
  const relative = window.location.pathname
    .replace(/^\/docs\/?/, '')
    .replace(/^\/+|\/+$/g, '');
  return relative ? relative.split('/').filter(Boolean) : [];
}

function ThemeGlyph({ preference }: { preference: 'system' | 'light' | 'dark' }) {
  if (preference === 'system') {
    return (
      <svg viewBox="0 0 24 24">
        <path
          d="M4 5h16v11H4V5Zm-2 0v11c0 1.1.9 2 2 2h6v2H7v2h10v-2h-3v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4C2.9 3 2 3.9 2 5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (preference === 'dark') {
    return (
      <svg viewBox="0 0 24 24">
        <path
          d="M9.37 5.51A7 7 0 0 0 18.49 14.63 7 7 0 1 1 9.37 5.51Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6h1v3h-2V2h1Zm0 17h1v3h-2v-3h1ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm12.02 12.02 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12ZM16.24 6.34l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM4.22 18.36l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DocsPage() {
  const { preference, cyclePreference } = useDocsTheme();
  const page = getDocsPage(currentSlugs());

  if (!page) {
    return (
      <main className="docs-main">
        <h1 style={getMaterialTypeCssProperties('headlineLarge')}>Not found</h1>
        <p style={getMaterialTypeCssProperties('bodyLarge')}>
          This documentation page does not exist.
        </p>
      </main>
    );
  }

  const MDX = page.body;
  const docsMdxComponents = {
    ...feedbackSearchMdxComponents,
    ...groupedControlMdxComponents,
  };

  return (
    <>
      <TopAppBar
        title="m3-ui"
        actions={
          <>
            <DocsSearch />
            <IconButton
              aria-label={`Theme preference: ${preference}. Activate to change.`}
              onPress={cyclePreference}
            >
              <ThemeGlyph preference={preference} />
            </IconButton>
          </>
        }
      />
      <main className="docs-main">
        <article className="docs-article">
          <header className="docs-page-header">
            <h1
              className="docs-page-title"
              style={getMaterialTypeCssProperties('headlineLarge')}
            >
              {page.title}
            </h1>
            {page.description ? (
              <p
                className="docs-page-description"
                style={getMaterialTypeCssProperties('bodyLarge')}
              >
                {page.description}
              </p>
            ) : null}
          </header>
          <MDX components={getMdxComponents(docsMdxComponents)} />
        </article>
      </main>
    </>
  );
}

function App() {
  return (
    <DocsThemeProvider>
      <DocsPage />
    </DocsThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
