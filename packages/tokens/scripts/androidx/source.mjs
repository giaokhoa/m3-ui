import { material3Sources } from '../sources.mjs';

export const androidX = material3Sources.compose;

// Legacy narrow mappings remain here only while the full canonical corpus is being
// expanded. Completeness is tracked independently by the source inventory audit;
// this list must not be mistaken for the Material 3 token-file inventory.
export const tokenSources = [
  'ElevationTokens.kt',
  'StateTokens.kt',
  'SwitchTokens.kt',
  'FilledButtonTokens.kt',
  'FilledCardTokens.kt',
  'CheckboxTokens.kt',
  'RadioButtonTokens.kt',
  'AssistChipTokens.kt',
  'FilledTextFieldTokens.kt',
].map((file) => ({ file, path: `${androidX.tokenRoot}/${file}` }));
