import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';

export default {
  source: ['tokens/**/*.json'],

  log: {
    warnings: logWarningLevels.error,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw,
    },
  },

  platforms: {
    js: {
      transformGroup: transformGroups.js,
      buildPath: 'dist/generated/',
      options: {
        showFileHeader: false,
      },
      files: [
        {
          destination: 'tokens.js',
          format: formats.javascriptEs6,
        },
        {
          destination: 'tokens.d.ts',
          format: formats.typescriptEs6Declarations,
          options: {
            outputStringLiterals: true,
          },
        },
      ],
    },
  },
};
