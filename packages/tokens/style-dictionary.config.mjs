import baseConfig from './style-dictionary.base.mjs';
import { loadCssAdapters } from './style-dictionary/adapter-registry.mjs';

const cssAdapters = await loadCssAdapters();

export default {
  ...baseConfig,
  hooks: {
    ...(baseConfig.hooks ?? {}),
    formats: {
      ...(baseConfig.hooks?.formats ?? {}),
      ...Object.fromEntries(
        cssAdapters.map((adapter) => [adapter.format, adapter.createCss]),
      ),
    },
  },
  platforms: {
    ...baseConfig.platforms,
    css: {
      ...baseConfig.platforms.css,
      files: [
        ...baseConfig.platforms.css.files,
        ...cssAdapters.map((adapter) => ({
          destination: adapter.destination,
          format: adapter.format,
        })),
      ],
    },
  },
};
