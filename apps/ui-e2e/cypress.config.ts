import { defineConfig } from 'cypress';
// Use the JS entry export that migrations expect; keep file ESM but import the preset by explicit path
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset.js';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'npx nx run ui:serve',
        production: 'npx nx run ui:serve-static',
      },
      ciWebServerCommand: 'npx nx run ui:serve-static',
      ciBaseUrl: 'http://localhost:4200',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
