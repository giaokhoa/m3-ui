import { FidelitySummary } from './componentPageMdxComponents';
import { ParityCatalog } from './parityCatalog';

export const parityMdxComponents = {
  ParityCatalog,
  MaterialFidelity: FidelitySummary,
  // Backward-compatible names used by existing component MDX pages.
  MaterialParity: FidelitySummary,
  ParitySummary: FidelitySummary,
};
