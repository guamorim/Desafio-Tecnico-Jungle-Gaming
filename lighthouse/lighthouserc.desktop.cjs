const {
  createLighthouseConfig,
} = require("./lighthouserc.shared.cjs");

module.exports = createLighthouseConfig({
  outputDirectory: "./lighthouse-reports/desktop",
  settings: {
    preset: "desktop",
  },
});
