import type { MDXComponents } from 'mdx/types';
import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
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
  OutlinedTextField,
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
  componentDocs,
  type ComponentDocId,
} from './componentDocs';
import {
  ColorRoleGrid,
  DynamicColorPreview,
  TypeScaleSamples,
} from './foundationDemos';
import {
  CheckboxPreview,
  RadioButtonPreview,
  SliderPreview,
  SwitchPreview,
} from './selectionControlDemos';

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

function Anchor({ style, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className="docs-link"
      style={{ ...getMaterialTypeCssProperties('bodyLarge'), ...style }}
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

function MaterialParity({ component }: { component: ComponentDocId }) {
  const metadata = componentDocs[component];

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
          Material contract
        </div>
        <dl className="docs-parity__list">
          <div>
            <dt style={getMaterialTypeCssProperties('labelLarge')}>Family</dt>
            <dd style={getMaterialTypeCssProperties('bodyMedium')}>
              <a className="docs-link" href={metadata.materialUrl}>
                {metadata.family}
              </a>
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

export const materialMdxComponents = {
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
  MaterialParity,
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

export function getMdxComponents(
  components?: MDXComponents,
): MDXComponents {
  return {
    ...materialMdxComponents,
    ...components,
  };
}
