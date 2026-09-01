import {
  allComponentDocs,
  type AllComponentDocId,
} from './allComponentDocs';
import {
  resolveComponentProvenance,
  type ComponentProvenanceMetadata,
  type ComponentProvenanceOverride,
} from './provenance';

/**
 * Sparse enrichments only. The canonical documented inventory remains
 * allComponentDocs; do not mirror every component ID here.
 */
export const componentProvenanceOverrides: Partial<
  Record<AllComponentDocId, ComponentProvenanceOverride>
> = {};

export const allComponentProvenance = Object.fromEntries(
  (Object.entries(allComponentDocs) as Array<
    [AllComponentDocId, (typeof allComponentDocs)[AllComponentDocId]]
  >).map(([id, metadata]) => [
    id,
    resolveComponentProvenance(metadata, componentProvenanceOverrides[id]),
  ]),
) as Record<AllComponentDocId, ComponentProvenanceMetadata>;
