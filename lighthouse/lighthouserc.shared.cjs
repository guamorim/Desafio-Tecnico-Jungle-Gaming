const baseUrl = "http://127.0.0.1:4173";

const categoryTargets = {
  "categories:performance": 0.9,
  "categories:accessibility": 0.95,
  "categories:best-practices": 0.95,
  "categories:seo": 0.9,
};

const assertions = Object.fromEntries(
  Object.entries(categoryTargets).map(
    ([audit, minScore]) => [
      audit,
      [
        "warn",
        {
          aggregationMethod: "median",
          minScore,
        },
      ],
    ],
  ),
);

function createLighthouseConfig({
  outputDirectory,
  settings,
}) {
  return {
    ci: {
      collect: {
        numberOfRuns: 3,
        startServerCommand:
          "npm run preview -- --host 127.0.0.1 --port 4173",
        startServerReadyPattern: "Local",
        startServerReadyTimeout: 120_000,
        url: [
          `${baseUrl}/`,
          `${baseUrl}/nfts/nft-aurora-ape`,
        ],
        settings: {
          chromeFlags: "--headless --no-sandbox",
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
          ...settings,
        },
      },
      assert: {
        assertions,
        includePassedAssertions: true,
      },
      upload: {
        target: "filesystem",
        outputDir: outputDirectory,
      },
    },
  };
}

module.exports = {
  categoryTargets,
  createLighthouseConfig,
};
