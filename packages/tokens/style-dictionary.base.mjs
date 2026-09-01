import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';
import { createThemeCss } from './style-dictionary/theme-css.mjs';

export default {
  source: ['tokens/**/*.json'],
  log: {
    warnings: logWarningLevels.error,
    errors: { brokenReferences: logBrokenReferenceLevels.throw },
  },
  hooks: {
    formats: {
      'm3/theme-css': createThemeCss,
    },
  },
  platforms: {
    js: {
      transformGroup: transformGroups.js,
      buildPath: 'dist/generated/',
      options: { showFileHeader: false },
      files: [
        { destination: 'tokens.js', format: formats.javascriptEs6 },
        {
          destination: 'tokens.d.ts',
          format: formats.typescriptEs6Declarations,
          options: { outputStringLiterals: true },
        },
      ],
    },
    css: {
      transformGroup: transformGroups.css,
      buildPath: 'dist/generated/',
      options: { showFileHeader: false },
      files: [{ destination: 'theme.css', format: 'm3/theme-css' }],
    },
  },
};
