import {
  componentDocs,
  type ComponentDocMetadata,
} from './componentDocs';
import { smallPrimitiveDocs } from './smallPrimitiveDocs';

export const allComponentDocs = {
  ...componentDocs,
  ...smallPrimitiveDocs,
} as const satisfies Record<string, ComponentDocMetadata>;

export type AllComponentDocId = keyof typeof allComponentDocs;
