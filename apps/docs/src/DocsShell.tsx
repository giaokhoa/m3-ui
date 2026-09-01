import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  IconButton,
  ModalDrawerSheet,
  ModalNavigationDrawer,
  PermanentDrawerSheet,
  PermanentNavigationDrawer,
  TopAppBar,
  getMaterialTypeCssProperties,
  useDrawerState,
} from '@m3-ui/ui';
import { Scaffold, useWindowAdaptiveInfo } from '@m3-ui/ui/layout';
import {
  AnchorProvider,
  TOCItem,
  type TOCItemType,
} from 'fumadocs-core/toc';
import docsNavigationData from './generated/docs-navigation.json';
import { DocsSearch } from './DocsSearch';
import { useDocsTheme } from './DocsThemeProvider';
import './docs-shell.css';

interface DocsNavPage {
  type: 'page';
  name: string;
  url: string;
  description?: string;
}

interface DocsNavFolder {
  type: 'folder';
  name: string;
  index?: DocsNavPage;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: DocsNavNode[];
}

interface DocsNavSeparator {
  type: 'separator';
  name?: string;
}

type DocsNavNode = DocsNavPage | DocsNavFolder | DocsNavSeparator;

interface DocsNavigation {
  name: string;
  children: DocsNavNode[];
}

interface DocsTrailItem {
  name: string;
  url?: string;
}

export interface DocsShellProps {
  title: ReactNode;
  description?: ReactNode;
  toc?: readonly TOCItemType[];
  children: ReactNode;
}

const docsNavigation = docsNavigationData as unknown as DocsNavigation;

function normalizePath(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

function MenuGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" fill="currentColor" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" fill="currentColor" />
    </svg>
  );
}

function ThemeGlyph({ preference }: { preference: 'system' | 'light' | 'dark' }) {
  if (preference === 'system') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M4 5h16v11H4V5Zm-2 0v11c0 1.1.9 2 2 2h6v2H7v2h10v-2h-3v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4C2.9 3 2 3.9 2 5Z" fill="currentColor" />
      </svg>
    );
  }

  if (preference === 'dark') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M9.37 5.51A7 7 0 0 0 18.49 14.63 7 7 0 1 1 9.37 5.51Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6h1v3h-2V2h1Zm0 17h1v3h-2v-3h1ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm12.02 12.02 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12ZM16.24 6.34l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM4.22 18.36l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42Z" fill="currentColor" />
    </svg>
  );
}

function nodeContainsPath(node: DocsNavNode, currentPath: string): boolean {
  if (node.type === 'page') return normalizePath(node.url) === currentPath;
  if (node.type === 'separator') return false;
  if (node.index && normalizePath(node.index.url) === currentPath) return true;
  return node.children.some((child) => nodeContainsPath(child, currentPath));
}

function flattenPages(nodes: readonly DocsNavNode[]): DocsNavPage[] {
  const pages: DocsNavPage[] = [];
  for (const node of nodes) {
    if (node.type === 'page') {
      pages.push(node);
    } else if (node.type === 'folder') {
      if (node.index) pages.push(node.index);
      pages.push(...flattenPages(node.children));
    }
  }
  return pages;
}

