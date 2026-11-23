import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // WXT defaults Firefox to MV2.
  manifestVersion: 3,
  manifest: {
    name: 'Histrail',
    description: 'A local search engine for everything you’ve browsed.',
  },
});
