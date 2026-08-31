import baseConfig from './style-dictionary.base.mjs';
import { createCardCss } from './style-dictionary/card-css.mjs';
import { createCheckboxCss } from './style-dictionary/checkbox-css.mjs';

export default {
  ...baseConfig,
  hooks: {
    ...(baseConfig.hooks ?? {}),
    formats: {
      ...(baseConfig.hooks?.formats ?? {}),
      'm3/card-css': createCardCss,
      'm3/checkbox-css': createCheckboxCss,
    },
  },
  platforms: {
    ...baseConfig.platforms,
    css: {
      ...baseConfig.platforms.css,
      files: [
        ...baseConfig.platforms.css.files,
        { destination: 'card.css', format: 'm3/card-css' },
        { destination: 'checkbox.css', format: 'm3/checkbox-css' },
      ],
    },
  },
};