function uniquePages(nodes: readonly DocsNavNode[]): DocsNavPage[] {
  const seen = new Set<string>();
  return flattenPages(nodes).filter((page) => {
    const path = normalizePath(page.url);
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

function findTrail(
  nodes: readonly DocsNavNode[],
  currentPath: string,
): DocsTrailItem[] | undefined {
  for (const node of nodes) {
    if (node.type === 'page' && normalizePath(node.url) === currentPath) {
      return [{ name: node.name, url: node.url }];
    }
    if (node.type !== 'folder') continue;

    const folder: DocsTrailItem = node.index
      ? { name: node.name, url: node.index.url }
      : { name: node.name };
    if (node.index && normalizePath(node.index.url) === currentPath) {
      return [folder];
    }
    const childTrail = findTrail(node.children, currentPath);
    if (childTrail) return [folder, ...childTrail];
  }
  return undefined;
}

function NavLink({
  page,
  currentPath,
  onNavigate,
  overview = false,
}: {
  page: DocsNavPage;
  currentPath: string;
  onNavigate?: () => void;
  overview?: boolean;
}) {
  const active = normalizePath(page.url) === currentPath;
  return (
    <a
      aria-current={active ? 'page' : undefined}
      className="docs-nav__link"
      href={page.url}
      onClick={onNavigate}
      style={getMaterialTypeCssProperties('labelLarge')}
      title={page.description}
    >
      {overview ? 'Overview' : page.name}
    </a>
  );
}

function NavFolder({
  node,
  currentPath,
  onNavigate,
  depth,
  index,
}: {
  node: DocsNavFolder;
  currentPath: string;
  onNavigate?: () => void;
  depth: number;
  index: number;
}) {
  const activeFolder = nodeContainsPath(node, currentPath);
  const [open, setOpen] = useState(Boolean(node.defaultOpen || activeFolder));

  useEffect(() => {
    if (activeFolder) setOpen(true);
  }, [activeFolder]);

  const body = (
    <div className="docs-nav__folder-body">
      {node.index ? (
        <NavLink
          currentPath={currentPath}
          onNavigate={onNavigate}
          overview={node.index.name === node.name}
          page={node.index}
        />
      ) : null}
      <NavNodes
        currentPath={currentPath}
        depth={depth + 1}
        nodes={node.children}
        onNavigate={onNavigate}
      />
    </div>
  );

  if (node.collapsible === false) {
    return (
      <section className="docs-nav__folder" key={`folder-${node.name}-${index}`}>
        <div
          className="docs-nav__folder-label"
          style={getMaterialTypeCssProperties('titleSmall')}
        >
          {node.name}
        </div>
        {body}
      </section>
    );
  }

  return (
    <details
      className="docs-nav__folder"
      key={`folder-${node.name}-${index}`}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      open={open}
    >
      <summary
        className="docs-nav__folder-summary"
        style={getMaterialTypeCssProperties('titleSmall')}
      >
        {node.name}
      </summary>
      {body}
    </details>
  );
}

function NavNodes({
  nodes,
  currentPath,
  onNavigate,
  depth = 0,
}: {
  nodes: readonly DocsNavNode[];
  currentPath: string;
  onNavigate?: () => void;
  depth?: number;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === 'separator') {
          return node.name ? (
            <div
              className="docs-nav__separator"
              key={`separator-${depth}-${node.name}-${index}`}
              style={getMaterialTypeCssProperties('labelSmall')}
            >
              {node.name}
            </div>
          ) : null;
        }

        if (node.type === 'page') {
          return (
            <NavLink
              currentPath={currentPath}
              key={node.url}
              onNavigate={onNavigate}
              page={node}
            />
          );
        }

        return (
          <NavFolder
            currentPath={currentPath}
            depth={depth}
            index={index}
            key={`folder-${node.name}-${index}`}
            node={node}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
  );
}

function DocsSidebar({
  currentPath,
  onNavigate,
  onClose,
}: {
  currentPath: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="docs-sidebar__content">
      <div className="docs-sidebar__header">
        <a className="docs-sidebar__brand" href="/docs" onClick={onNavigate}>
          <span style={getMaterialTypeCssProperties('titleLarge')}>m3-ui</span>
          <span
            className="docs-sidebar__brand-subtitle"
            style={getMaterialTypeCssProperties('labelMedium')}
          >
            Documentation
          </span>
        </a>
        {onClose ? (
          <IconButton aria-label="Close navigation" onPress={onClose}>
            <CloseGlyph />
          </IconButton>
        ) : null}
      </div>
      <nav aria-label="Documentation" className="docs-nav">
        <NavNodes
          currentPath={currentPath}
          nodes={docsNavigation.children}
          onNavigate={onNavigate}
        />
      </nav>
    </div>
  );
}

function Breadcrumbs({ currentPath }: { currentPath: string }) {
  if (currentPath === '/docs') return null;
  const trail = findTrail(docsNavigation.children, currentPath) ?? [];
  const labelStyle = getMaterialTypeCssProperties('labelMedium');

  return (
    <nav aria-label="Breadcrumb" className="docs-breadcrumbs">
      <ol>
        <li>
          <a href="/docs" style={labelStyle}>Docs</a>
        </li>
        {trail.map((item, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={`${item.name}-${index}`}>
              {current || !item.url ? (
                <span
                  aria-current={current ? 'page' : undefined}
                  style={labelStyle}
                >
                  {item.name}
                </span>
              ) : (
                <a href={item.url} style={labelStyle}>{item.name}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PageNavigation({ currentPath }: { currentPath: string }) {
  const pages = useMemo(() => uniquePages(docsNavigation.children), []);
  const currentIndex = pages.findIndex(
    (page) => normalizePath(page.url) === currentPath,
  );
  if (currentIndex < 0) return null;

  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];
  if (!previous && !next) return null;

  return (
    <nav aria-label="Previous and next pages" className="docs-page-navigation">
      {previous ? (
        <a className="docs-page-navigation__link" href={previous.url} rel="prev">
          <span style={getMaterialTypeCssProperties('labelMedium')}>Previous</span>
          <strong style={getMaterialTypeCssProperties('titleMedium')}>
            {previous.name}
          </strong>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a
          className="docs-page-navigation__link docs-page-navigation__link--next"
          href={next.url}
          rel="next"
        >
          <span style={getMaterialTypeCssProperties('labelMedium')}>Next</span>
          <strong style={getMaterialTypeCssProperties('titleMedium')}>
            {next.name}
          </strong>
        </a>
      ) : null}
    </nav>
  );
}

function PageToc({ toc }: { toc: readonly TOCItemType[] }) {
  if (toc.length === 0) return null;
  return (
    <aside aria-label="On this page" className="docs-toc">
      <div
        className="docs-toc__title"
        style={getMaterialTypeCssProperties('titleSmall')}
      >
        On this page
      </div>
      <nav>
        {toc.map((item) => (
          <TOCItem
            className="docs-toc__link"
            href={item.url}
            key={item.url}
            style={
              {
                '--docs-toc-depth': Math.max(0, item.depth - 2),
                ...getMaterialTypeCssProperties('bodySmall'),
              } as CSSProperties
            }
          >
            {item.title}
          </TOCItem>
        ))}
      </nav>
    </aside>
  );
}

function Workspace({
  currentPath,
  title,
  description,
  toc,
  showToc,
  children,
}: DocsShellProps & { currentPath: string; showToc: boolean }) {
  const resolvedToc = toc ? [...toc] : [];
  const hasToc = showToc && resolvedToc.length > 0;

  return (
    <AnchorProvider toc={resolvedToc}>
      <div className="docs-scroll-region">
        <div className="docs-workspace" data-has-toc={hasToc || undefined}>
          <main className="docs-main">
            <div className="docs-main__inner">
              <Breadcrumbs currentPath={currentPath} />
              <article className="docs-article">
                <header className="docs-page-header">
                  <h1
                    className="docs-page-title"
                    style={getMaterialTypeCssProperties('headlineLarge')}
                  >
                    {title}
                  </h1>
                  {description ? (
                    <p
                      className="docs-page-description"
                      style={getMaterialTypeCssProperties('bodyLarge')}
                    >
                      {description}
                    </p>
                  ) : null}
                </header>
                {children}
              </article>
              <PageNavigation currentPath={currentPath} />
            </div>
          </main>
          {hasToc ? <PageToc toc={resolvedToc} /> : null}
        </div>
      </div>
    </AnchorProvider>
  );
}

export function DocsShell({ title, description, toc, children }: DocsShellProps) {
  const { preference, cyclePreference } = useDocsTheme();
  const drawerState = useDrawerState();
  const { windowSizeClass } = useWindowAdaptiveInfo();
  const currentPath = normalizePath(window.location.pathname);
  const widthClass = windowSizeClass.width;
  const permanentSidebar =
    widthClass === 'expanded' ||
    widthClass === 'large' ||
    widthClass === 'extra-large';
  const showToc = widthClass === 'large' || widthClass === 'extra-large';

  useEffect(() => {
    if (permanentSidebar) drawerState.close();
  }, [drawerState, permanentSidebar]);

  const appBar = (
    <TopAppBar
      navigationIcon={
        permanentSidebar ? undefined : (
          <IconButton aria-label="Open navigation" onPress={() => drawerState.open()}>
            <MenuGlyph />
          </IconButton>
        )
      }
      title={
        <a className="docs-app-bar__brand" href="/docs">
          m3-ui
        </a>
      }
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
  );

  const workspace = (
    <Workspace
      currentPath={currentPath}
      description={description}
      showToc={showToc}
      title={title}
      toc={toc}
    >
      {children}
    </Workspace>
  );

  return (
    <Scaffold className="docs-scaffold" topBar={appBar}>
      {(innerPadding) => (
        <div
          className="docs-scaffold__body"
          style={{
            paddingBlockStart: innerPadding.top,
            paddingBlockEnd: innerPadding.bottom,
            paddingInlineStart: innerPadding.start,
            paddingInlineEnd: innerPadding.end,
          }}
        >
          {permanentSidebar ? (
            <PermanentNavigationDrawer
              className="docs-permanent-drawer"
              drawerContent={
                <PermanentDrawerSheet
                  aria-label="Documentation navigation"
                  className="docs-sidebar"
                  width={304}
                >
                  <DocsSidebar currentPath={currentPath} />
                </PermanentDrawerSheet>
              }
            >
              {workspace}
            </PermanentNavigationDrawer>
          ) : (
            <ModalNavigationDrawer
              className="docs-modal-drawer"
              drawerContent={
                <ModalDrawerSheet
                  aria-label="Documentation navigation"
                  className="docs-sidebar"
                  width="min(304px, calc(100vw - 32px))"
                >
                  <DocsSidebar
                    currentPath={currentPath}
                    onClose={() => drawerState.close()}
                    onNavigate={() => drawerState.close()}
                  />
                </ModalDrawerSheet>
              }
              state={drawerState}
            >
              {workspace}
            </ModalNavigationDrawer>
          )}
        </div>
      )}
    </Scaffold>
  );
}
