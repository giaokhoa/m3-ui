import baseConfig from './style-dictionary.base.mjs';
import { createCheckboxCss } from './style-dictionary/checkbox-css.mjs';

export default {
  ...baseConfig,
  hooks: {
    ...(baseConfig.hooks ?? {}),
    formats: {
      ...(baseConfig.hooks?.formats ?? {}),
      'm3/checkbox-css': createCheckboxCss,
    },
  },
  platforms: {
    ...baseConfig.platforms,
    css: {
      ...baseConfig.platforms.css,
      files: [
        ...baseConfig.platforms.css.files,
        { destination: 'checkbox.css', format: 'm3/checkbox-css' },
      ],
    },
  },
};
