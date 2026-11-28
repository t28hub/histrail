import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // WXT defaults Firefox to MV2.
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'Histrail',
    description: 'A local search engine for everything you’ve browsed.',
    // Pages from private windows must never be captured.
    incognito: 'not_allowed',
    ...(browser === 'chrome' && {
      minimum_chrome_version: '120',
    }),
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: '@histrail.t28hub',
          strict_min_version: '140.0',
          data_collection_permissions: {
            required: ['none'],
          },
        },
      },
    }),
  }),
});
