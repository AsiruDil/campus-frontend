import process from "node:process";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5174",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node ../campus-backend/tests/browser-server.js",
      url: "http://127.0.0.1:3001/api/jobs",
      timeout: 120000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5174 --strictPort",
      env: { VITE_BACKEND_URL: "http://127.0.0.1:3001" },
      url: "http://127.0.0.1:5174",
      timeout: 30000,
    },
  ],
});
