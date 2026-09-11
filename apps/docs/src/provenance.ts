import type { ComponentDocMetadata } from './componentDocs';

export type ProvenanceClass = 'spec' | 'compose' | 'web' | 'adaptation';

export interface ProvenanceEvidence {
  class: ProvenanceClass;
  label: string;
  url?: string;
}

export interface MaterialSourceLinks {
  overview?: string;
  guidelines?: string;
  spec?: string;
}

export interface ComposeEvidence {
  apis: readonly string[];
  url?: string;
}

export type FidelityStatus =
  | 'aligned'
  | 'adapted'
  | 'partial'
  | 'not-applicable';

export interface FidelityDimension {
  status: FidelityStatus;
  summary: string;
}

export interface ComponentProvenanceMetadata {
  family: string;
  material: MaterialSourceLinks;
  evidence: readonly ProvenanceEvidence[];
  compose: ComposeEvidence;
  fidelity: {
    visual: FidelityDimension;
    behavior: FidelityDimension;
    semantics: FidelityDimension;
  };
  adaptations: readonly string[];
  knownGaps: readonly string[];
}

export type ComponentProvenanceOverride = Partial<
  Omit<
    ComponentProvenanceMetadata,
    'family' | 'material' | 'compose' | 'fidelity'
  >
> & {
  family?: string;
  material?: Partial<MaterialSourceLinks>;
  compose?: Partial<ComposeEvidence>;
  fidelity?: Partial<ComponentProvenanceMetadata['fidelity']>;
};

function evidenceFromSources(
  metadata: ComponentDocMetadata,
  material: MaterialSourceLinks,
  compose: ComposeEvidence,
): ProvenanceEvidence[] {
  const evidence: ProvenanceEvidence[] = [];

  if (material.overview) {
    evidence.push({
      class: 'spec',
      label: 'Material 3 overview',
      url: material.overview,
    });
  }

  if (material.guidelines) {
    evidence.push({
      class: 'spec',
      label: 'Material 3 guidelines',
      url: material.guidelines,
    });
  }

  if (material.spec) {
    evidence.push({
      class: 'spec',
      label: 'Material 3 specification',
      url: material.spec,
    });
  }

  if (compose.url) {
    evidence.push({
      class: 'compose',
      label: metadata.contractLabel ?? 'AndroidX Compose Material3 reference',
      url: compose.url,
    });
  }

  evidence.push({
    class: 'web',
    label: 'Browser and React Aria semantics',
  });

  if (metadata.webAdaptation) {
    evidence.push({
      class: 'adaptation',
      label: 'm3-ui web adaptation',
    });
  }

  return evidence;
}

/**
 * Resolve legacy component-doc metadata into the structured provenance contract.
 * Defaults are intentionally conservative: legacy prose never becomes an
 * automatic claim of complete visual, behavior, or semantics parity.
 */
export function resolveComponentProvenance(
  metadata: ComponentDocMetadata,
  override: ComponentProvenanceOverride = {},
): ComponentProvenanceMetadata {
  const material: MaterialSourceLinks = {
    overview: override.material?.overview ?? metadata.materialUrl,
    guidelines: override.material?.guidelines,
    spec: override.material?.spec,
  };
  const compose: ComposeEvidence = {
    apis: override.compose?.apis ?? metadata.composeMapping,
    url: override.compose?.url ?? metadata.referenceUrl,
  };

  return {
    family: override.family ?? metadata.family,
    material,
    evidence: override.evidence ?? evidenceFromSources(metadata, material, compose),
    compose,
    fidelity: {
      visual:
        override.fidelity?.visual ?? {
          status: 'partial',
          summary: metadata.implementation,
        },
      behavior:
        override.fidelity?.behavior ?? {
          status: 'adapted',
          summary: metadata.webAdaptation,
        },
      semantics:
        override.fidelity?.semantics ?? {
          status: 'adapted',
          summary: metadata.webAdaptation,
        },
    },
    adaptations:
      override.adaptations ??
      (metadata.webAdaptation ? [metadata.webAdaptation] : []),
    knownGaps: override.knownGaps ?? [],
  };
}
