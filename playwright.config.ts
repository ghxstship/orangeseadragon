
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const useProductionServer = process.env.CI_E2E_PRODUCTION_SERVER !== 'false';
const playwrightPort = process.env.PLAYWRIGHT_PORT || '3000';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${playwrightPort}`;
const e2eEnvPrefix = 'PLAYWRIGHT_TEST=true';
const cleanBuildArtifactsCommand = "node -e \"const fs=require('fs');try{fs.rmSync('.next',{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch{}\"";
const webServerCommand = useProductionServer
  ? `${cleanBuildArtifactsCommand} && ${e2eEnvPrefix} npm run build && ${e2eEnvPrefix} npm run start -- -p ${playwrightPort}`
  : `${cleanBuildArtifactsCommand} && ${e2eEnvPrefix} npm run dev -- -p ${playwrightPort}`;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    ...(process.env.CI ? { workers: 1 } : {}),
    reporter: 'html',
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
    webServer: {
        command: webServerCommand,
        url: `${baseURL}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 600 * 1000,
    },
});
