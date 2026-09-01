import React from 'react';
import ReactDOM from 'react-dom/client';
import { getMaterialTypeCssProperties } from '@m3-ui/ui';
import '@m3-ui/ui/styles.css';
import { actionOverflowMdxComponents } from './actionOverflowMdxComponents';
import { appBarToolbarMdxComponents } from './appBarToolbarMdxComponents';
import { carouselSheetMdxComponents } from './carouselSheetMdxComponents';
import { composeUtilityMdxComponents } from './composeUtilityMdxComponents';
import { contentPrimitiveMdxComponents } from './contentPrimitiveMdxComponents';
import { DocsShell } from './DocsShell';
import { DocsThemeProvider } from './DocsThemeProvider';
import { feedbackSearchMdxComponents } from './feedbackSearchMdxComponents';
import { groupedControlMdxComponents } from './groupedControlMdxComponents';
import { getDocsPage } from './lib/source';
import { getMdxComponents } from './mdx';
import { parityMdxComponents } from './parityMdxComponents';
import { pickerMdxComponents } from './pickerMdxComponents';
import { smallPrimitiveMdxComponents } from './smallPrimitiveMdxComponents';
import './styles.css';

function currentSlugs(): string[] {
  const relative = window.location.pathname
    .replace(/^\/docs\/?/, '')
    .replace(/^\/+|\/+$/g, '');
  return relative ? relative.split('/').filter(Boolean) : [];
}

function DocsPage() {
  const page = getDocsPage(currentSlugs());
  const docsMdxComponents = {
    ...feedbackSearchMdxComponents,
    ...groupedControlMdxComponents,
    ...contentPrimitiveMdxComponents,
    ...pickerMdxComponents,
    ...carouselSheetMdxComponents,
    ...composeUtilityMdxComponents,
    ...smallPrimitiveMdxComponents,
    ...appBarToolbarMdxComponents,
    ...actionOverflowMdxComponents,
    ...parityMdxComponents,
  };

  if (!page) {
    return (
      <DocsShell
        description="The requested documentation page does not exist."
        title="Not found"
      >
        <p style={getMaterialTypeCssProperties('bodyLarge')}>
          Use the documentation sidebar or search to continue browsing m3-ui.
        </p>
      </DocsShell>
    );
  }

  const MDX = page.body;
  return (
    <DocsShell description={page.description} title={page.title} toc={page.toc}>
      <MDX components={getMdxComponents(docsMdxComponents)} />
    </DocsShell>
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
