import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    const storybookBasePath = process.env.STORYBOOK_BASE_PATH;
    return {
      ...config,
      ...(storybookBasePath ? { base: storybookBasePath } : {}),
      build: {
        ...config.build,
        // Keep the native :dir() semantics used by RTL selectors.
        cssTarget: ['chrome120', 'edge120', 'firefox114', 'safari16.4', 'ios16.4'],
      },
    };
  },
};

export default config;
