'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  HorizontalDivider,
  IconButton,
  ModalDrawerSheet,
  ModalNavigationDrawer,
  NavigationDrawerButton,
  NavigationDrawerLink,
  NavigationRail,
  NavigationRailLink,
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
type DocsNavDestinationNode = DocsNavPage | DocsNavFolder;

interface DocsNavigation {
  name: string;
  children: DocsNavNode[];
}

interface DocsTrailItem {
  name: string;
  url?: string;
}

interface TopLevelDestination {
  key: string;
  name: string;
  node: DocsNavDestinationNode;
  page: DocsNavPage;
}

export interface DocsShellProps {
  title: ReactNode;
  description?: ReactNode;
  toc?: readonly TOCItemType[];
  children: ReactNode;
}

const docsNavigation = docsNavigationData as unknown as DocsNavigation;

function normalizePath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
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

function BackGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2Z" fill="currentColor" />
    </svg>
  );
}

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        d={
          open
            ? 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z'
            : 'm9.29 6.71 1.42-1.42L17.41 12l-6.7 6.71-1.42-1.42L14.59 12 9.29 6.71Z'
        }
        fill="currentColor"
      />
    </svg>
  );
}

function HomeGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m12 3 9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8Z" fill="currentColor" />
    </svg>
  );
}

function FolderGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M3 5h7l2 2h9v12H3V5Zm2 4v8h14V9H5Z" fill="currentColor" />
    </svg>
  );
}

function PageGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M6 2h8l4 4v16H6V2Zm2 2v16h8V8h-4V4H8Zm6 .83V6h1.17L14 4.83Z" fill="currentColor" />
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
      continue;
    }
    if (node.type === 'folder') {
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

function destinationPage(node: DocsNavDestinationNode): DocsNavPage | undefined {
  if (node.type === 'page') return node;
  return node.index ?? flattenPages(node.children)[0];
}

function getTopLevelDestinations(nodes: readonly DocsNavNode[]): TopLevelDestination[] {
  const destinations: TopLevelDestination[] = [];
  nodes.forEach((node, index) => {
    if (node.type === 'separator') return;
    const page = destinationPage(node);
    if (!page) return;
    destinations.push({
      key: `${node.type}-${normalizePath(page.url)}-${index}`,
      name: normalizePath(page.url) === '/docs' ? 'Home' : node.name,
      node,
      page,
    });
  });
  return destinations;
}

const topLevelDestinations = getTopLevelDestinations(docsNavigation.children);

function findActiveDestination(currentPath: string): TopLevelDestination | undefined {
  return topLevelDestinations.find((destination) =>
    nodeContainsPath(destination.node, currentPath),
  );
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
  return (
    <NavigationDrawerLink
      href={page.url}
      onPress={onNavigate}
      selected={normalizePath(page.url) === currentPath}
      title={page.description}
    >
      {overview ? 'Overview' : page.name}
    </NavigationDrawerLink>
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
      <div className="docs-nav__folder" key={`folder-${node.name}-${index}`}>
        <div
          className="docs-nav__folder-label"
          style={getMaterialTypeCssProperties('titleSmall')}
        >
          {node.name}
        </div>
        {body}
      </div>
    );
  }

  return (
    <div className="docs-nav__folder" key={`folder-${node.name}-${index}`}>
      <NavigationDrawerButton
        aria-expanded={open}
        badge={<ChevronGlyph open={open} />}
        onPress={() => setOpen((value) => !value)}
      >
        {node.name}
      </NavigationDrawerButton>
      {open ? body : null}
    </div>
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
          return (
            <div key={`separator-${depth}-${node.name}-${index}`}>
              <HorizontalDivider className="docs-nav__divider" />
              {node.name ? (
                <div
                  className="docs-nav__separator"
                  style={getMaterialTypeCssProperties('titleSmall')}
                >
                  {node.name}
                </div>
              ) : null}
            </div>
          );
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

function SidebarHeader({
  subtitle,
  onClose,
  onNavigate,
}: {
  subtitle: string;
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="docs-sidebar__header">
      <Link className="docs-sidebar__brand" href="/docs" onClick={onNavigate}>
        <span style={getMaterialTypeCssProperties('titleLarge')}>m3-ui</span>
        <span
          className="docs-sidebar__brand-subtitle"
          style={getMaterialTypeCssProperties('bodyMedium')}
        >
          {subtitle}
        </span>
      </Link>
      {onClose ? (
        <IconButton aria-label="Close navigation" onPress={onClose}>
          <CloseGlyph />
        </IconButton>
      ) : null}
    </div>
  );
}

function ContextualNavigation({
  section,
  currentPath,
  onNavigate,
}: {
  section: DocsNavFolder;
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {section.index ? (
        <NavLink
          currentPath={currentPath}
          onNavigate={onNavigate}
          overview
          page={section.index}
        />
      ) : null}
      <NavNodes
        currentPath={currentPath}
        nodes={section.children}
        onNavigate={onNavigate}
      />
    </>
  );
}

function MainMenu({
  activeDestination,
  currentPath,
  onNavigate,
  onOpenSection,
}: {
  activeDestination?: TopLevelDestination;
  currentPath: string;
  onNavigate: () => void;
  onOpenSection: (destination: TopLevelDestination) => void;
}) {
  return (
    <>
      {topLevelDestinations.map((destination) => {
        if (destination.node.type === 'folder') {
          return (
            <NavigationDrawerButton
              aria-label={`Open ${destination.name} navigation`}
              key={destination.key}
              onPress={() => onOpenSection(destination)}
              selected={activeDestination?.key === destination.key}
            >
              {destination.name}
            </NavigationDrawerButton>
          );
        }

        return (
          <NavigationDrawerLink
            href={destination.page.url}
            key={destination.key}
            onPress={onNavigate}
            selected={normalizePath(destination.page.url) === currentPath}
          >
            {destination.name}
          </NavigationDrawerLink>
        );
      })}
    </>
  );
}

function ModalSidebar({
  activeDestination,
  currentPath,
  sectionDestination,
  onBack,
  onClose,
  onNavigate,
  onOpenSection,
}: {
  activeDestination?: TopLevelDestination;
  currentPath: string;
  sectionDestination?: TopLevelDestination;
  onBack: () => void;
  onClose: () => void;
  onNavigate: () => void;
  onOpenSection: (destination: TopLevelDestination) => void;
}) {
  const section =
    sectionDestination?.node.type === 'folder' ? sectionDestination.node : undefined;

  return (
    <div className="docs-sidebar__content">
      <SidebarHeader
        onClose={onClose}
        onNavigate={onNavigate}
        subtitle={section ? section.name : 'Documentation'}
      />
      <nav aria-label="Documentation" className="docs-nav">
        {section ? (
          <>
            <NavigationDrawerButton icon={<BackGlyph />} onPress={onBack}>
              Main menu
            </NavigationDrawerButton>
            <ContextualNavigation
              currentPath={currentPath}
              onNavigate={onNavigate}
              section={section}
            />
          </>
        ) : (
          <MainMenu
            activeDestination={activeDestination}
            currentPath={currentPath}
            onNavigate={onNavigate}
            onOpenSection={onOpenSection}
          />
        )}
      </nav>
    </div>
  );
}

function PersistentSidebar({
  section,
  currentPath,
}: {
  section: DocsNavFolder;
  currentPath: string;
}) {
  return (
    <div className="docs-sidebar__content">
      <SidebarHeader subtitle={section.name} />
      <nav aria-label={`${section.name} navigation`} className="docs-nav">
        <ContextualNavigation currentPath={currentPath} section={section} />
      </nav>
    </div>
  );
}

function DestinationIcon({ destination }: { destination: TopLevelDestination }) {
  if (normalizePath(destination.page.url) === '/docs') return <HomeGlyph />;
  if (destination.node.type === 'folder') return <FolderGlyph />;
  return <PageGlyph />;
}

function GlobalNavigationRail({
  activeDestination,
}: {
  activeDestination?: TopLevelDestination;
}) {
  return (
    <NavigationRail
      aria-label="Documentation sections"
      className="docs-global-rail"
      itemSemantics="links"
    >
      {topLevelDestinations.map((destination) => (
        <NavigationRailLink
          href={destination.page.url}
          icon={<DestinationIcon destination={destination} />}
          key={destination.key}
          label={destination.name}
          selected={activeDestination?.key === destination.key}
        />
      ))}
    </NavigationRail>
  );
}

function Breadcrumbs({ currentPath }: { currentPath: string }) {
  if (currentPath === '/docs') return null;
  const trail = findTrail(docsNavigation.children, currentPath) ?? [];
  const typeStyle = getMaterialTypeCssProperties('bodyMedium');

  return (
    <nav aria-label="Breadcrumb" className="docs-breadcrumbs">
      <ol>
        <li>
          <Link href="/docs" style={typeStyle}>Docs</Link>
        </li>
        {trail.map((item, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={`${item.name}-${index}`}>
              {current || !item.url ? (
                <span aria-current={current ? 'page' : undefined} style={typeStyle}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} style={typeStyle}>{item.name}</Link>
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
        <Link className="docs-page-navigation__link" href={previous.url} rel="prev">
          <span style={getMaterialTypeCssProperties('bodyMedium')}>Previous</span>
          <strong style={getMaterialTypeCssProperties('titleMedium')}>
            {previous.name}
          </strong>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          className="docs-page-navigation__link docs-page-navigation__link--next"
          href={next.url}
          rel="next"
        >
          <span style={getMaterialTypeCssProperties('bodyMedium')}>Next</span>
          <strong style={getMaterialTypeCssProperties('titleMedium')}>
            {next.name}
          </strong>
        </Link>
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
                ...getMaterialTypeCssProperties('bodyMedium'),
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
  const currentPath = normalizePath(usePathname());
  const widthClass = windowSizeClass.width;
  const showRail =
    widthClass === 'expanded' ||
    widthClass === 'large' ||
    widthClass === 'extra-large';
  const persistentContext =
    widthClass === 'large' || widthClass === 'extra-large';
  const showToc = widthClass === 'extra-large';
  const activeDestination = findActiveDestination(currentPath);
  const activeSection =
    activeDestination?.node.type === 'folder' ? activeDestination.node : undefined;
  const [modalSectionKey, setModalSectionKey] = useState<string | null>(
    activeSection ? activeDestination?.key ?? null : null,
  );
  const modalSectionDestination = topLevelDestinations.find(
    (destination) => destination.key === modalSectionKey,
  );
  const hasPersistentContext = Boolean(persistentContext && activeSection);

  useEffect(() => {
    if (activeSection && activeDestination) {
      setModalSectionKey(activeDestination.key);
    } else {
      setModalSectionKey(null);
    }
  }, [activeDestination, activeSection, currentPath]);

  useEffect(() => {
    if (hasPersistentContext) drawerState.close();
  }, [drawerState, hasPersistentContext]);

  const closeNavigation = () => drawerState.close();
  const openNavigation = () => {
    setModalSectionKey(activeSection && activeDestination ? activeDestination.key : null);
    drawerState.open();
  };

  const showNavigationAction = !showRail || (widthClass === 'expanded' && activeSection);

  const appBar = (
    <TopAppBar
      navigationIcon={
        showNavigationAction ? (
          <IconButton aria-label="Open navigation" onPress={openNavigation}>
            <MenuGlyph />
          </IconButton>
        ) : undefined
      }
      title={<Link className="docs-app-bar__brand" href="/docs">m3-ui</Link>}
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

  const navigationStage = hasPersistentContext && activeSection ? (
    <PermanentNavigationDrawer
      className="docs-permanent-drawer"
      drawerContent={
        <PermanentDrawerSheet
          aria-label={`${activeSection.name} navigation`}
          className="docs-sidebar"
        >
          <PersistentSidebar currentPath={currentPath} section={activeSection} />
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
        >
          <ModalSidebar
            activeDestination={activeDestination}
            currentPath={currentPath}
            onBack={() => setModalSectionKey(null)}
            onClose={closeNavigation}
            onNavigate={closeNavigation}
            onOpenSection={(destination) => setModalSectionKey(destination.key)}
            sectionDestination={modalSectionDestination}
          />
        </ModalDrawerSheet>
      }
      state={drawerState}
    >
      {workspace}
    </ModalNavigationDrawer>
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
          {showRail ? (
            <div className="docs-multi-pane">
              <GlobalNavigationRail activeDestination={activeDestination} />
              <div className="docs-navigation-stage">{navigationStage}</div>
            </div>
          ) : (
            navigationStage
          )}
        </div>
      )}
    </Scaffold>
  );
}
