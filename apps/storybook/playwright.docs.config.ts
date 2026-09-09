import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './docs-browser',
  outputDir: './docs-test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { outputFolder: 'docs-playwright-report', open: 'never' }],
      ]
    : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'no-preference',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium-docs',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm --filter @m3-ui/docs start',
    url: 'http://127.0.0.1:4173/docs',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
