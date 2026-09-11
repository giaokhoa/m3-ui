import type { MDXComponents } from 'mdx/types';
import type { PropsWithChildren, ReactNode } from 'react';
import { Surface, getMaterialTypeCssProperties } from '@m3-ui/ui';
import { allComponentProvenance } from './allComponentProvenance';
import type { AllComponentDocId } from './allComponentDocs';
import type { ProvenanceClass } from './provenance';
import './componentPageMdxComponents.css';

type SourceKind = ProvenanceClass;

type SourceLink = {
  label: string;
  href: string;
  kind?: SourceKind;
};

type AnatomyItem = {
  name: string;
  description: string;
};

type RelatedComponent = {
  label: string;
  href: string;
  description?: string;
};

function ComponentHero({
  definition,
  eyebrow = 'Material component',
}: {
  definition: string;
  eyebrow?: string;
}) {
  return (
    <Surface
      className="docs-component-hero"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-component-hero__content">
        <div
          className="docs-component-hero__eyebrow"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          {eyebrow}
        </div>
        <p
          className="docs-component-hero__definition"
          style={getMaterialTypeCssProperties('titleLarge')}
        >
          {definition}
        </p>
      </div>
    </Surface>
  );
}

function SourceLinks({ links }: { links: readonly SourceLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav className="docs-source-links" aria-label="Authoritative sources">
      {links.map((link) => (
        <a
          className="docs-source-link"
          href={link.href}
          key={`${link.kind ?? 'source'}:${link.href}`}
        >
          <span style={getMaterialTypeCssProperties('labelMedium')}>
            {link.kind ?? 'source'}
          </span>
          <span style={getMaterialTypeCssProperties('labelLarge')}>
            {link.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

function GuidanceCallout({
  title,
  children,
  kind = 'guidance',
}: PropsWithChildren<{
  title: string;
  kind?: 'guidance' | 'web' | 'adaptation' | 'caution';
}>) {
  return (
    <Surface
      className={`docs-guidance docs-guidance--${kind}`}
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-guidance__content">
        <div
          className="docs-guidance__title"
          style={getMaterialTypeCssProperties('titleSmall')}
        >
          {title}
        </div>
        <div
          className="docs-guidance__body"
          style={getMaterialTypeCssProperties('bodyMedium')}
        >
          {children}
        </div>
      </div>
    </Surface>
  );
}

function AnatomyBlock({ items }: { items: readonly AnatomyItem[] }) {
  return (
    <ol className="docs-anatomy">
      {items.map((item, index) => (
        <li className="docs-anatomy__item" key={`${item.name}:${index}`}>
          <span
            className="docs-anatomy__index"
            aria-hidden="true"
            style={getMaterialTypeCssProperties('labelLarge')}
          >
            {index + 1}
          </span>
          <span className="docs-anatomy__copy">
            <strong style={getMaterialTypeCssProperties('titleSmall')}>
              {item.name}
            </strong>
            <span style={getMaterialTypeCssProperties('bodyMedium')}>
              {item.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function FidelitySummary({
  component,
  adaptations: pageAdaptations = [],
  knownGaps: pageKnownGaps = [],
}: {
  component: AllComponentDocId;
  adaptations?: readonly string[];
  knownGaps?: readonly string[];
}) {
  const metadata = allComponentProvenance[component];
  const familyUrl = metadata.material.overview ?? metadata.compose.url;
  const adaptations = [...metadata.adaptations, ...pageAdaptations];
  const knownGaps = [...metadata.knownGaps, ...pageKnownGaps];

  return (
    <Surface
      className="docs-fidelity"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-fidelity__content">
        <div
          className="docs-fidelity__eyebrow"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Material provenance and fidelity
        </div>
        <dl className="docs-fidelity__list">
          <FidelityRow label="Family">
            {familyUrl ? (
              <a className="docs-link" href={familyUrl}>
                {metadata.family}
              </a>
            ) : (
              metadata.family
            )}
          </FidelityRow>
          <FidelityRow label="Provenance">
            {metadata.evidence.map((source, index) => (
              <span key={`${source.class}:${source.label}`}>
                {index > 0 ? ' · ' : null}
                {source.url ? (
                  <a className="docs-link" href={source.url}>
                    {source.class}: {source.label}
                  </a>
                ) : (
                  `${source.class}: ${source.label}`
                )}
              </span>
            ))}
          </FidelityRow>
          <FidelityRow label="Compose mapping">
            {metadata.compose.apis.join(' · ')}
          </FidelityRow>
          <FidelityRow label="Visual fidelity">
            {metadata.fidelity.visual.status}: {metadata.fidelity.visual.summary}
          </FidelityRow>
          <FidelityRow label="Behavior fidelity">
            {metadata.fidelity.behavior.status}: {metadata.fidelity.behavior.summary}
          </FidelityRow>
          <FidelityRow label="Semantics fidelity">
            {metadata.fidelity.semantics.status}: {metadata.fidelity.semantics.summary}
          </FidelityRow>
          {adaptations.length > 0 ? (
            <FidelityRow label="Adaptations">
              <CompactList items={adaptations} />
            </FidelityRow>
          ) : null}
          {knownGaps.length > 0 ? (
            <FidelityRow label="Known gaps">
              <CompactList items={knownGaps} />
            </FidelityRow>
          ) : null}
        </dl>
      </div>
    </Surface>
  );
}

function FidelityRow({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <dt style={getMaterialTypeCssProperties('labelLarge')}>{label}</dt>
      <dd style={getMaterialTypeCssProperties('bodyMedium')}>{children}</dd>
    </div>
  );
}

function CompactList({ items }: { items: readonly string[] }) {
  return (
    <ul className="docs-compact-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function RelatedComponents({
  items,
}: {
  items: readonly RelatedComponent[];
}) {
  return (
    <nav className="docs-related" aria-label="Related components">
      {items.map((item) => (
        <a className="docs-related__item" href={item.href} key={item.href}>
          <strong style={getMaterialTypeCssProperties('titleSmall')}>
            {item.label}
          </strong>
          {item.description ? (
            <span style={getMaterialTypeCssProperties('bodyMedium')}>
              {item.description}
            </span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}

function GeneratedApiReferenceSlot({
  component,
  children,
}: PropsWithChildren<{ component: string }>) {
  return (
    <Surface
      className="docs-generated-slot"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-generated-slot__content">
        <div style={getMaterialTypeCssProperties('titleSmall')}>
          Generated API reference · {component}
        </div>
        <div style={getMaterialTypeCssProperties('bodyMedium')}>
          {children ??
            'Reserved for the generated public TypeScript API renderer. Do not replace this slot with a handwritten prop table.'}
        </div>
      </div>
    </Surface>
  );
}

function PageSectionNote({ children }: { children: ReactNode }) {
  return <div className="docs-section-note">{children}</div>;
}

export const componentPageMdxComponents = {
  ComponentHero,
  SourceLinks,
  GuidanceCallout,
  AnatomyBlock,
  FidelitySummary,
  RelatedComponents,
  GeneratedApiReferenceSlot,
  PageSectionNote,
} satisfies MDXComponents;
