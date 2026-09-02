'use client';

import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  ComponentType,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import {
  Button,
  Dialog,
  DialogAction,
  DialogActions,
  DialogCloseAction,
  DialogDescription,
  DialogIcon,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  OutlinedSecureTextField,
  OutlinedTextField,
  SecureTextField,
  Surface,
  TextButton,
  TextField,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import {
  CardPreview,
  ChipPreview,
  FabPreview,
  IconButtonPreview,
} from './actionSurfaceDemos';
import {
  allComponentDocs,
  type AllComponentDocId,
} from './allComponentDocs';
import { ApiReference } from './apiReference';
import type { ComponentDocMetadata } from './componentDocs';
import {
  ColorRoleGrid,
  DynamicColorPreview,
  TypeScaleSamples,
} from './foundationDemos';
import { LiveExample } from './liveExample';
import { MaterialSpecTable } from './materialSpecTable';
import {
  CheckboxPreview,
  RadioButtonPreview,
  SliderPreview,
  SwitchPreview,
} from './selectionControlDemos';
import { componentPageMdxComponents } from './componentPageMdxComponents';
import { feedbackSearchMdxComponents } from './feedbackSearchMdxComponents';
import { groupedControlMdxComponents } from './groupedControlMdxComponents';
import { contentPrimitiveMdxComponents } from './contentPrimitiveMdxComponents';
import { pickerMdxComponents } from './pickerMdxComponents';
import { carouselSheetMdxComponents } from './carouselSheetMdxComponents';
import { composeUtilityMdxComponents } from './composeUtilityMdxComponents';
import { smallPrimitiveMdxComponents } from './smallPrimitiveMdxComponents';
import { appBarToolbarMdxComponents } from './appBarToolbarMdxComponents';
import { actionOverflowMdxComponents } from './actionOverflowMdxComponents';
import { parityMdxComponents } from './parityMdxComponents';

function Heading1({ style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className="docs-heading docs-heading--1"
      style={{ ...getMaterialTypeCssProperties('headlineLarge'), ...style }}
    />
  );
}

function Heading2({ style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className="docs-heading docs-heading--2"
      style={{ ...getMaterialTypeCssProperties('headlineMedium'), ...style }}
    />
  );
}

function Heading3({ style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className="docs-heading docs-heading--3"
      style={{ ...getMaterialTypeCssProperties('headlineSmall'), ...style }}
    />
  );
}

function Heading4({ style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className="docs-heading docs-heading--4"
      style={{ ...getMaterialTypeCssProperties('titleLarge'), ...style }}
    />
  );
}

function Paragraph({ style, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className="docs-paragraph"
      style={{ ...getMaterialTypeCssProperties('bodyLarge'), ...style }}
    />
  );
}

function ListItem({ style, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      {...props}
      style={{ ...getMaterialTypeCssProperties('bodyLarge'), ...style }}
    />
  );
}

function Anchor({
  href,
  style,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const anchorStyle = {
    ...getMaterialTypeCssProperties('bodyLarge'),
    ...style,
  };

  if (typeof href === 'string' && href.startsWith('/')) {
    return (
      <Link
        {...props}
        className="docs-link"
        href={href}
        style={anchorStyle}
      />
    );
  }

  return (
    <a
      {...props}
      className="docs-link"
      href={href}
      style={anchorStyle}
    />
  );
}

function InlineCode({ style, ...props }: HTMLAttributes<HTMLElement>) {
  return <code {...props} className="docs-inline-code" style={style} />;
}

function CodeBlock({ style, ...props }: HTMLAttributes<HTMLPreElement>) {
  return (
    <Surface
      className="docs-code-surface"
      color="var(--surface-container)"
      contentColor="var(--on-surface)"
    >
      <pre
        {...props}
        className="docs-code-block"
        style={{ ...getMaterialTypeCssProperties('bodyMedium'), ...style }}
      />
    </Surface>
  );
}

function Blockquote({
  style,
  ...props
}: BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <Surface
      className="docs-quote-surface"
      color="var(--secondary-container)"
      contentColor="var(--on-secondary-container)"
    >
      <blockquote
        {...props}
        className="docs-blockquote"
        style={{ ...getMaterialTypeCssProperties('bodyLarge'), ...style }}
      />
    </Surface>
  );
}

function Table({ style, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="docs-table-scroll">
      <table
        {...props}
        className="docs-table"
        style={{ ...getMaterialTypeCssProperties('bodyMedium'), ...style }}
      />
    </div>
  );
}

function TableHeader({ style, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      style={{ ...getMaterialTypeCssProperties('titleSmall'), ...style }}
    />
  );
}

function TableCell({ style, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      style={{ ...getMaterialTypeCssProperties('bodyMedium'), ...style }}
    />
  );
}

function ComponentPreview({ children }: PropsWithChildren) {
  return (
    <Surface
      className="docs-preview"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-preview__content">{children}</div>
    </Surface>
  );
}

function MaterialParity({ component }: { component: AllComponentDocId }) {
  const metadata: ComponentDocMetadata = allComponentDocs[component];
  const referenceUrl = metadata.referenceUrl ?? metadata.materialUrl;

  return (
    <Surface
      className="docs-parity"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-parity__content">
        <div
          className="docs-parity__eyebrow"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          {metadata.contractLabel ?? 'Material contract'}
        </div>
        <dl className="docs-parity__list">
          <div>
            <dt style={getMaterialTypeCssProperties('labelLarge')}>Family</dt>
            <dd style={getMaterialTypeCssProperties('bodyMedium')}>
              {referenceUrl ? (
                <a className="docs-link" href={referenceUrl}>
                  {metadata.family}
                </a>
              ) : (
                metadata.family
              )}
            </dd>
          </div>
          <div>
            <dt style={getMaterialTypeCssProperties('labelLarge')}>Compose mapping</dt>
            <dd style={getMaterialTypeCssProperties('bodyMedium')}>
              {metadata.composeMapping.join(' · ')}
            </dd>
          </div>
          <div>
            <dt style={getMaterialTypeCssProperties('labelLarge')}>Implementation</dt>
            <dd style={getMaterialTypeCssProperties('bodyMedium')}>
              {metadata.implementation}
            </dd>
          </div>
          <div>
            <dt style={getMaterialTypeCssProperties('labelLarge')}>Web adaptation</dt>
            <dd style={getMaterialTypeCssProperties('bodyMedium')}>
              {metadata.webAdaptation}
            </dd>
          </div>
        </dl>
      </div>
    </Surface>
  );
}

const materialMdxComponents = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  p: Paragraph,
  li: ListItem,
  a: Anchor,
  code: InlineCode,
  pre: CodeBlock,
  blockquote: Blockquote,
  table: Table,
  th: TableHeader,
  td: TableCell,
  ComponentPreview,
  LiveExample,
  MaterialParity,
  ParitySummary: MaterialParity,
  ApiReference,
  MaterialSpecTable,
  ColorRoleGrid,
  DynamicColorPreview,
  TypeScaleSamples,
  CheckboxPreview,
  RadioButtonPreview,
  SwitchPreview,
  SliderPreview,
  CardPreview,
  ChipPreview,
  IconButtonPreview,
  FabPreview,
  Button,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  TextButton,
  TextField,
  OutlinedTextField,
  SecureTextField,
  OutlinedSecureTextField,
  DialogTrigger,
  DialogOverlay,
  Dialog,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogActions,
  DialogAction,
  DialogCloseAction,
} satisfies MDXComponents;

const docsMdxComponents = {
  ...materialMdxComponents,
  ...componentPageMdxComponents,
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
} satisfies MDXComponents;

export function MdxClientComponent({
  __mdxComponent,
  ...props
}: { __mdxComponent: string } & Record<string, unknown>) {
  const Component = docsMdxComponents[
    __mdxComponent as keyof typeof docsMdxComponents
  ] as ComponentType<Record<string, unknown>> | undefined;

  if (!Component) {
    throw new Error(`Unknown docs MDX component: ${__mdxComponent}`);
  }

  return <Component {...props} />;
}
