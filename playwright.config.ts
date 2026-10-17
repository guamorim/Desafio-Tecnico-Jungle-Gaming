import {
  defineConfig,
  devices,
} from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
const isContinuousIntegration = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 2 : 0,
  workers: isContinuousIntegration ? 1 : undefined,
  reporter: [
    ["line"],
    ["html", { open: "never" }],
  ],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      testIgnore: "**/tablet.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
    {
      name: "mobile-chromium",
      testIgnore: "**/tablet.spec.ts",
      use: {
        ...devices["Pixel 5"],
        viewport: {
          width: 390,
          height: 844,
        },
      },
    },
    {
      name: "tablet-chromium",
      testMatch: "**/tablet.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 768,
          height: 1024,
        },
      },
    },
  ],
  webServer: {
    command:
      "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: baseURL,
    reuseExistingServer: !isContinuousIntegration,
    timeout: 120_000,
  },
});
