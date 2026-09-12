import Link from 'next/link';
import { getMaterialTypeCssProperties } from '@m3-ui/ui/typography';
import materialConformanceReport from './generated/material-conformance.generated.json';
import { Surface } from './mdxDirectComponents';
import { allComponentProvenance } from './allComponentProvenance';
import type { AllComponentDocId } from './allComponentDocs';
import type {
  ComponentProvenanceMetadata,
  FidelityDimension,
} from './provenance';
import './parity-catalog.css';

type CatalogEntry = readonly [AllComponentDocId, ComponentProvenanceMetadata];
type CapabilityStatus = 'supported' | 'adapted' | 'excluded' | 'gap';

interface CapabilityRecord {
  id: string;
  label: string;
  status: CapabilityStatus;
  publicSymbols?: readonly string[];
  reason?: string;
  evidence: readonly string[];
}

interface CapabilityFamilyRecord {
  id: string;
  capabilities: readonly CapabilityRecord[];
}

interface ReleaseFindingRecord {
  id: string;
  family: string;
  status: Exclude<CapabilityStatus, 'gap'>;
  reason: string;
  evidence: readonly string[];
}

const conformance = materialConformanceReport as unknown as {
  families: readonly CapabilityFamilyRecord[];
  reviewedReleaseFindings: readonly ReleaseFindingRecord[];
};

const capabilityCoverageById = new Map(
  conformance.families
    .filter((family) => family.capabilities.length > 0)
    .map((family) => [family.id, family.capabilities] as const),
);

const entries = (Object.entries(allComponentProvenance) as CatalogEntry[]).sort(
  ([leftId, left], [rightId, right]) =>
    left.family.localeCompare(right.family) || leftId.localeCompare(rightId),
);

function fidelityLabel(dimension: FidelityDimension): string {
  return `${dimension.status}: ${dimension.summary}`;
}

function capabilityLabel(capability: CapabilityRecord): string {
  const mapping = capability.publicSymbols?.length
    ? ` → ${capability.publicSymbols.join(', ')}`
    : '';
  const reason = capability.reason ? ` — ${capability.reason}` : '';
  return `${capability.label} [${capability.status}]${mapping}${reason}`;
}

export function ParityCatalog() {
  return (
    <div className="docs-parity-catalog">
      <p
        className="docs-parity-catalog__count"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        {entries.length} documented component contracts
      </p>
      <div className="docs-parity-catalog__entries">
        {entries.map(([id, metadata]) => {
          const capabilities = capabilityCoverageById.get(id);
          return (
            <Surface
              key={id}
              className="docs-parity-catalog__surface"
              color="var(--surface-container-low)"
              contentColor="var(--on-surface)"
            >
              <details className="docs-parity-catalog__entry">
                <summary
                  className="docs-parity-catalog__summary"
                  style={getMaterialTypeCssProperties('titleMedium')}
                >
                  <span>{metadata.family}</span>
                  <span
                    className="docs-parity-catalog__contract"
                    style={getMaterialTypeCssProperties('labelMedium')}
                  >
                    {capabilities?.length
                      ? `${capabilities.length} reviewed capabilities`
                      : 'Structured fidelity'}
                  </span>
                </summary>
                <div className="docs-parity-catalog__body">
                  <div className="docs-parity-catalog__links">
                    <Link
                      className="docs-link"
                      href={`/docs/components/${id}`}
                      style={getMaterialTypeCssProperties('labelLarge')}
                    >
                      Open guide
                    </Link>
                    {metadata.evidence.map((source) =>
                      source.url ? (
                        <a
                          key={`${source.class}:${source.url}`}
                          className="docs-link"
                          href={source.url}
                          style={getMaterialTypeCssProperties('labelLarge')}
                        >
                          {source.class}: {source.label}
                        </a>
                      ) : null,
                    )}
                  </div>
                  <dl className="docs-parity-catalog__details">
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Compose mapping
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.compose.apis.join(' · ')}
                      </dd>
                    </div>
                    {capabilities?.length ? (
                      <div>
                        <dt style={getMaterialTypeCssProperties('labelLarge')}>
                          Reviewed capability coverage
                        </dt>
                        <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                          <ul className="docs-parity-catalog__capabilities">
                            {capabilities.map((capability) => (
                              <li key={capability.id}>{capabilityLabel(capability)}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Visual fidelity
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {fidelityLabel(metadata.fidelity.visual)}
                      </dd>
                    </div>
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Behavior fidelity
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {fidelityLabel(metadata.fidelity.behavior)}
                      </dd>
                    </div>
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Semantics fidelity
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {fidelityLabel(metadata.fidelity.semantics)}
                      </dd>
                    </div>
                    {metadata.adaptations.length > 0 ? (
                      <div>
                        <dt style={getMaterialTypeCssProperties('labelLarge')}>
                          Adaptations
                        </dt>
                        <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                          {metadata.adaptations.join(' · ')}
                        </dd>
                      </div>
                    ) : null}
                    {metadata.knownGaps.length > 0 ? (
                      <div>
                        <dt style={getMaterialTypeCssProperties('labelLarge')}>
                          Known gaps
                        </dt>
                        <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                          {metadata.knownGaps.join(' · ')}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </details>
            </Surface>
          );
        })}
      </div>

      <h2
        className="docs-parity-catalog__release-title"
        style={getMaterialTypeCssProperties('headlineSmall')}
      >
        Reviewed 1.5.x release-note dispositions
      </h2>
      <Surface
        className="docs-parity-catalog__surface"
        color="var(--surface-container-low)"
        contentColor="var(--on-surface)"
      >
        <ul className="docs-parity-catalog__release-findings">
          {conformance.reviewedReleaseFindings.map((finding) => (
            <li key={finding.id} style={getMaterialTypeCssProperties('bodyMedium')}>
              <strong>{finding.family}</strong>: {finding.status} — {finding.reason}
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
