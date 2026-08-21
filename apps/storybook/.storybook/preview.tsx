import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '@m3/ui';
import '@m3/ui/styles.css';
import './preview.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Material theme mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => (
      <ThemeProvider
        className="m3-storybook-theme"
        mode={context.globals.theme === 'dark' ? 'dark' : 'light'}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
  },
};

export default preview;
